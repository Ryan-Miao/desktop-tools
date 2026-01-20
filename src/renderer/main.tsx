import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import StandaloneApp from './StandaloneApp';
import ErrorBoundary from './components/ErrorBoundary';
import './styles/global.css';
import './styles/themes.css';
import './styles/breakpoints.css';
import './styles/micro-interactions.css';

// Import built-in plugins and their manifests
import { pluginRegistry } from './services/PluginRegistry';
import CalculatorPad, { calculatorManifest } from './components/CalculatorPad';
import JSONFormatter, { jsonFormatterManifest } from './components/JSONFormatter';
import PasswordGenerator, { passwordGeneratorManifest } from './components/PasswordGenerator';
import UrlCodec, { urlCodecManifest } from './components/UrlCodec';
import Base64Tool, { base64ToolManifest } from './components/Base64Tool';
import CryptoTool, { cryptoToolManifest } from './components/CryptoTool';
import Notepad, { notepadManifest } from './components/Notepad';
import TodoList, { todoListManifest } from './components/TodoList';
import OcrTool, { ocrToolManifest } from './components/OcrTool';
import ColorPicker, { colorPickerManifest } from './components/ColorPicker';
import UnitConverter, { unitConverterManifest } from './components/UnitConverter';
import CodeFormatter, { codeFormatterManifest } from './components/CodeFormatter';
import Ruler, { rulerManifest } from './components/Ruler';
import Calendar, { calendarManifest } from './components/Calendar';
import AudioPlayer, { audioPlayerManifest } from './components/AudioPlayer';
import MiniGames, { miniGamesManifest } from './components/MiniGames';
import QRCodeGenerator, { qrCodeGeneratorManifest } from './components/QRCodeGenerator';
import Stopwatch, { stopwatchManifest } from './components/Stopwatch';
import QuickNote, { quickNoteManifest } from './components/QuickNote';
import PasswordStrength, { passwordStrengthManifest } from './components/PasswordStrength';
import ScientificCalculator, { scientificCalculatorManifest } from './components/ScientificCalculator';
import ColorPalette, { colorPaletteManifest } from './components/ColorPalette';
import JsonToTs, { jsonToTsManifest } from './components/JsonToTs';
import RegexTester, { regexTesterManifest } from './components/RegexTester';
import ProgressCharts, { progressChartsManifest } from './components/ProgressCharts';
import WorldClock, { worldClockManifest } from './components/WorldClock';
import MarkdownEditor, { markdownEditorManifest } from './components/MarkdownEditor';
import KeyboardShortcuts, { keyboardShortcutsManifest } from './components/KeyboardShortcuts';
import KanbanBoard, { kanbanBoardManifest } from './components/KanbanBoard';
import PomodoroTimer, { pomodoroTimerManifest } from './components/PomodoroTimer';
import LinkManager, { linkManagerManifest } from './components/LinkManager';
import FileHash, { fileHashManifest } from './components/FileHash';
import UuidGenerator, { uuidGeneratorManifest } from './components/UuidGenerator';
import TimestampConverter, { timestampConverterManifest } from './components/TimestampConverter';
import JsonDiff, { jsonDiffManifest } from './components/JsonDiff';
import DocumentMerger, { documentMergerManifest } from './components/DocumentMerger';
import SchedulePlanner, { schedulePlannerManifest } from './components/SchedulePlanner';
import MeetingNotes, { meetingNotesManifest } from './components/MeetingNotes';
import ArticleCollector, { articleCollectorManifest } from './components/ArticleCollector';
import GoalTracker, { goalTrackerManifest } from './components/GoalTracker';
import MindMap, { mindMapManifest } from './components/MindMap';
import DataPivot, { dataPivotManifest } from './components/DataPivot';
import GradientGenerator, { gradientGeneratorManifest } from './components/GradientGenerator';
import ShadowDesigner, { shadowDesignerManifest } from './components/ShadowDesigner';
import ImageCropper, { imageCropperManifest } from './components/ImageCropper';
import ColorExtractor, { colorExtractorManifest } from './components/ColorExtractor';
import LayoutGrid, { layoutGridManifest } from './components/LayoutGrid';
import AnimationGenerator, { animationGeneratorManifest } from './components/AnimationGenerator';

// Register built-in plugins explicitly
pluginRegistry.register('com.desktop-tool.calculator-pad', {
  component: CalculatorPad,
  pluginId: 'com.desktop-tool.calculator-pad',
  manifest: calculatorManifest
});

pluginRegistry.register('com.desktop-tool.json-formatter', {
  component: JSONFormatter,
  pluginId: 'com.desktop-tool.json-formatter',
  manifest: jsonFormatterManifest
});

pluginRegistry.register('com.desktop-tool.plugin.password-generator', {
  component: PasswordGenerator,
  pluginId: 'com.desktop-tool.plugin.password-generator',
  manifest: passwordGeneratorManifest
});

pluginRegistry.register('com.desktop-tool.plugin.url-codec', {
  component: UrlCodec,
  pluginId: 'com.desktop-tool.plugin.url-codec',
  manifest: urlCodecManifest
});

pluginRegistry.register('com.desktop-tool.plugin.base64-tool', {
  component: Base64Tool,
  pluginId: 'com.desktop-tool.plugin.base64-tool',
  manifest: base64ToolManifest
});

pluginRegistry.register('com.desktop-tool.plugin.crypto-tool', {
  component: CryptoTool,
  pluginId: 'com.desktop-tool.plugin.crypto-tool',
  manifest: cryptoToolManifest
});

pluginRegistry.register('com.desktop-tool.plugin.notepad', {
  component: Notepad,
  pluginId: 'com.desktop-tool.plugin.notepad',
  manifest: notepadManifest
});

pluginRegistry.register('com.desktop-tool.plugin.todo-list', {
  component: TodoList,
  pluginId: 'com.desktop-tool.plugin.todo-list',
  manifest: todoListManifest
});

pluginRegistry.register('com.desktop-tool.plugin.ocr-tool', {
  component: OcrTool,
  pluginId: 'com.desktop-tool.plugin.ocr-tool',
  manifest: ocrToolManifest
});

pluginRegistry.register('com.desktop-tool.plugin.color-picker', {
  component: ColorPicker,
  pluginId: 'com.desktop-tool.plugin.color-picker',
  manifest: colorPickerManifest
});

pluginRegistry.register('com.desktop-tool.plugin.unit-converter', {
  component: UnitConverter,
  pluginId: 'com.desktop-tool.plugin.unit-converter',
  manifest: unitConverterManifest
});

pluginRegistry.register('com.desktop-tool.plugin.code-formatter', {
  component: CodeFormatter,
  pluginId: 'com.desktop-tool.plugin.code-formatter',
  manifest: codeFormatterManifest
});

pluginRegistry.register('com.desktop-tool.plugin.ruler', {
  component: Ruler,
  pluginId: 'com.desktop-tool.plugin.ruler',
  manifest: rulerManifest
});

pluginRegistry.register('com.desktop-tool.plugin.calendar', {
  component: Calendar,
  pluginId: 'com.desktop-tool.plugin.calendar',
  manifest: calendarManifest
});

pluginRegistry.register('com.desktop-tool.plugin.audio-player', {
  component: AudioPlayer,
  pluginId: 'com.desktop-tool.plugin.audio-player',
  manifest: audioPlayerManifest
});

pluginRegistry.register('com.desktop-tool.plugin.mini-games', {
  component: MiniGames,
  pluginId: 'com.desktop-tool.plugin.mini-games',
  manifest: miniGamesManifest
});

pluginRegistry.register('com.desktop-tool.plugin.qrcode-generator', {
  component: QRCodeGenerator,
  pluginId: 'com.desktop-tool.plugin.qrcode-generator',
  manifest: qrCodeGeneratorManifest
});

pluginRegistry.register('com.desktop-tool.plugin.stopwatch', {
  component: Stopwatch,
  pluginId: 'com.desktop-tool.plugin.stopwatch',
  manifest: stopwatchManifest
});

pluginRegistry.register('com.desktop-tool.plugin.quick-note', {
  component: QuickNote,
  pluginId: 'com.desktop-tool.plugin.quick-note',
  manifest: quickNoteManifest
});

pluginRegistry.register('com.desktop-tool.plugin.password-strength', {
  component: PasswordStrength,
  pluginId: 'com.desktop-tool.plugin.password-strength',
  manifest: passwordStrengthManifest
});

pluginRegistry.register('com.desktop-tool.plugin.scientific-calculator', {
  component: ScientificCalculator,
  pluginId: 'com.desktop-tool.plugin.scientific-calculator',
  manifest: scientificCalculatorManifest
});

pluginRegistry.register('com.desktop-tool.plugin.color-palette', {
  component: ColorPalette,
  pluginId: 'com.desktop-tool.plugin.color-palette',
  manifest: colorPaletteManifest
});

pluginRegistry.register('com.desktop-tool.plugin.json-to-ts', {
  component: JsonToTs,
  pluginId: 'com.desktop-tool.plugin.json-to-ts',
  manifest: jsonToTsManifest
});

pluginRegistry.register('com.desktop-tool.plugin.regex-tester', {
  component: RegexTester,
  pluginId: 'com.desktop-tool.plugin.regex-tester',
  manifest: regexTesterManifest
});

pluginRegistry.register('com.desktop-tool.plugin.progress-charts', {
  component: ProgressCharts,
  pluginId: 'com.desktop-tool.plugin.progress-charts',
  manifest: progressChartsManifest
});

pluginRegistry.register('com.desktop-tool.plugin.world-clock', {
  component: WorldClock,
  pluginId: 'com.desktop-tool.plugin.world-clock',
  manifest: worldClockManifest
});

pluginRegistry.register('com.desktop-tool.plugin.markdown-editor', {
  component: MarkdownEditor,
  pluginId: 'com.desktop-tool.plugin.markdown-editor',
  manifest: markdownEditorManifest
});

pluginRegistry.register('com.desktop-tool.plugin.keyboard-shortcuts', {
  component: KeyboardShortcuts,
  pluginId: 'com.desktop-tool.plugin.keyboard-shortcuts',
  manifest: keyboardShortcutsManifest
});

pluginRegistry.register('com.desktop-tool.plugin.kanban-board', {
  component: KanbanBoard,
  pluginId: 'com.desktop-tool.plugin.kanban-board',
  manifest: kanbanBoardManifest
});

pluginRegistry.register('com.desktop-tool.plugin.pomodoro-timer', {
  component: PomodoroTimer,
  pluginId: 'com.desktop-tool.plugin.pomodoro-timer',
  manifest: pomodoroTimerManifest
});

pluginRegistry.register('com.desktop-tool.plugin.link-manager', {
  component: LinkManager,
  pluginId: 'com.desktop-tool.plugin.link-manager',
  manifest: linkManagerManifest
});

pluginRegistry.register('com.desktop-tool.plugin.file-hash', {
  component: FileHash,
  pluginId: 'com.desktop-tool.plugin.file-hash',
  manifest: fileHashManifest
});

pluginRegistry.register('com.desktop-tool.plugin.uuid-generator', {
  component: UuidGenerator,
  pluginId: 'com.desktop-tool.plugin.uuid-generator',
  manifest: uuidGeneratorManifest
});

pluginRegistry.register('com.desktop-tool.plugin.timestamp-converter', {
  component: TimestampConverter,
  pluginId: 'com.desktop-tool.plugin.timestamp-converter',
  manifest: timestampConverterManifest
});

pluginRegistry.register('com.desktop-tool.plugin.json-diff', {
  component: JsonDiff,
  pluginId: 'com.desktop-tool.plugin.json-diff',
  manifest: jsonDiffManifest
});

pluginRegistry.register('com.desktop-tool.plugin.document-merger', {
  component: DocumentMerger,
  pluginId: 'com.desktop-tool.plugin.document-merger',
  manifest: documentMergerManifest
});

pluginRegistry.register('com.desktop-tool.plugin.schedule-planner', {
  component: SchedulePlanner,
  pluginId: 'com.desktop-tool.plugin.schedule-planner',
  manifest: schedulePlannerManifest
});

pluginRegistry.register('com.desktop-tool.plugin.meeting-notes', {
  component: MeetingNotes,
  pluginId: 'com.desktop-tool.plugin.meeting-notes',
  manifest: meetingNotesManifest
});

pluginRegistry.register('com.desktop-tool.plugin.article-collector', {
  component: ArticleCollector,
  pluginId: 'com.desktop-tool.plugin.article-collector',
  manifest: articleCollectorManifest
});

pluginRegistry.register('com.desktop-tool.plugin.goal-tracker', {
  component: GoalTracker,
  pluginId: 'com.desktop-tool.plugin.goal-tracker',
  manifest: goalTrackerManifest
});

pluginRegistry.register('com.desktop-tool.plugin.mind-map', {
  component: MindMap,
  pluginId: 'com.desktop-tool.plugin.mind-map',
  manifest: mindMapManifest
});

pluginRegistry.register('com.desktop-tool.plugin.data-pivot', {
  component: DataPivot,
  pluginId: 'com.desktop-tool.plugin.data-pivot',
  manifest: dataPivotManifest
});

pluginRegistry.register('com.desktop-tool.plugin.gradient-generator', {
  component: GradientGenerator,
  pluginId: 'com.desktop-tool.plugin.gradient-generator',
  manifest: gradientGeneratorManifest
});

pluginRegistry.register('com.desktop-tool.plugin.shadow-designer', {
  component: ShadowDesigner,
  pluginId: 'com.desktop-tool.plugin.shadow-designer',
  manifest: shadowDesignerManifest
});

pluginRegistry.register('com.desktop-tool.plugin.image-cropper', {
  component: ImageCropper,
  pluginId: 'com.desktop-tool.plugin.image-cropper',
  manifest: imageCropperManifest
});

pluginRegistry.register('com.desktop-tool.plugin.color-extractor', {
  component: ColorExtractor,
  pluginId: 'com.desktop-tool.plugin.color-extractor',
  manifest: colorExtractorManifest
});

pluginRegistry.register('com.desktop-tool.plugin.layout-grid', {
  component: LayoutGrid,
  pluginId: 'com.desktop-tool.plugin.layout-grid',
  manifest: layoutGridManifest
});

pluginRegistry.register('com.desktop-tool.plugin.animation-generator', {
  component: AnimationGenerator,
  pluginId: 'com.desktop-tool.plugin.animation-generator',
  manifest: animationGeneratorManifest
});

// 路由组件 - 根据hash决定渲染哪个应用
// Web模式：使用modal显示插件，不需要hash路由
// 桌面模式：独立窗口需要hash路由来区分StandaloneApp和App
function Root() {
  const hash = window.location.hash;

  // 检查是否是独立窗口模式（桌面Electron独立窗口）
  const isStandaloneWindow = hash.startsWith('#plugin-standalone/');

  if (isStandaloneWindow) {
    return <StandaloneApp />;
  }

  return <App />;
}

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Custom error handling logic
        console.error('[App] Error caught by ErrorBoundary:', error, errorInfo);
      }}
    >
      <Root />
    </ErrorBoundary>
  </React.StrictMode>
);

