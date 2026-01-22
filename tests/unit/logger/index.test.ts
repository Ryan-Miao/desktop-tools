/**
 * Logger Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, createLogger, LogLevel } from "@shared/logger";
import UnifiedLogger from "@shared/logger";

describe("UnifiedLogger", () => {
  let spyDebug: any;
  let spyLog: any;
  let spyWarn: any;
  let spyError: any;

  beforeEach(() => {
    // Spy on console methods
    spyDebug = vi.spyOn(console, "debug").mockImplementation(() => {});
    spyLog = vi.spyOn(console, "log").mockImplementation(() => {});
    spyWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    spyError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore spies
    spyDebug.mockRestore();
    spyLog.mockRestore();
    spyWarn.mockRestore();
    spyError.mockRestore();
  });

  describe("log levels", () => {
    it("should log debug messages", () => {
      const testLogger = new UnifiedLogger({ minLevel: LogLevel.DEBUG });
      testLogger.debug("Test debug message", { key: "value" });

      expect(spyDebug).toHaveBeenCalled();
      const call = spyDebug.mock.calls[0];
      expect(call[0]).toContain("DEBUG");
      expect(call[0]).toContain("Test debug message");
      expect(call[2]).toEqual({ key: "value" });
    });

    it("should log info messages", () => {
      const testLogger = new UnifiedLogger();
      testLogger.info("Test info message");

      expect(spyLog).toHaveBeenCalled();
      const call = spyLog.mock.calls[0];
      expect(call[0]).toContain("INFO");
      expect(call[0]).toContain("Test info message");
      expect(call[2]).toEqual("");
    });

    it("should log warn messages", () => {
      const testLogger = new UnifiedLogger();
      testLogger.warn("Test warn message");

      expect(spyWarn).toHaveBeenCalled();
      const call = spyWarn.mock.calls[0];
      expect(call[0]).toContain("WARN");
      expect(call[0]).toContain("Test warn message");
    });

    it("should log error messages", () => {
      const testLogger = new UnifiedLogger();
      testLogger.error("Test error message", { error: "details" });

      expect(spyError).toHaveBeenCalled();
      const call = spyError.mock.calls[0];
      expect(call[0]).toContain("ERROR");
      expect(call[0]).toContain("Test error message");
      expect(call[2]).toEqual({ error: "details" });
    });

    it("should filter logs below min level", () => {
      const testLogger = new UnifiedLogger({ minLevel: LogLevel.WARN });
      testLogger.debug("Should not appear");
      testLogger.info("Should not appear");
      testLogger.warn("Should appear");
      testLogger.error("Should appear");

      expect(spyDebug).not.toHaveBeenCalled();
      expect(spyLog).not.toHaveBeenCalled();
      expect(spyWarn).toHaveBeenCalledTimes(1);
      expect(spyError).toHaveBeenCalledTimes(1);
    });
  });

  describe("setMinLevel", () => {
    it("should change minimum log level", () => {
      const testLogger = new UnifiedLogger({ minLevel: LogLevel.ERROR });

      testLogger.info("Should not log");
      expect(spyLog).not.toHaveBeenCalled();

      testLogger.setMinLevel(LogLevel.DEBUG);
      testLogger.info("Should log now");
      expect(spyLog).toHaveBeenCalledTimes(1);
    });
  });

  describe("createModuleLogger", () => {
    it("should create logger with module name", () => {
      const baseLogger = new UnifiedLogger();
      const moduleLogger = baseLogger.createModuleLogger("TestModule");

      moduleLogger.info("Test message");

      expect(spyLog).toHaveBeenCalled();
      const call = spyLog.mock.calls[0];
      expect(call[0]).toContain("[TestModule]");
      expect(call[0]).toContain("Test message");
    });
  });

  describe("module name in config", () => {
    it("should include module name in log output", () => {
      const testLogger = new UnifiedLogger({
        module: "MyModule",
        minLevel: LogLevel.DEBUG,
      });

      testLogger.info("Module test message");

      expect(spyLog).toHaveBeenCalled();
      const call = spyLog.mock.calls[0];
      expect(call[0]).toContain("[MyModule]");
      expect(call[0]).toContain("Module test message");
    });
  });

  describe("console output formatting", () => {
    it("should format log message with timestamp and level", () => {
      const testLogger = new UnifiedLogger({ minLevel: LogLevel.DEBUG });
      testLogger.info("Formatted message");

      const call = spyLog.mock.calls[0][0];
      expect(call).toMatch(/\d{4}-\d{2}-\d{2}T.*Z/); // ISO timestamp
      expect(call).toContain("[INFO]");
    });

    it("should handle data parameter", () => {
      const testLogger = new UnifiedLogger();
      const testData = { user: "test", count: 42 };

      testLogger.info("Data test", testData);

      expect(spyLog).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        testData,
      );
    });

    it("should handle null data", () => {
      const testLogger = new UnifiedLogger();

      testLogger.info("Null data test", null);

      expect(spyLog).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "", // null is converted to empty string
      );
    });

    it("should handle undefined data", () => {
      const testLogger = new UnifiedLogger();

      testLogger.info("Undefined data test");

      expect(spyLog).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "", // Default empty string
      );
    });
  });

  describe("enableConsole option", () => {
    it("should not log to console when disabled", () => {
      const testLogger = new UnifiedLogger({
        enableConsole: false,
        minLevel: LogLevel.DEBUG,
      });

      testLogger.info("Should not appear");
      testLogger.error("Should not appear either");

      expect(spyLog).not.toHaveBeenCalled();
      expect(spyError).not.toHaveBeenCalled();
    });
  });

  describe("web mode behavior", () => {
    it("should work in web mode (non-electron)", () => {
      // In test environment (web mode), should not crash
      const testLogger = new UnifiedLogger({
        minLevel: LogLevel.DEBUG,
      });

      expect(() => {
        testLogger.debug("Web mode debug");
        testLogger.info("Web mode info");
        testLogger.warn("Web mode warn");
        testLogger.error("Web mode error");
      }).not.toThrow();

      expect(spyDebug).toHaveBeenCalledTimes(1);
      expect(spyLog).toHaveBeenCalledTimes(1);
      expect(spyWarn).toHaveBeenCalledTimes(1);
      expect(spyError).toHaveBeenCalledTimes(1);
    });
  });

  describe("query and getStats", () => {
    beforeEach(() => {
      // Clean up any electron mocks to ensure test isolation
      delete (window as any).electron;
    });

    it("should not throw when calling query", async () => {
      const testLogger = new UnifiedLogger();

      await expect(testLogger.query()).resolves.toBeDefined();
    });

    it("should return empty array in web mode when calling query", async () => {
      // Ensure no electron mock exists
      delete (window as any).electron;

      const testLogger = new UnifiedLogger();
      (testLogger as any).isDesktop = false;

      const result = await testLogger.query();

      expect(result).toEqual([]);
    });

    it("should handle query options without throwing", async () => {
      const testLogger = new UnifiedLogger();

      await expect(testLogger.query({ level: "error" })).resolves.toBeDefined();
    });

    it("should query logs via IPC in desktop mode", async () => {
      const mockLogs = [
        {
          timestamp: "2026-01-22T00:00:00.000Z",
          level: 1,
          message: "Test log",
          data: undefined,
        },
      ];
      const mockElectron = {
        ipcRenderer: {
          invoke: vi.fn().mockResolvedValue(mockLogs),
        },
      };
      (window as any).electron = mockElectron;

      const testLogger = new UnifiedLogger();
      (testLogger as any).isDesktop = true;

      const result = await testLogger.query({ level: "info" });

      expect(mockElectron.ipcRenderer.invoke).toHaveBeenCalledWith(
        "log:query",
        { level: "info" },
      );
      expect(result).toHaveLength(1);
      expect(result[0].timestamp).toBeInstanceOf(Date);

      // Cleanup
      delete (window as any).electron;
    });

    it("should handle query errors gracefully", async () => {
      const mockElectron = {
        ipcRenderer: {
          invoke: vi.fn().mockRejectedValue(new Error("Query failed")),
        },
      };
      (window as any).electron = mockElectron;

      const testLogger = new UnifiedLogger();
      (testLogger as any).isDesktop = true;

      // Should not throw, return empty array on error
      const result = await testLogger.query();
      expect(result).toEqual([]);

      // Cleanup
      delete (window as any).electron;
    });

    it("should return empty stats in web mode", async () => {
      // Ensure no electron mock exists
      delete (window as any).electron;

      const testLogger = new UnifiedLogger();
      // Explicitly set to web mode
      (testLogger as any).isDesktop = false;

      const stats = await testLogger.getStats();

      // In web mode, should return empty stats
      expect(stats).toEqual({ total: 0, byLevel: {}, byModule: {} });
    });

    it("should handle IPC errors gracefully", async () => {
      const testLogger = new UnifiedLogger({ minLevel: LogLevel.DEBUG });

      // Mock electron to simulate desktop mode with IPC error
      const mockElectron = {
        ipcRenderer: {
          invoke: vi.fn().mockRejectedValue(new Error("IPC connection failed")),
        },
      };
      (window as any).electron = mockElectron;

      // Force desktop mode
      (testLogger as any).isDesktop = true;

      // Should not throw, return empty stats on error
      const stats = await testLogger.getStats();
      expect(stats).toBeDefined();
      expect(mockElectron.ipcRenderer.invoke).toHaveBeenCalledWith("log:stats");

      // Cleanup
      delete (window as any).electron;
    });

    it("should call ipcRenderer when in desktop mode", async () => {
      const mockStats = {
        total: 100,
        byLevel: { info: 50, error: 10 },
        byModule: { TestModule: 25 },
      };
      const mockElectron = {
        ipcRenderer: {
          invoke: vi.fn().mockResolvedValue(mockStats),
        },
      };
      (window as any).electron = mockElectron;

      const testLogger = new UnifiedLogger();
      (testLogger as any).isDesktop = true;

      const stats = await testLogger.getStats();

      expect(stats).toEqual(mockStats);
      expect(mockElectron.ipcRenderer.invoke).toHaveBeenCalledWith("log:stats");

      // Cleanup
      delete (window as any).electron;
    });
  });

  describe("IPC error handling", () => {
    let spyConsoleError: any;

    beforeEach(() => {
      spyConsoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      spyConsoleError.mockRestore();
    });

    it("should handle ipcRenderer.send errors gracefully", () => {
      const mockElectron = {
        ipcRenderer: {
          send: vi.fn().mockImplementation(() => {
            throw new Error("IPC send failed");
          }),
        },
      };
      (window as any).electron = mockElectron;

      const testLogger = new UnifiedLogger({ minLevel: LogLevel.DEBUG });

      // This should trigger sendToMainProcess which will call ipcRenderer.send
      // The error should be caught and logged, not thrown
      expect(() => {
        testLogger.debug("Test message that will fail to send");
      }).not.toThrow();

      // Verify error was logged
      expect(spyConsoleError).toHaveBeenCalledWith(
        "[Logger] Failed to send log to main process:",
        expect.any(Error),
      );

      // Cleanup
      delete (window as any).electron;
    });
  });

  describe("setMainProcessLogService", () => {
    it("should accept log service instance", () => {
      const testLogger = new UnifiedLogger();
      const mockService = {
        write: vi.fn(),
      };

      expect(() => {
        testLogger.setMainProcessLogService(mockService);
      }).not.toThrow();
    });
  });
});

describe("exported logger instance", () => {
  let spyLog: any;

  beforeEach(() => {
    spyLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    spyLog.mockRestore();
  });

  it("should be usable directly", () => {
    logger.info("Default logger test");

    expect(spyLog).toHaveBeenCalled();
    const call = spyLog.mock.calls[0];
    expect(call[0]).toContain("INFO");
    expect(call[0]).toContain("Default logger test");
  });
});

describe("createLogger helper", () => {
  let spyLog: any;

  beforeEach(() => {
    spyLog = vi.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    spyLog.mockRestore();
  });

  it("should create logger with module name", () => {
    const moduleLogger = createLogger("TestModule");
    moduleLogger.info("Helper test");

    expect(spyLog).toHaveBeenCalled();
    const call = spyLog.mock.calls[0];
    expect(call[0]).toContain("[TestModule]");
    expect(call[0]).toContain("Helper test");
  });
});
