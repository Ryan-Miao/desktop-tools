import React, { useState, useEffect, useCallback } from "react";

// Demo JSON (object format for format/minify/validate)
const DEMO_JSON = {
  project: "Desktop Tool",
  version: "1.0.0",
  features: ["Plugin System", "JSON Formatter", "Calculator", "Auto Backup"],
  config: {
    theme: "dark",
    autoSave: true,
    maxBackups: 10,
  },
};

// Demo JSON Array (for JSON→CSV conversion)
const DEMO_JSON_ARRAY = [
  { name: "Alice", age: 30, city: "New York" },
  { name: "Bob", age: 25, city: "London" },
  { name: "Charlie", age: 35, city: "Paris" },
];

// Demo CSV (for CSV→JSON conversion)
const DEMO_CSV = `name,age,city
Alice,30,New York
Bob,25,London
Charlie,35,Paris`;

type Mode =
  | "format"
  | "minify"
  | "validate"
  | "escape"
  | "unescape"
  | "csvToJson"
  | "jsonToCsv";

interface JSONFormatterProps {
  pluginId: string;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
}

// Embedded PluginWindow component for standalone plugin
const PluginWindow: React.FC<{
  title: string;
  icon: string;
  children: React.ReactNode;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
}> = ({
  title,
  icon,
  children,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized,
}) => {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "rgba(30, 30, 30, 0.95)",
        backdropFilter: "blur(20px)",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Title Bar */}
      <div
        style={
          {
            height: "48px",
            background: "rgba(0, 0, 0, 0.3)",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            WebkitAppRegion: "drag",
          } as React.CSSProperties
        }
      >
        <span style={{ fontSize: "20px", marginRight: "8px" }}>{icon}</span>
        <span
          style={{
            color: "#e0e0e0",
            fontSize: "14px",
            fontWeight: "500",
            flex: 1,
          }}
        >
          {title}
        </span>
        <div
          style={
            {
              display: "flex",
              gap: "8px",
              WebkitAppRegion: "no-drag",
            } as React.CSSProperties
          }
        >
          <button
            onClick={onMinimize}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border: "none",
              background: "transparent",
              color: "#a0a0a0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            −
          </button>
          <button
            onClick={onMaximize}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border: "none",
              background: "transparent",
              color: "#a0a0a0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            {isMaximized ? "⤢" : "□"}
          </button>
          <button
            onClick={onClose}
            style={{
              width: "28px",
              height: "28px",
              borderRadius: "6px",
              border: "none",
              background: "transparent",
              color: "#a0a0a0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#e81123";
              e.currentTarget.style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#a0a0a0";
            }}
          >
            ×
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>{children}</div>
    </div>
  );
};

// CSV parsing utility
const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
};

const csvToJson = (csv: string): string => {
  const lines = csv.trim().split("\n");
  if (lines.length < 2) {
    throw new Error("CSV 至少需要 2 行（表头 + 数据）");
  }

  const headers = parseCsvLine(lines[0]);
  const result: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const obj: Record<string, string> = {};

    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });

    result.push(obj);
  }

  return JSON.stringify(result, null, 2);
};

const jsonToCsv = (jsonStr: string): string => {
  const data = JSON.parse(jsonStr);

  if (!Array.isArray(data)) {
    throw new Error("JSON 必须是数组格式");
  }

  if (data.length === 0) {
    throw new Error("JSON 数组不能为空");
  }

  const headersSet = new Set<string>();
  data.forEach((obj: Record<string, unknown>) => {
    Object.keys(obj).forEach((key) => headersSet.add(key));
  });
  const headers = Array.from(headersSet);

  const csvRows: string[] = [];
  csvRows.push(headers.join(","));

  for (const obj of data) {
    const values = headers.map((header) => {
      const val = obj[header];
      const strVal = val === null || val === undefined ? "" : String(val);

      if (
        strVal.includes(",") ||
        strVal.includes('"') ||
        strVal.includes("\n")
      ) {
        return `"${strVal.replace(/"/g, '""')}"`;
      }
      return strVal;
    });
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};

const JSONFormatter: React.FC<JSONFormatterProps> = ({
  pluginId: _pluginId,
  onClose,
  onMinimize,
  onMaximize,
  isMaximized = false,
}) => {
  const [input, setInput] = useState(JSON.stringify(DEMO_JSON, null, 2));
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<Mode>("format");
  const [error, setError] = useState("");
  const [stats, setStats] = useState({ chars: 0, lines: 0, size: 0 });

  const processJSON = useCallback((jsonString: string, currentMode: Mode) => {
    try {
      switch (currentMode) {
        case "format":
          const parsed = JSON.parse(jsonString);
          const formatted = JSON.stringify(parsed, null, 2);
          setOutput(formatted);
          setError("");
          break;

        case "minify":
          const minified = JSON.stringify(JSON.parse(jsonString));
          setOutput(minified);
          setError("");
          break;

        case "validate":
          JSON.parse(jsonString);
          setOutput("✅ JSON 格式有效");
          setError("");
          break;

        case "escape":
          const escaped = JSON.stringify(jsonString);
          setOutput(escaped);
          setError("");
          break;

        case "unescape":
          const unescaped = JSON.parse(jsonString);
          if (typeof unescaped === "string") {
            setOutput(unescaped);
            setError("");
          } else {
            throw new Error("输入不是有效的 JSON 字符串");
          }
          break;

        case "csvToJson":
          const csvResult = csvToJson(jsonString);
          setOutput(csvResult);
          setError("");
          break;

        case "jsonToCsv":
          const csvResult2 = jsonToCsv(jsonString);
          setOutput(csvResult2);
          setError("");
          break;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "处理失败";
      setError(errorMsg);
      if (currentMode === "validate") {
        setOutput(`❌ ${errorMsg}`);
      } else {
        setOutput("");
      }
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      processJSON(input, mode);
    }, 300);

    return () => clearTimeout(timer);
  }, [input, mode, processJSON]);

  useEffect(() => {
    setStats({
      chars: output.length,
      lines: output.split("\n").length,
      size: new Blob([output]).size,
    });
  }, [output]);

  const handleLoadDemo = () => {
    if (mode === "csvToJson") {
      setInput(DEMO_CSV);
    } else if (mode === "jsonToCsv") {
      setInput(JSON.stringify(DEMO_JSON_ARRAY, null, 2));
    } else {
      setInput(JSON.stringify(DEMO_JSON, null, 2));
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const getPlaceholder = (): string => {
    switch (mode) {
      case "format":
      case "minify":
      case "validate":
        return "输入 JSON...";
      case "escape":
        return "输入需要转义的字符串...";
      case "unescape":
        return "输入转义的 JSON 字符串...";
      case "csvToJson":
        return "输入 CSV 数据（第一行为表头）...";
      case "jsonToCsv":
        return "输入 JSON 数组...";
    }
  };

  const getInputLabel = (): string => {
    switch (mode) {
      case "csvToJson":
        return "CSV 输入";
      case "jsonToCsv":
        return "JSON 输入";
      case "escape":
      case "unescape":
        return "字符串输入";
      default:
        return "JSON 输入";
    }
  };

  return (
    <PluginWindow
      title="JSON 工具"
      icon="📝"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      isMaximized={isMaximized}
    >
      <div
        style={{
          padding: "20px",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Mode Buttons */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            onClick={() => setMode("format")}
            style={{
              flex: "1 1 auto",
              minWidth: "70px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background:
                mode === "format"
                  ? "rgba(59, 130, 246, 0.3)"
                  : "rgba(255, 255, 255, 0.05)",
              color: mode === "format" ? "#60a5fa" : "#b0b0b0",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            格式化
          </button>
          <button
            onClick={() => setMode("minify")}
            style={{
              flex: "1 1 auto",
              minWidth: "70px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background:
                mode === "minify"
                  ? "rgba(59, 130, 246, 0.3)"
                  : "rgba(255, 255, 255, 0.05)",
              color: mode === "minify" ? "#60a5fa" : "#b0b0b0",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            压缩
          </button>
          <button
            onClick={() => setMode("validate")}
            style={{
              flex: "1 1 auto",
              minWidth: "70px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background:
                mode === "validate"
                  ? "rgba(59, 130, 246, 0.3)"
                  : "rgba(255, 255, 255, 0.05)",
              color: mode === "validate" ? "#60a5fa" : "#b0b0b0",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            验证
          </button>
          <button
            onClick={() => setMode("escape")}
            style={{
              flex: "1 1 auto",
              minWidth: "70px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background:
                mode === "escape"
                  ? "rgba(59, 130, 246, 0.3)"
                  : "rgba(255, 255, 255, 0.05)",
              color: mode === "escape" ? "#60a5fa" : "#b0b0b0",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            转义
          </button>
          <button
            onClick={() => setMode("unescape")}
            style={{
              flex: "1 1 auto",
              minWidth: "70px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background:
                mode === "unescape"
                  ? "rgba(59, 130, 246, 0.3)"
                  : "rgba(255, 255, 255, 0.05)",
              color: mode === "unescape" ? "#60a5fa" : "#b0b0b0",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            反转义
          </button>
          <button
            onClick={() => setMode("csvToJson")}
            style={{
              flex: "1 1 auto",
              minWidth: "70px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background:
                mode === "csvToJson"
                  ? "rgba(59, 130, 246, 0.3)"
                  : "rgba(255, 255, 255, 0.05)",
              color: mode === "csvToJson" ? "#60a5fa" : "#b0b0b0",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            CSV→JSON
          </button>
          <button
            onClick={() => setMode("jsonToCsv")}
            style={{
              flex: "1 1 auto",
              minWidth: "70px",
              padding: "8px 12px",
              borderRadius: "6px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              background:
                mode === "jsonToCsv"
                  ? "rgba(59, 130, 246, 0.3)"
                  : "rgba(255, 255, 255, 0.05)",
              color: mode === "jsonToCsv" ? "#60a5fa" : "#b0b0b0",
              cursor: "pointer",
              fontSize: "12px",
              fontWeight: "500",
              transition: "all 0.2s",
            }}
          >
            JSON→CSV
          </button>
        </div>

        {/* Editors */}
        <div style={{ flex: 1, display: "flex", gap: "16px", minHeight: 0 }}>
          {/* Input */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  color: "#a0a0a0",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                {getInputLabel()}
              </span>
              <button
                onClick={handleLoadDemo}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "#b0b0b0",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                加载示例
              </button>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={getPlaceholder()}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                background: "rgba(0, 0, 0, 0.3)",
                color: "#e0e0e0",
                fontSize: "13px",
                fontFamily: "Monaco, Menlo, monospace",
                resize: "none",
                outline: "none",
              }}
            />
          </div>

          {/* Output */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <span
                style={{
                  color: "#a0a0a0",
                  fontSize: "12px",
                  fontWeight: "500",
                }}
              >
                输出
              </span>
              <button
                onClick={handleCopy}
                disabled={!output || mode === "validate"}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background:
                    !output || mode === "validate"
                      ? "rgba(255, 255, 255, 0.02)"
                      : "rgba(255, 255, 255, 0.05)",
                  color: !output || mode === "validate" ? "#505050" : "#b0b0b0",
                  cursor:
                    !output || mode === "validate" ? "not-allowed" : "pointer",
                  fontSize: "11px",
                }}
              >
                复制
              </button>
            </div>
            <div
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "8px",
                border: `1px solid ${error ? "rgba(239, 68, 68, 0.3)" : "rgba(255, 255, 255, 0.1)"}`,
                background: error
                  ? "rgba(239, 68, 68, 0.1)"
                  : "rgba(0, 0, 0, 0.3)",
                overflow: "auto",
                fontFamily: "Monaco, Menlo, monospace",
                fontSize: "13px",
                color: error ? "#f87171" : "#e0e0e0",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              {output || (error ? "" : "等待输入...")}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            padding: "12px",
            borderRadius: "8px",
            background: "rgba(0, 0, 0, 0.2)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: "#707070", fontSize: "11px" }}>字符数</span>
            <span
              style={{ color: "#b0b0b0", fontSize: "16px", fontWeight: "600" }}
            >
              {stats.chars.toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: "#707070", fontSize: "11px" }}>行数</span>
            <span
              style={{ color: "#b0b0b0", fontSize: "16px", fontWeight: "600" }}
            >
              {stats.lines.toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ color: "#707070", fontSize: "11px" }}>大小</span>
            <span
              style={{ color: "#b0b0b0", fontSize: "16px", fontWeight: "600" }}
            >
              {stats.size < 1024
                ? `${stats.size} B`
                : `${(stats.size / 1024).toFixed(1)} KB`}
            </span>
          </div>
        </div>
      </div>
    </PluginWindow>
  );
};

export default JSONFormatter;

export const jsonFormatterManifest = {
  id: "com.desktop-tool.json-formatter",
  name: "JSON 工具",
  version: "1.0.0",
  description: "格式化、压缩、验证、转义、反转义、CSV 与 JSON 互转",
  author: "Desktop Tool",
  icon: "📝",
  entry: "index.js",
  category: "工具",
};
