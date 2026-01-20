/**
 * World Clock Plugin
 *
 * Display multiple time zones with beautiful analog clocks
 */

import React, { useState, useEffect, useCallback } from 'react';
import PluginWindow from '../PluginWindow/PluginWindow';
import styles from './WorldClock.module.css';

interface WorldClockProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

interface City {
  name: string;
  timezone: string;
  offset: number;
}

interface ClockData {
  city: City;
  id: string;
}

const popularCities: City[] = [
  { name: '北京', timezone: 'Asia/Shanghai', offset: 8 },
  { name: '伦敦', timezone: 'Europe/London', offset: 0 },
  { name: '纽约', timezone: 'America/New_York', offset: -5 },
  { name: '东京', timezone: 'Asia/Tokyo', offset: 9 },
  { name: '巴黎', timezone: 'Europe/Paris', offset: 1 },
  { name: '悉尼', timezone: 'Australia/Sydney', offset: 11 },
  { name: '迪拜', timezone: 'Asia/Dubai', offset: 4 },
  { name: '洛杉矶', timezone: 'America/Los_Angeles', offset: -8 },
  { name: '莫斯科', timezone: 'Europe/Moscow', offset: 3 },
  { name: '新加坡', timezone: 'Asia/Singapore', offset: 8 },
];

const WorldClock: React.FC<WorldClockProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [clocks, setClocks] = useState<ClockData[]>([
    { city: popularCities[0], id: '1' },
    { city: popularCities[2], id: '2' },
    { city: popularCities[3], id: '3' },
  ]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Get time for specific timezone
  const getTimeInTimezone = useCallback((timezone: string): Date => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      timeZone: timezone,
      hour12: false,
    };
    const formatter = new Intl.DateTimeFormat('en-US', options);
    const parts = formatter.formatToParts(now);

    const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0');
    const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0');
    const second = parseInt(parts.find(p => p.type === 'second')?.value || '0');

    const time = new Date();
    time.setHours(hour, minute, second);
    return time;
  }, []);

  // Add clock
  const addClock = useCallback((city: City) => {
    const newClock: ClockData = {
      city,
      id: Date.now().toString(),
    };
    setClocks([...clocks, newClock]);
    setShowAddModal(false);
    setSearchQuery('');
  }, [clocks]);

  // Remove clock
  const removeClock = useCallback((id: string) => {
    setClocks(clocks.filter(c => c.id !== id));
  }, [clocks]);

  // Filter cities based on search
  const filteredCities = popularCities.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !clocks.some(clock => clock.city.name === city.name)
  );

  return (
    <PluginWindow
      title="世界时钟"
      icon="🌍"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="world-clock-standalone"
      pluginId="world-clock"
      showStandaloneButton={false}
    >
      <div className={styles.container}>
        {/* Clocks Grid */}
        <div className={styles.clocksGrid}>
          {clocks.map((clock) => {
            const time = getTimeInTimezone(clock.city.timezone);
            const hours = time.getHours();
            const minutes = time.getMinutes();
            const seconds = time.getSeconds();

            // Calculate angles for clock hands
            const hourAngle = (hours % 12) * 30 + minutes * 0.5;
            const minuteAngle = minutes * 6;
            const secondAngle = seconds * 6;

            // Format time string
            const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
            const dateString = time.toLocaleDateString('zh-CN', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            });

            // Determine if it's day or night
            const isDay = hours >= 6 && hours < 18;

            return (
              <div key={clock.id} className={styles.clockCard}>
                <button
                  onClick={() => removeClock(clock.id)}
                  className={styles.removeButton}
                  aria-label="Remove clock"
                >
                  ×
                </button>

                {/* Analog Clock */}
                <div className={styles.clockFace}>
                  <svg className={styles.clockSvg} viewBox="0 0 100 100">
                    {/* Clock face */}
                    <circle
                      className={styles.clockCircle}
                      cx="50"
                      cy="50"
                      r="48"
                      fill={isDay ? 'url(#dayGradient)' : 'url(#nightGradient)'}
                    />

                    {/* Gradients */}
                    <defs>
                      <linearGradient id="dayGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#667eea', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#764ba2', stopOpacity: 1 }} />
                      </linearGradient>
                      <linearGradient id="nightGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>

                    {/* Hour markers */}
                    {[...Array(12)].map((_, i) => {
                      const angle = (i * 30 - 90) * (Math.PI / 180);
                      const x1 = 50 + 40 * Math.cos(angle);
                      const y1 = 50 + 40 * Math.sin(angle);
                      const x2 = 50 + 45 * Math.cos(angle);
                      const y2 = 50 + 45 * Math.sin(angle);
                      return (
                        <line
                          key={i}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={isDay ? 'white' : 'rgba(255,255,255,0.8)'}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      );
                    })}

                    {/* Hour hand */}
                    <line
                      x1="50"
                      y1="50"
                      x2={50 + 25 * Math.cos((hourAngle - 90) * (Math.PI / 180))}
                      y2={50 + 25 * Math.sin((hourAngle - 90) * (Math.PI / 180))}
                      stroke={isDay ? 'white' : '#fff'}
                      strokeWidth="3"
                      strokeLinecap="round"
                      style={{ transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />

                    {/* Minute hand */}
                    <line
                      x1="50"
                      y1="50"
                      x2={50 + 35 * Math.cos((minuteAngle - 90) * (Math.PI / 180))}
                      y2={50 + 35 * Math.sin((minuteAngle - 90) * (Math.PI / 180))}
                      stroke={isDay ? 'white' : '#fff'}
                      strokeWidth="2"
                      strokeLinecap="round"
                      style={{ transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    />

                    {/* Second hand */}
                    <line
                      x1="50"
                      y1="50"
                      x2={50 + 40 * Math.cos((secondAngle - 90) * (Math.PI / 180))}
                      y2={50 + 40 * Math.sin((secondAngle - 90) * (Math.PI / 180))}
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeLinecap="round"
                      style={{ transition: 'transform 0.1s linear' }}
                    />

                    {/* Center dot */}
                    <circle
                      cx="50"
                      cy="50"
                      r="3"
                      fill={isDay ? 'white' : '#fff'}
                    />
                  </svg>

                  {/* Day/Night indicator */}
                  <div className={styles.dayNightIndicator}>
                    {isDay ? '☀️' : '🌙'}
                  </div>
                </div>

                {/* City Info */}
                <div className={styles.cityInfo}>
                  <h3 className={styles.cityName}>{clock.city.name}</h3>
                  <div className={styles.timeDisplay}>{timeString}</div>
                  <div className={styles.dateDisplay}>{dateString}</div>
                  <div className={styles.timezoneDisplay}>
                    UTC{clock.city.offset >= 0 ? '+' : ''}{clock.city.offset}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Clock Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className={styles.addButton}
        >
          + 添加时钟
        </button>

        {/* Add City Modal */}
        {showAddModal && (
          <div className={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3 className={styles.modalTitle}>添加城市</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className={styles.modalClose}
                >
                  ×
                </button>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索城市..."
                className={styles.searchInput}
                autoFocus
              />

              <div className={styles.citiesList}>
                {filteredCities.length === 0 ? (
                  <p className={styles.noResults}>未找到匹配的城市</p>
                ) : (
                  filteredCities.map((city, index) => (
                    <button
                      key={index}
                      onClick={() => addClock(city)}
                      className={styles.cityButton}
                    >
                      <span className={styles.cityButtonName}>{city.name}</span>
                      <span className={styles.cityButtonTimezone}>
                        UTC{city.offset >= 0 ? '+' : ''}{city.offset}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

export default WorldClock;
