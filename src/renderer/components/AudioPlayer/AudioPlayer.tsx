/**
 * Audio Player Plugin
 *
 * Local audio playback with playlist support
 */

import React, { useState, useRef, useCallback, useEffect } from "react";
import PluginWindow from "../PluginWindow/PluginWindow";
import styles from "./AudioPlayer.module.css";

interface Track {
  id: string;
  name: string;
  url: string;
  duration?: number;
}

interface AudioPlayerProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.75);
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [newTrackUrl, setNewTrackUrl] = useState("");
  const [newTrackName, setNewTrackName] = useState("");

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load playlist from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("audio-playlist");
    if (saved) {
      try {
        setPlaylist(JSON.parse(saved));
      } catch (err) {
        console.error("Failed to load playlist:", err);
      }
    }
  }, []);

  // Save playlist to localStorage
  useEffect(() => {
    if (playlist.length > 0) {
      localStorage.setItem("audio-playlist", JSON.stringify(playlist));
    }
  }, [playlist]);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleEnded = () => {
      playNext();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [currentTrackIndex]);

  // Play/Pause toggle
  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || currentTrackIndex < 0) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, currentTrackIndex]);

  // Play track
  const playTrack = useCallback((index: number) => {
    setCurrentTrackIndex(index);
    setIsPlaying(true);
    setCurrentTime(0);
  }, []);

  // Play next track
  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    playTrack(nextIndex);
  }, [currentTrackIndex, playlist.length, playTrack]);

  // Play previous track
  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIndex =
      currentTrackIndex <= 0 ? playlist.length - 1 : currentTrackIndex - 1;
    playTrack(prevIndex);
  }, [currentTrackIndex, playlist.length, playTrack]);

  // Handle seek
  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  // Handle volume change
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      const newVolume = parseFloat(e.target.value);

      if (audio) {
        audio.volume = newVolume;
      }
      setVolume(newVolume);
    },
    [],
  );

  // Handle file upload
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      const newTracks: Track[] = Array.from(files).map((file) => ({
        id: Date.now().toString() + Math.random().toString(),
        name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        url: URL.createObjectURL(file),
      }));

      setPlaylist((prev) => [...prev, ...newTracks]);

      // Auto-play if this is the first track
      if (currentTrackIndex < 0 && newTracks.length > 0) {
        playTrack(0);
      }
    },
    [currentTrackIndex, playTrack],
  );

  // Add track from URL
  const addTrackFromUrl = useCallback(() => {
    if (!newTrackUrl || !newTrackName) return;

    const newTrack: Track = {
      id: Date.now().toString(),
      name: newTrackName,
      url: newTrackUrl,
    };

    setPlaylist((prev) => [...prev, newTrack]);
    setNewTrackUrl("");
    setNewTrackName("");
    setShowAddUrl(false);

    if (currentTrackIndex < 0) {
      playTrack(0);
    }

    announceToScreenReader(`已添加${newTrackName}`);
  }, [newTrackUrl, newTrackName, currentTrackIndex, playTrack]);

  // Remove track
  const removeTrack = useCallback(
    (id: string) => {
      setPlaylist((prev) => {
        const updated = prev.filter((track) => track.id !== id);

        // Update current index if needed
        if (currentTrackIndex >= 0) {
          const currentTrack = playlist[currentTrackIndex];
          if (currentTrack && currentTrack.id === id) {
            setCurrentTrackIndex(-1);
            setIsPlaying(false);
            setCurrentTime(0);
          } else if (currentTrackIndex >= updated.length) {
            setCurrentTrackIndex(updated.length - 1);
          }
        }

        return updated;
      });

      announceToScreenReader("已删除曲目");
    },
    [currentTrackIndex, playlist],
  );

  // Clear playlist
  const clearPlaylist = useCallback(() => {
    setPlaylist([]);
    setCurrentTrackIndex(-1);
    setIsPlaying(false);
    setCurrentTime(0);
  }, []);

  // Format time
  const formatTime = useCallback((seconds: number): string => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const currentTrack =
    currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;

  return (
    <PluginWindow
      title="音频播放器"
      icon="🎵"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="audio-player-standalone"
      pluginId="audio-player"
      showStandaloneButton={false}
    >
      <div className={styles.audioPlayer}>
        {/* Hidden audio element */}
        {currentTrack && (
          <audio
            ref={audioRef}
            src={currentTrack.url}
            autoPlay={isPlaying}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
        )}

        {/* Now Playing */}
        <div className={styles.nowPlaying}>
          <div className={styles.trackInfo}>
            <div className={styles.trackIcon}>🎵</div>
            <div className={styles.trackDetails}>
              <h3 className={styles.trackName}>
                {currentTrack?.name || "未选择曲目"}
              </h3>
              <p className={styles.trackStatus}>
                {currentTrack ? (
                  <>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </>
                ) : (
                  "添加音频文件开始播放"
                )}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {currentTrack && (
            <div className={styles.progressContainer}>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={currentTime}
                onChange={handleSeek}
                className={styles.progressBar}
                aria-label="播放进度"
              />
            </div>
          )}

          {/* Controls */}
          <div className={styles.controls}>
            <button
              onClick={playPrevious}
              className={styles.controlButton}
              disabled={!currentTrack}
              aria-label="上一曲"
            >
              ⏮️
            </button>
            <button
              onClick={togglePlayPause}
              className={`${styles.playButton} ${isPlaying ? styles.playing : ""}`}
              disabled={!currentTrack}
              aria-label={isPlaying ? "暂停" : "播放"}
            >
              {isPlaying ? "⏸️" : "▶️"}
            </button>
            <button
              onClick={playNext}
              className={styles.controlButton}
              disabled={!currentTrack}
              aria-label="下一曲"
            >
              ⏭️
            </button>

            {/* Volume Control */}
            <div className={styles.volumeControl}>
              <button
                onClick={() => setVolume((v) => (v === 0 ? 0.75 : 0))}
                className={styles.volumeButton}
                aria-label={volume === 0 ? "取消静音" : "静音"}
              >
                {volume === 0 ? "🔇" : volume < 0.5 ? "🔉" : "🔊"}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className={styles.volumeSlider}
                aria-label="音量控制"
              />
            </div>
          </div>
        </div>

        {/* Playlist */}
        <div className={styles.playlistSection}>
          <div className={styles.playlistHeader}>
            <h3>播放列表 ({playlist.length})</h3>
            <div className={styles.playlistActions}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className={styles.addButton}
                aria-label="添加本地文件"
              >
                📁 添加文件
              </button>
              <button
                onClick={() => setShowAddUrl(true)}
                className={styles.addButton}
                aria-label="添加网络链接"
              >
                🔗 添加链接
              </button>
              {playlist.length > 0 && (
                <button
                  onClick={clearPlaylist}
                  className={styles.clearButton}
                  aria-label="清空播放列表"
                >
                  🗑️ 清空
                </button>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            multiple
            onChange={handleFileUpload}
            style={{ display: "none" }}
          />

          {playlist.length > 0 ? (
            <div className={styles.playlist}>
              {playlist.map((track, index) => (
                <div
                  key={track.id}
                  className={`${styles.trackItem} ${
                    index === currentTrackIndex ? styles.active : ""
                  }`}
                  onClick={() => playTrack(index)}
                >
                  <div className={styles.trackItemInfo}>
                    <span className={styles.trackNumber}>
                      {index === currentTrackIndex && isPlaying
                        ? "▶️"
                        : index + 1}
                    </span>
                    <div className={styles.trackItemDetails}>
                      <span className={styles.trackItemName}>{track.name}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTrack(track.id);
                    }}
                    className={styles.removeButton}
                    aria-label={`删除${track.name}`}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyPlaylist}>
              <p>播放列表为空</p>
              <p className={styles.emptyHint}>
                点击"添加文件"或"添加链接"开始播放
              </p>
            </div>
          )}
        </div>

        {/* Add URL Modal */}
        {showAddUrl && (
          <div className={styles.modal} onClick={() => setShowAddUrl(false)}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>添加网络链接</h3>

              <div className={styles.formGroup}>
                <label htmlFor="track-name">曲目名称 *</label>
                <input
                  id="track-name"
                  type="text"
                  value={newTrackName}
                  onChange={(e) => setNewTrackName(e.target.value)}
                  className={styles.input}
                  placeholder="输入曲目名称"
                  autoFocus
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="track-url">音频链接 *</label>
                <input
                  id="track-url"
                  type="url"
                  value={newTrackUrl}
                  onChange={(e) => setNewTrackUrl(e.target.value)}
                  className={styles.input}
                  placeholder="https://example.com/audio.mp3"
                />
              </div>

              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowAddUrl(false)}
                  className={styles.cancelButton}
                >
                  取消
                </button>
                <button
                  onClick={addTrackFromUrl}
                  className={styles.saveButton}
                  disabled={!newTrackName || !newTrackUrl}
                >
                  添加
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PluginWindow>
  );
};

// Screen reader announcement helper
function announceToScreenReader(message: string) {
  const announcement = document.createElement("div");
  announcement.setAttribute("role", "status");
  announcement.setAttribute("aria-live", "polite");
  announcement.className = "sr-only";
  announcement.style.position = "absolute";
  announcement.style.left = "-10000px";
  announcement.style.width = "1px";
  announcement.style.height = "1px";
  announcement.style.overflow = "hidden";
  announcement.textContent = message;
  document.body.appendChild(announcement);
  setTimeout(() => document.body.removeChild(announcement), 1000);
}

export default AudioPlayer;
