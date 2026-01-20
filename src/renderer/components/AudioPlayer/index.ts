/**
 * Audio Player Plugin
 */

export { default } from './AudioPlayer';
export const audioPlayerManifest = {
  id: 'com.desktop-tool.plugin.audio-player',
  name: 'Audio Player',
  description: '本地音频播放器，支持播放列表管理、音量控制和进度调节',
  icon: '🎵',
  version: '1.0.0',
  author: 'Desktop Tool',
  category: 'media',
  entry: './AudioPlayer',
};
