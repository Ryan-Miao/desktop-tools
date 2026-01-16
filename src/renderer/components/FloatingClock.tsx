import React, { useState, useEffect } from 'react';

const FloatingClock: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [time, setTime] = useState(new Date());
  const [showStats, setShowStats] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isFloatingWindow, setIsFloatingWindow] = useState(false);

  // 统计数据
  const [stats, setStats] = useState({
    keyboardCount: 0,
    mouseClicks: 0,
    mouseDistance: 0
  });

  // 历史数据
  const [historyData, setHistoryData] = useState<any[]>([]);

  // Settings
  const [settings, setSettings] = useState({
    color: '#007AFF',
    backgroundColor: '#000000',
    fontSize: 48,
    opacity: 1.0,
    backgroundOpacity: 0.2,
    theme: 'light' as 'light' | 'dark',
    workDuration: 60,
    enableReminder: true
  });

  // 加载保存的时钟设置
  useEffect(() => {
    loadClockSettings();
  }, []);

  const loadClockSettings = async () => {
    if (window.electron?.ipcRenderer) {
      try {
        const savedSettings = await window.electron.ipcRenderer.invoke('db:get-clock-settings');
        if (savedSettings) {
          setSettings({
            color: savedSettings.color || '#007AFF',
            backgroundColor: savedSettings.backgroundColor || '#000000',
            fontSize: savedSettings.fontSize || 48,
            opacity: savedSettings.opacity || 1.0,
            backgroundOpacity: savedSettings.backgroundOpacity || 0.2,
            theme: savedSettings.theme || 'light',
            workDuration: savedSettings.workDuration || 60,
            enableReminder: savedSettings.enableReminder !== undefined ? savedSettings.enableReminder : true
          });
        }
      } catch (error) {
        console.error('Failed to load clock settings:', error);
      }
    }
  };

  // 保存时钟设置
  const saveClockSettings = async (newSettings: typeof settings) => {
    if (window.electron?.ipcRenderer) {
      try {
        await window.electron.ipcRenderer.invoke('db:update-clock-settings', newSettings);
      } catch (error) {
        console.error('Failed to save clock settings:', error);
      }
    }
  };

  // 应用主题并保存
  const applyTheme = async (theme: typeof settings | Partial<typeof settings>) => {
    const newSettings = { ...settings, ...theme };
    setSettings(newSettings);
    await saveClockSettings(newSettings);
  };

  // 久坐提醒状态
  const [showReminder, setShowReminder] = useState(false);
  const [reminderAnimation, setReminderAnimation] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 久坐提醒逻辑
  useEffect(() => {
    if (!settings.enableReminder || !isFloatingWindow) {
      return;
    }

    const getWorkStartTime = () => {
      const saved = localStorage.getItem('workStartTime');
      if (saved) {
        return new Date(saved);
      }
      return new Date();
    };

    const checkWorkDuration = () => {
      const workStartTime = getWorkStartTime();
      const elapsed = (Date.now() - workStartTime.getTime()) / (1000 * 60);

      if (elapsed >= settings.workDuration) {
        setShowReminder(true);
        setReminderAnimation(true);
      }
    };

    const interval = setInterval(checkWorkDuration, 60000);

    return () => clearInterval(interval);
  }, [settings.workDuration, settings.enableReminder, isFloatingWindow]);

  // 重置工作开始时间（有活动时）
  useEffect(() => {
    if (!isFloatingWindow) return;

    const resetWorkTimer = () => {
      localStorage.setItem('workStartTime', new Date().toISOString());
    };

    const handleActivity = () => {
      resetWorkTimer();
    };

    window.addEventListener('keydown', handleActivity);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('click', handleActivity);

    return () => {
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('click', handleActivity);
    };
  }, [isFloatingWindow]);

  // 判断是否在独立窗口中
  useEffect(() => {
    if (window.location.hash === '#floating-clock') {
      setIsFloatingWindow(true);
    }
  }, []);

  // 加载历史数据
  useEffect(() => {
    loadHistoryData();
  }, []);

  // 加载当前统计数据
  useEffect(() => {
    loadCurrentStats();

    if (window.electron?.ipcRenderer) {
      const handleStatsUpdate = (stats: any) => {
        if (stats && typeof stats === 'object') {
          setStats({
            keyboardCount: stats.keyboardCount || 0,
            mouseClicks: stats.mouseClickCount || 0,
            mouseDistance: stats.mouseMoveDistance || 0
          });
        }
      };

      window.electron.ipcRenderer.on('input-stats:update', handleStatsUpdate);

      return () => {
        window.electron?.ipcRenderer.removeAllListeners('input-stats:update');
      };
    }
  }, []);

  const loadCurrentStats = async () => {
    if (window.electron?.ipcRenderer) {
      try {
        const currentStats = await window.electron.ipcRenderer.invoke('input-monitor:get-stats');
        setStats({
          keyboardCount: currentStats.keyboardCount,
          mouseClicks: currentStats.mouseClickCount,
          mouseDistance: currentStats.mouseMoveDistance
        });
      } catch (error) {
        console.error('Failed to load current stats:', error);
      }
    }
  };

  const loadHistoryData = async () => {
    if (window.electron?.ipcRenderer) {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        const data = await window.electron.ipcRenderer.invoke(
          'db:get-stats',
          startDate.toISOString(),
          endDate.toISOString()
        );
        setHistoryData(data);
      } catch (error) {
        console.error('Failed to load history data:', error);
      }
    }
  };

  const formatDateTime = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[date.getDay()];

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}:${seconds}`,
      weekday
    };
  };

  const getWorkComment = (keyboard: number, mouseClicks: number, distance: number) => {
    const score = keyboard * 0.5 + mouseClicks * 1 + distance / 1000;

    if (score < 100) return '😴 今天很悠闲';
    if (score < 500) return '😊 工作节奏适中';
    if (score < 1000) return '💪 工作积极';
    if (score < 2000) return '🔥 工作效率很高';
    if (score < 5000) return '🚀 工作狂人';
    return '⚡ 枕式劳模，注意休息！';
  };

  const themePresets = [
    { name: '经典蓝', color: '#007AFF' },
    { name: '活力橙', color: '#FF9500' },
    { name: '清新绿', color: '#34C759' },
    { name: '魅惑紫', color: '#AF52DE' },
    { name: '樱花粉', color: '#FF2D55' },
    { name: '深海蓝', color: '#5AC8FA' },
    { name: '极光绿', color: '#00C7BE' },
    { name: '金色', color: '#FFCC00' },
    { name: '暗夜灰', color: '#8E8E93' },
    { name: '纯白色', color: '#FFFFFF' }
  ];

  const openFloatingWindow = () => {
    if (window.electron?.ipcRenderer) {
      window.electron.ipcRenderer.send('floating-clock:open');
      onClose();
    }
  };

  const { date, time: timeStr, weekday } = formatDateTime(time);

  // 如果是独立窗口，只显示时钟和基本控制
  if (isFloatingWindow) {
    // 久坐提醒界面
    if (showReminder) {
      return (
        <div
          onClick={() => {
            setShowReminder(false);
            setReminderAnimation(false);
            localStorage.setItem('workStartTime', new Date().toISOString());
          }}
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            cursor: 'pointer',
            animation: reminderAnimation ? 'pulse 1s ease-in-out infinite' : 'none',
            userSelect: 'none'
          }}
        >
          <div style={{
            textAlign: 'center',
            color: 'white',
            animation: 'scaleIn 0.5s ease-out'
          }}>
            <div style={{ fontSize: '72px', marginBottom: '20px' }}>⏰</div>
            <h1 style={{
              fontSize: '48px',
              margin: '0 0 20px 0',
              fontWeight: 700
            }}>
              休息时间到！
            </h1>
            <p style={{
              fontSize: '24px',
              margin: '0 0 30px 0',
              opacity: 0.9
            }}>
              你已经连续工作了 {settings.workDuration} 分钟
            </p>
            <p style={{
              fontSize: '18px',
              margin: 0,
              opacity: 0.8
            }}>
              点击任意处返回正常时钟
            </p>
          </div>
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.02); }
            }
            @keyframes scaleIn {
              from { transform: scale(0.5); opacity: 0; }
              to { transform: scale(1); opacity: 1; }
            }
          `}</style>
        </div>
      );
    }

    // 正常时钟界面 - 简化版，只显示时间、日期和工作评价
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        cursor: 'move',
        opacity: settings.opacity,
        backgroundColor: settings.backgroundColor + Math.round(settings.backgroundOpacity * 255).toString(16).padStart(2, '0'),
        position: 'relative',
        padding: '16px',
        borderRadius: '12px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        minWidth: '200px'
      }}>
        {/* 关闭按钮 */}
        <button
          onClick={() => {
            if (window.electron?.ipcRenderer) {
              window.electron.ipcRenderer.send('floating-clock:close');
            }
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 24,
            height: 24,
            borderRadius: '50%',
            border: 'none',
            background: 'rgba(255, 59, 48, 0.8)',
            color: 'white',
            fontSize: 14,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            WebkitAppRegion: 'no-drag',
            opacity: 0,
            transition: 'opacity 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
          }}
          title="关闭悬浮窗口"
        >
          ✕
        </button>

        {/* 第一行：时间 */}
        <div style={{
          textAlign: 'center',
          fontWeight: 700,
          fontFamily: 'Arial, monospace',
          lineHeight: 1.2,
          fontSize: `${settings.fontSize}px`,
          color: settings.color
        }}>
          {timeStr}
        </div>

        {/* 第二行：日期和星期 */}
        <div style={{
          marginTop: 8,
          fontWeight: 500,
          opacity: 0.8,
          fontSize: `${settings.fontSize * 0.3}px`,
          color: settings.color,
          textAlign: 'center'
        }}>
          {date} {weekday}
        </div>

        {/* 第三行：工作评价 */}
        <div style={{
          marginTop: 12,
          fontSize: `${settings.fontSize * 0.25}px`,
          color: settings.color,
          opacity: 0.8,
          fontWeight: 500,
          textAlign: 'center'
        }}>
          {getWorkComment(stats.keyboardCount, stats.mouseClicks, stats.mouseDistance)}
        </div>
      </div>
    );
  }

  // 模态框样式
  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(4px)',
    padding: '20px'
  };

  const modalContentStyle: React.CSSProperties = {
    width: '90%',
    maxWidth: '700px',
    maxHeight: '95vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    backdropFilter: 'blur(20px)',
    borderRadius: '16px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    overflow: 'auto'
  };

  const modalHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    flexShrink: 0
  };

  const modalBodyStyle: React.CSSProperties = {
    padding: '16px 20px',
    overflow: 'visible',
    flex: 1
  };

  const buttonStyle: React.CSSProperties = {
    padding: '10px 20px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '14px'
  };

  const primaryButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
  };

  const sectionStyle: React.CSSProperties = {
    marginTop: '16px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  const headingStyle: React.CSSProperties = {
    margin: '0 0 12px 0',
    color: '#ffffff',
    fontSize: '16px'
  };

  const statCardStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.08)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, color: '#ffffff', fontSize: '20px' }}>⏰ 悬浮时钟</h2>
          <button
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#ffffff',
              fontSize: '18px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div style={modalBodyStyle}>
          <div style={{
            textAlign: 'center',
            marginBottom: '16px',
            padding: '24px 20px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div
              style={{
                color: settings.color,
                fontSize: `${settings.fontSize}px`,
                opacity: settings.opacity,
                fontWeight: 700,
                fontFamily: 'Arial, monospace',
                letterSpacing: '1px',
                marginBottom: '12px',
                lineHeight: 1.2
              }}
            >
              {timeStr}
            </div>
            <div style={{
              fontSize: `${settings.fontSize * 0.3}px`,
              color: settings.color,
              fontWeight: 500,
              opacity: 0.8,
              marginBottom: '20px'
            }}>
              {date} {weekday}
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <button
                style={buttonStyle}
                onClick={() => setShowStats(!showStats)}
              >
                {showStats ? '隐藏' : '显示'}统计
              </button>
              <button
                style={buttonStyle}
                onClick={() => setShowSettings(!showSettings)}
              >
                {showSettings ? '隐藏' : '显示'}设置
              </button>
              <button
                style={primaryButtonStyle}
                onClick={openFloatingWindow}
              >
                打开悬浮窗口
              </button>
            </div>
          </div>

          {showStats && (
            <div style={sectionStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={headingStyle}>📊 今日统计</h3>
                <button
                  onClick={async () => {
                    if (window.electron?.ipcRenderer) {
                      await window.electron.ipcRenderer.invoke('input-monitor:save');
                      alert('统计数据已保存！');
                      loadCurrentStats();
                      loadHistoryData();
                    }
                  }}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: '#ffffff'
                  }}
                >
                  💾 保存统计
                </button>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                marginBottom: '20px'
              }}>
                <div style={statCardStyle}>
                  <div style={{ fontSize: '32px' }}>⌨️</div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>键盘次数</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>{stats.keyboardCount}</div>
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={{ fontSize: '32px' }}>🖱️</div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>鼠标点击</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>{stats.mouseClicks}</div>
                  </div>
                </div>

                <div style={statCardStyle}>
                  <div style={{ fontSize: '32px' }}>📏</div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>移动距离</div>
                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff' }}>{(stats.mouseDistance / 1000).toFixed(2)}m</div>
                  </div>
                </div>
              </div>

              {historyData.length > 0 && (
                <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#ffffff', fontSize: '15px' }}>📈 近7天统计</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {historyData.map((item: any, index: number) => (
                      <div
                        key={index}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '6px',
                          fontSize: '13px',
                          color: '#ffffff',
                          border: '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>
                          {new Date(item.date || Date.now()).toLocaleDateString()}
                        </span>
                        <span style={{ opacity: 0.8 }}>⌨️ {item.keyboard_count || 0}</span>
                        <span style={{ opacity: 0.8 }}>🖱️ {item.mouse_click_count || 0}</span>
                        <span style={{ opacity: 0.8 }}>📏 {((item.mouse_move_distance || 0) / 1000).toFixed(1)}m</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {showSettings && (
            <div style={sectionStyle}>
              <h3 style={headingStyle}>⚙️ 设置</h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: '#ffffff', fontWeight: 500, minWidth: '150px' }}>字体大小: {settings.fontSize}px</label>
                  <input
                    type="range"
                    min="24"
                    max="72"
                    value={settings.fontSize}
                    onChange={(e) => applyTheme({ fontSize: Number(e.target.value) })}
                    style={{ flex: 1, maxWidth: '200px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: '#ffffff', fontWeight: 500, minWidth: '150px' }}>透明度: {(settings.opacity * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="0.3"
                    max="1"
                    step="0.1"
                    value={settings.opacity}
                    onChange={(e) => applyTheme({ opacity: Number(e.target.value) })}
                    style={{ flex: 1, maxWidth: '200px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: '#ffffff', fontWeight: 500, minWidth: '150px' }}>背景透明度: {(settings.backgroundOpacity * 100).toFixed(0)}%</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={settings.backgroundOpacity}
                    onChange={(e) => applyTheme({ backgroundOpacity: Number(e.target.value) })}
                    style={{ flex: 1, maxWidth: '200px' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', marginTop: '8px' }}>
                  <label style={{ color: '#ffffff', fontWeight: 500, minWidth: '150px' }}>启用提醒</label>
                  <input
                    type="checkbox"
                    checked={settings.enableReminder}
                    onChange={(e) => applyTheme({ enableReminder: e.target.checked })}
                    style={{ width: 'auto' }}
                  />
                </div>

                {settings.enableReminder && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ color: '#ffffff', fontWeight: 500, minWidth: '150px' }}>工作时长: {settings.workDuration} 分钟</label>
                    <input
                      type="range"
                      min="15"
                      max="180"
                      step="15"
                      value={settings.workDuration}
                      onChange={(e) => applyTheme({ workDuration: Number(e.target.value) })}
                      style={{ flex: 1, maxWidth: '200px' }}
                    />
                  </div>
                )}

                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '16px', marginTop: '8px' }}>
                  <label style={{ color: '#ffffff', fontWeight: 500, marginBottom: '12px', display: 'block' }}>🎨 文字颜色</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {themePresets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyTheme({ color: preset.color })}
                        style={{
                          padding: '8px 12px',
                          border: settings.color === preset.color ? '2px solid #007AFF' : '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '6px',
                          background: preset.color,
                          color: preset.color === '#FFFFFF' || preset.color === '#FFCC00' ? '#000' : '#fff',
                          cursor: 'pointer',
                          fontSize: '12px',
                          transition: 'all 0.2s'
                        }}
                        title={preset.name}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: '#ffffff', fontWeight: 500, minWidth: '150px' }}>自定义颜色</label>
                  <input
                    type="color"
                    value={settings.color}
                    onChange={(e) => applyTheme({ color: e.target.value })}
                    style={{
                      width: '60px',
                      height: '35px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ color: '#ffffff', fontWeight: 500, minWidth: '150px' }}>背景色</label>
                  <input
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => setSettings({ ...settings, backgroundColor: e.target.value })}
                    style={{
                      width: '60px',
                      height: '35px',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: 'rgba(255, 255, 255, 0.1)'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          <div style={sectionStyle}>
            <h3 style={headingStyle}>ℹ️ 功能说明</h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ padding: '10px 0', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                ✨ 实时显示当前时间、日期和星期
              </li>
              <li style={{ padding: '10px 0', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                📊 统计键盘和鼠标使用情况（数据持久化）
              </li>
              <li style={{ padding: '10px 0', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                🖼️ 独立悬浮窗口，可拖动到屏幕任意位置
              </li>
              <li style={{ padding: '10px 0', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                📈 历史报表，查看最近7天的使用数据
              </li>
              <li style={{ padding: '10px 0', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                ⏰ 久坐提醒功能（可设置工作时长）
              </li>
              <li style={{ padding: '10px 0', color: '#ffffff', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                🎨 支持自定义颜色、字体大小和透明度
              </li>
              <li style={{ padding: '10px 0', color: '#ffffff' }}>
                📤 统计数据可导出到 Excel
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloatingClock;
