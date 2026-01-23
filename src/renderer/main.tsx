import React, { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import StandaloneApp from "./StandaloneApp";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/global.css";
import "./styles/themes.css";
import "./styles/breakpoints.css";
import "./styles/micro-interactions.css";

// Import plugin registry
import { pluginRegistry } from "./services/PluginRegistry";

// Lazy load plugin manifests only (no components loaded yet)
// Components will be loaded on-demand when plugins are opened
import { calculatorManifest } from "./components/CalculatorPad";
import { jsonFormatterManifest } from "./components/JSONFormatter";
import { passwordGeneratorManifest } from "./components/PasswordGenerator";
import { urlCodecManifest } from "./components/UrlCodec";
import { base64ToolManifest } from "./components/Base64Tool";
import { cryptoToolManifest } from "./components/CryptoTool";
import { notepadManifest } from "./components/Notepad";
import { todoListManifest } from "./components/TodoList";
import { ocrToolManifest } from "./components/OcrTool";
import { colorPickerManifest } from "./components/ColorPicker";
import { unitConverterManifest } from "./components/UnitConverter";
import { codeFormatterManifest } from "./components/CodeFormatter";
import { rulerManifest } from "./components/Ruler";
import { calendarManifest } from "./components/Calendar";
import { audioPlayerManifest } from "./components/AudioPlayer";
import { miniGamesManifest } from "./components/MiniGames";
import { qrCodeGeneratorManifest } from "./components/QRCodeGenerator";
import { stopwatchManifest } from "./components/Stopwatch";
import { quickNoteManifest } from "./components/QuickNote";
import { passwordStrengthManifest } from "./components/PasswordStrength";
import { scientificCalculatorManifest } from "./components/ScientificCalculator";
import { colorPaletteManifest } from "./components/ColorPalette";
import { jsonToTsManifest } from "./components/JsonToTs";
import { regexTesterManifest } from "./components/RegexTester";
import { progressChartsManifest } from "./components/ProgressCharts";
import { worldClockManifest } from "./components/WorldClock";
import { markdownEditorManifest } from "./components/MarkdownEditor";
import { keyboardShortcutsManifest } from "./components/KeyboardShortcuts";
import { kanbanBoardManifest } from "./components/KanbanBoard";
import { pomodoroTimerManifest } from "./components/PomodoroTimer";
import { linkManagerManifest } from "./components/LinkManager";
import { fileHashManifest } from "./components/FileHash";
import { uuidGeneratorManifest } from "./components/UuidGenerator";
import { timestampConverterManifest } from "./components/TimestampConverter";
import { jsonDiffManifest } from "./components/JsonDiff";
import { documentMergerManifest } from "./components/DocumentMerger";
import { schedulePlannerManifest } from "./components/SchedulePlanner";
import { meetingNotesManifest } from "./components/MeetingNotes";
import { articleCollectorManifest } from "./components/ArticleCollector";
import { goalTrackerManifest } from "./components/GoalTracker";
import { mindMapManifest } from "./components/MindMap";
import { dataPivotManifest } from "./components/DataPivot";
import { gradientGeneratorManifest } from "./components/GradientGenerator";
import { shadowDesignerManifest } from "./components/ShadowDesigner";
import { imageCropperManifest } from "./components/ImageCropper";
import { colorExtractorManifest } from "./components/ColorExtractor";
import { layoutGridManifest } from "./components/LayoutGrid";
import { animationGeneratorManifest } from "./components/AnimationGenerator";

// Lazy load plugin components
const lazyPlugins = {
  "com.desktop-tool.calculator-pad": lazy(
    () => import("./components/CalculatorPad"),
  ),
  "com.desktop-tool.json-formatter": lazy(
    () => import("./components/JSONFormatter"),
  ),
  "com.desktop-tool.plugin.password-generator": lazy(
    () => import("./components/PasswordGenerator"),
  ),
  "com.desktop-tool.plugin.url-codec": lazy(
    () => import("./components/UrlCodec"),
  ),
  "com.desktop-tool.plugin.base64-tool": lazy(
    () => import("./components/Base64Tool"),
  ),
  "com.desktop-tool.plugin.crypto-tool": lazy(
    () => import("./components/CryptoTool"),
  ),
  "com.desktop-tool.plugin.notepad": lazy(() => import("./components/Notepad")),
  "com.desktop-tool.plugin.todo-list": lazy(
    () => import("./components/TodoList"),
  ),
  "com.desktop-tool.plugin.ocr-tool": lazy(
    () => import("./components/OcrTool"),
  ),
  "com.desktop-tool.plugin.color-picker": lazy(
    () => import("./components/ColorPicker"),
  ),
  "com.desktop-tool.plugin.unit-converter": lazy(
    () => import("./components/UnitConverter"),
  ),
  "com.desktop-tool.plugin.code-formatter": lazy(
    () => import("./components/CodeFormatter"),
  ),
  "com.desktop-tool.plugin.ruler": lazy(() => import("./components/Ruler")),
  "com.desktop-tool.plugin.calendar": lazy(
    () => import("./components/Calendar"),
  ),
  "com.desktop-tool.plugin.audio-player": lazy(
    () => import("./components/AudioPlayer"),
  ),
  "com.desktop-tool.plugin.mini-games": lazy(
    () => import("./components/MiniGames"),
  ),
  "com.desktop-tool.plugin.qrcode-generator": lazy(
    () => import("./components/QRCodeGenerator"),
  ),
  "com.desktop-tool.plugin.stopwatch": lazy(
    () => import("./components/Stopwatch"),
  ),
  "com.desktop-tool.plugin.quick-note": lazy(
    () => import("./components/QuickNote"),
  ),
  "com.desktop-tool.plugin.password-strength": lazy(
    () => import("./components/PasswordStrength"),
  ),
  "com.desktop-tool.plugin.scientific-calculator": lazy(
    () => import("./components/ScientificCalculator"),
  ),
  "com.desktop-tool.plugin.color-palette": lazy(
    () => import("./components/ColorPalette"),
  ),
  "com.desktop-tool.plugin.json-to-ts": lazy(
    () => import("./components/JsonToTs"),
  ),
  "com.desktop-tool.plugin.regex-tester": lazy(
    () => import("./components/RegexTester"),
  ),
  "com.desktop-tool.plugin.progress-charts": lazy(
    () => import("./components/ProgressCharts"),
  ),
  "com.desktop-tool.plugin.world-clock": lazy(
    () => import("./components/WorldClock"),
  ),
  "com.desktop-tool.plugin.markdown-editor": lazy(
    () => import("./components/MarkdownEditor"),
  ),
  "com.desktop-tool.plugin.keyboard-shortcuts": lazy(
    () => import("./components/KeyboardShortcuts"),
  ),
  "com.desktop-tool.plugin.kanban-board": lazy(
    () => import("./components/KanbanBoard"),
  ),
  "com.desktop-tool.plugin.pomodoro-timer": lazy(
    () => import("./components/PomodoroTimer"),
  ),
  "com.desktop-tool.plugin.link-manager": lazy(
    () => import("./components/LinkManager"),
  ),
  "com.desktop-tool.plugin.file-hash": lazy(
    () => import("./components/FileHash"),
  ),
  "com.desktop-tool.plugin.uuid-generator": lazy(
    () => import("./components/UuidGenerator"),
  ),
  "com.desktop-tool.plugin.timestamp-converter": lazy(
    () => import("./components/TimestampConverter"),
  ),
  "com.desktop-tool.plugin.json-diff": lazy(
    () => import("./components/JsonDiff"),
  ),
  "com.desktop-tool.plugin.document-merger": lazy(
    () => import("./components/DocumentMerger"),
  ),
  "com.desktop-tool.plugin.schedule-planner": lazy(
    () => import("./components/SchedulePlanner"),
  ),
  "com.desktop-tool.plugin.meeting-notes": lazy(
    () => import("./components/MeetingNotes"),
  ),
  "com.desktop-tool.plugin.article-collector": lazy(
    () => import("./components/ArticleCollector"),
  ),
  "com.desktop-tool.plugin.goal-tracker": lazy(
    () => import("./components/GoalTracker"),
  ),
  "com.desktop-tool.plugin.mind-map": lazy(
    () => import("./components/MindMap"),
  ),
  "com.desktop-tool.plugin.data-pivot": lazy(
    () => import("./components/DataPivot"),
  ),
  "com.desktop-tool.plugin.gradient-generator": lazy(
    () => import("./components/GradientGenerator"),
  ),
  "com.desktop-tool.plugin.shadow-designer": lazy(
    () => import("./components/ShadowDesigner"),
  ),
  "com.desktop-tool.plugin.image-cropper": lazy(
    () => import("./components/ImageCropper"),
  ),
  "com.desktop-tool.plugin.color-extractor": lazy(
    () => import("./components/ColorExtractor"),
  ),
  "com.desktop-tool.plugin.layout-grid": lazy(
    () => import("./components/LayoutGrid"),
  ),
  "com.desktop-tool.plugin.animation-generator": lazy(
    () => import("./components/AnimationGenerator"),
  ),
};

// Register plugin manifests only (components loaded on-demand)
// This improves initial load time significantly
pluginRegistry.registerManifest(
  "com.desktop-tool.calculator-pad",
  calculatorManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.json-formatter",
  jsonFormatterManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.password-generator",
  passwordGeneratorManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.url-codec",
  urlCodecManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.base64-tool",
  base64ToolManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.crypto-tool",
  cryptoToolManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.notepad",
  notepadManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.todo-list",
  todoListManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.ocr-tool",
  ocrToolManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.color-picker",
  colorPickerManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.unit-converter",
  unitConverterManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.code-formatter",
  codeFormatterManifest,
);
pluginRegistry.registerManifest("com.desktop-tool.plugin.ruler", rulerManifest);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.calendar",
  calendarManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.audio-player",
  audioPlayerManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.mini-games",
  miniGamesManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.qrcode-generator",
  qrCodeGeneratorManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.stopwatch",
  stopwatchManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.quick-note",
  quickNoteManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.password-strength",
  passwordStrengthManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.scientific-calculator",
  scientificCalculatorManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.color-palette",
  colorPaletteManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.json-to-ts",
  jsonToTsManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.regex-tester",
  regexTesterManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.progress-charts",
  progressChartsManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.world-clock",
  worldClockManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.markdown-editor",
  markdownEditorManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.keyboard-shortcuts",
  keyboardShortcutsManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.kanban-board",
  kanbanBoardManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.pomodoro-timer",
  pomodoroTimerManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.link-manager",
  linkManagerManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.file-hash",
  fileHashManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.uuid-generator",
  uuidGeneratorManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.timestamp-converter",
  timestampConverterManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.json-diff",
  jsonDiffManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.document-merger",
  documentMergerManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.schedule-planner",
  schedulePlannerManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.meeting-notes",
  meetingNotesManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.article-collector",
  articleCollectorManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.goal-tracker",
  goalTrackerManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.mind-map",
  mindMapManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.data-pivot",
  dataPivotManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.gradient-generator",
  gradientGeneratorManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.shadow-designer",
  shadowDesignerManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.image-cropper",
  imageCropperManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.color-extractor",
  colorExtractorManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.layout-grid",
  layoutGridManifest,
);
pluginRegistry.registerManifest(
  "com.desktop-tool.plugin.animation-generator",
  animationGeneratorManifest,
);

// Export lazy-loaded components for dynamic import
export { lazyPlugins };

// 路由组件 - 根据hash决定渲染哪个应用
function Root() {
  const hash = window.location.hash;

  // 检查是否是独立窗口模式（桌面Electron独立窗口）
  const isStandaloneWindow = hash.startsWith("#plugin-standalone/");

  if (isStandaloneWindow) {
    return <StandaloneApp />;
  }

  return <App />;
}

// 渲染应用
const root = ReactDOM.createRoot(document.getElementById("root")!);

// Only use StrictMode in development
const isDevelopment = process.env.NODE_ENV === "development";

root.render(
  <>
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "18px",
            color: "#666",
          }}
        >
          Loading...
        </div>
      }
    >
      <ErrorBoundary
        onError={(error, errorInfo) => {
          // Custom error handling logic
          console.error(
            "[App] Error caught by ErrorBoundary:",
            error,
            errorInfo,
          );
        }}
      >
        <Root />
      </ErrorBoundary>
    </Suspense>
  </>,
);
