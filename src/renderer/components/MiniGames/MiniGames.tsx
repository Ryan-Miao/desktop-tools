/**
 * Mini Games Plugin - 2048
 *
 * Classic 2048 puzzle game
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import PluginWindow from "../PluginWindow/PluginWindow";
import styles from "./MiniGames.module.css";

type Direction = "up" | "down" | "left" | "right";

interface GameState {
  board: number[][];
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
}

interface MiniGamesProps {
  onClose: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

const SIZE = 4;

const MiniGames: React.FC<MiniGamesProps> = ({
  onClose,
  onMinimize,
  onMaximize,
}) => {
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedBest = localStorage.getItem("2048-best-score");
    return {
      board: Array(SIZE)
        .fill(null)
        .map(() => Array(SIZE).fill(0)),
      score: 0,
      bestScore: savedBest ? parseInt(savedBest, 10) : 0,
      gameOver: false,
      won: false,
    };
  });

  const [isNewGame, setIsNewGame] = useState(true);
  const boardRef = useRef<HTMLDivElement>(null);

  // Initialize game
  const initGame = useCallback(() => {
    const newBoard = Array(SIZE)
      .fill(null)
      .map(() => Array(SIZE).fill(0));
    addRandomTile(newBoard);
    addRandomTile(newBoard);

    setGameState((prev) => ({
      ...prev,
      board: newBoard,
      score: 0,
      gameOver: false,
      won: false,
    }));
    setIsNewGame(false);
  }, []);

  // Add random tile (2 or 4)
  const addRandomTile = useCallback((board: number[][]) => {
    const emptyCells: [number, number][] = [];
    board.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell === 0) {
          emptyCells.push([i, j]);
        }
      });
    });

    if (emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const position = emptyCells[randomIndex];
      if (position) {
        const [row, col] = position;
        const targetRow = board[row];
        if (targetRow) {
          targetRow[col] = Math.random() < 0.9 ? 2 : 4;
        }
      }
    }
  }, []);

  // Clone board
  const cloneBoard = useCallback((board: number[][]) => {
    return board.map((row) => [...row]);
  }, []);

  // Slide row to left
  const slideRow = useCallback((row: number[]): number[] => {
    const filtered = row.filter((cell) => cell !== 0);
    const result: number[] = [];

    for (let i = 0; i < filtered.length; i++) {
      const current = filtered[i];
      const next = filtered[i + 1];
      if (
        i < filtered.length - 1 &&
        current !== undefined &&
        current === next
      ) {
        result.push(current * 2);
        i++;
      } else {
        if (current !== undefined) {
          result.push(current);
        }
      }
    }

    while (result.length < SIZE) {
      result.push(0);
    }

    return result;
  }, []);

  // Move board
  const moveBoard = useCallback(
    (
      direction: Direction,
    ): { board: number[][]; score: number; moved: boolean } => {
      const newBoard = cloneBoard(gameState.board);
      let score = 0;
      let moved = false;

      if (direction === "left") {
        for (let i = 0; i < SIZE; i++) {
          const row = newBoard[i];
          if (row) {
            const originalRow = [...row];
            const newRow = slideRow(row);
            newBoard[i] = newRow;
            if (originalRow.join(",") !== newRow.join(",")) {
              moved = true;
            }
          }
        }
      } else if (direction === "right") {
        for (let i = 0; i < SIZE; i++) {
          const row = newBoard[i];
          if (row) {
            const originalRow = [...row];
            const reversed = row.reverse();
            const slid = slideRow(reversed);
            const newRow = slid.reverse();
            newBoard[i] = newRow;
            if (originalRow.join(",") !== newRow.join(",")) {
              moved = true;
            }
          }
        }
      } else if (direction === "up") {
        for (let j = 0; j < SIZE; j++) {
          const column = newBoard
            .map((row) => row[j])
            .filter((val): val is number => val !== undefined);
          const originalCol = [...column];
          const slid = slideRow(column);
          for (let i = 0; i < SIZE; i++) {
            const row = newBoard[i];
            const cell = slid[i];
            if (row && cell !== undefined) {
              row[j] = cell;
            }
          }
          if (originalCol.join(",") !== slid.join(",")) {
            moved = true;
          }
        }
      } else if (direction === "down") {
        for (let j = 0; j < SIZE; j++) {
          const column = newBoard
            .map((row) => row[j])
            .filter((val): val is number => val !== undefined)
            .reverse();
          const originalCol = [...column];
          const slid = slideRow(column);
          const result = slid.reverse();
          for (let i = 0; i < SIZE; i++) {
            const row = newBoard[i];
            const cell = result[i];
            if (row && cell !== undefined) {
              row[j] = cell;
            }
          }
          if (originalCol.join(",") !== result.join(",")) {
            moved = true;
          }
        }
      }

      // Calculate score
      newBoard.forEach((row) => {
        row.forEach((cell) => {
          if (cell > 2 && cell % 2 === 0) {
            score += cell;
          }
        });
      });

      return { board: newBoard, score, moved };
    },
    [gameState.board, cloneBoard, slideRow],
  );

  // Check game over
  const checkGameOver = useCallback((board: number[][]) => {
    // Check for empty cells
    for (let i = 0; i < SIZE; i++) {
      const row = board[i];
      if (!row) continue;
      for (let j = 0; j < SIZE; j++) {
        if (row[j] === 0) return false;
      }
    }

    // Check for possible merges
    for (let i = 0; i < SIZE; i++) {
      const row = board[i];
      if (!row) continue;
      for (let j = 0; j < SIZE; j++) {
        const current = row[j];
        const nextRow = board[i + 1];
        if ((nextRow && nextRow[j] === current) || row[j + 1] === current) {
          return false;
        }
      }
    }

    return true;
  }, []);

  // Check win
  const checkWin = useCallback((board: number[][]) => {
    return board.some((row) => row.some((cell) => cell === 2048));
  }, []);

  // Handle move
  const handleMove = useCallback(
    (direction: Direction) => {
      if (gameState.gameOver) return;

      const { board: newBoard, score, moved } = moveBoard(direction);

      if (!moved) return;

      addRandomTile(newBoard);

      const gameOver = checkGameOver(newBoard);
      const won = checkWin(newBoard);

      const newBestScore = Math.max(
        gameState.bestScore,
        gameState.score + score,
      );
      if (newBestScore > gameState.bestScore) {
        localStorage.setItem("2048-best-score", newBestScore.toString());
      }

      setGameState((prev) => ({
        ...prev,
        board: newBoard,
        score: prev.score + score,
        bestScore: newBestScore,
        gameOver,
        won: won || prev.won,
      }));
    },
    [gameState, moveBoard, addRandomTile, checkGameOver, checkWin],
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.gameOver) return;

      const keyMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      };

      const direction = keyMap[e.key];
      if (direction) {
        e.preventDefault();
        handleMove(direction);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.gameOver, handleMove]);

  // Touch controls
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
      };
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current || gameState.gameOver) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const touchEnd = {
        x: touch.clientX,
        y: touch.clientY,
      };

      const dx = touchEnd.x - touchStartRef.current.x;
      const dy = touchEnd.y - touchStartRef.current.y;

      const minSwipeDistance = 30;

      if (Math.abs(dx) > Math.abs(dy)) {
        if (Math.abs(dx) > minSwipeDistance) {
          handleMove(dx > 0 ? "right" : "left");
        }
      } else {
        if (Math.abs(dy) > minSwipeDistance) {
          handleMove(dy > 0 ? "down" : "up");
        }
      }

      touchStartRef.current = null;
    },
    [gameState.gameOver, handleMove],
  );

  // Auto-init on mount
  useEffect(() => {
    if (isNewGame) {
      initGame();
    }
  }, [isNewGame, initGame]);

  // Get tile color
  const getTileColor = useCallback((value: number) => {
    const colors: Record<number, { bg: string; color: string }> = {
      0: { bg: "#cdc1b4", color: "#776e65" },
      2: { bg: "#eee4da", color: "#776e65" },
      4: { bg: "#ede0c8", color: "#776e65" },
      8: { bg: "#f2b179", color: "#f9f6f2" },
      16: { bg: "#f59563", color: "#f9f6f2" },
      32: { bg: "#f67c5f", color: "#f9f6f2" },
      64: { bg: "#f65e3b", color: "#f9f6f2" },
      128: { bg: "#edcf72", color: "#f9f6f2" },
      256: { bg: "#edcc61", color: "#f9f6f2" },
      512: { bg: "#edc850", color: "#f9f6f2" },
      1024: { bg: "#edc53f", color: "#f9f6f2" },
      2048: { bg: "#edc22e", color: "#f9f6f2" },
    };

    return colors[value] || { bg: "#3c3a32", color: "#f9f6f2" };
  }, []);

  return (
    <PluginWindow
      title="2048 游戏"
      icon="🎮"
      onClose={onClose}
      onMinimize={onMinimize}
      onMaximize={onMaximize}
      className="minigames-standalone"
      pluginId="minigames"
      showStandaloneButton={false}
    >
      <div className={styles.miniGames}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h2>2048</h2>
            <p>合并相同的数字，达到2048！</p>
          </div>

          <div className={styles.scores}>
            <div className={styles.scoreBox}>
              <span className={styles.scoreLabel}>分数</span>
              <span className={styles.scoreValue}>{gameState.score}</span>
            </div>
            <div className={styles.scoreBox}>
              <span className={styles.scoreLabel}>最高分</span>
              <span className={styles.scoreValue}>{gameState.bestScore}</span>
            </div>
          </div>
        </div>

        {/* New Game Button */}
        <div className={styles.actions}>
          <button
            onClick={initGame}
            className={styles.newGameButton}
            aria-label="开始新游戏"
          >
            🔄 新游戏
          </button>
        </div>

        {/* Game Board */}
        <div
          ref={boardRef}
          className={styles.boardContainer}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className={styles.board}>
            {gameState.board.map((row, i) =>
              row.map((cell, j) => {
                const colors = getTileColor(cell);
                return (
                  <div
                    key={`${i}-${j}`}
                    className={`${styles.tile} ${cell > 0 ? styles.tilePop : ""}`}
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.color,
                    }}
                  >
                    {cell > 0 && (
                      <span className={styles.tileValue}>{cell}</span>
                    )}
                  </div>
                );
              }),
            )}
          </div>
        </div>

        {/* Game Over / Win Message */}
        {gameState.gameOver && (
          <div className={styles.overlay}>
            <div className={styles.message}>
              <h3>游戏结束!</h3>
              <p>最终分数: {gameState.score}</p>
              <button onClick={initGame} className={styles.retryButton}>
                🔄 再来一局
              </button>
            </div>
          </div>
        )}

        {gameState.won && !gameState.gameOver && (
          <div className={styles.overlay}>
            <div className={styles.message}>
              <h3>🎉 恭喜!</h3>
              <p>你达到了2048!</p>
              <div className={styles.messageActions}>
                <button
                  onClick={() =>
                    setGameState((prev) => ({ ...prev, won: false }))
                  }
                  className={styles.continueButton}
                >
                  继续游戏
                </button>
                <button onClick={initGame} className={styles.retryButton}>
                  新游戏
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className={styles.instructions}>
          <h4>如何玩</h4>
          <p>
            使用 <strong>方向键</strong> 或 <strong>WASD</strong> 移动方块
          </p>
          <p>
            移动端支持 <strong>滑动</strong> 操作
          </p>
          <p>
            当两个相同数字的方块碰撞时，它们会 <strong>合并</strong>
          </p>
        </div>
      </div>
    </PluginWindow>
  );
};

export default MiniGames;
