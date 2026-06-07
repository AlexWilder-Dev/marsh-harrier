"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const GRID = 20;
const CELL = 20;
const TICK_MS = 110;

type Point = { x: number; y: number };
type Dir = { x: number; y: number };

const START_SNAKE: Point[] = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
];

function randomFood(snake: Point[]): Point {
  while (true) {
    const f = {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID),
    };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
  }
}

export default function SnakePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const snakeRef = useRef<Point[]>([...START_SNAKE]);
  const dirRef = useRef<Dir>({ x: 1, y: 0 });
  const nextDirRef = useRef<Dir>({ x: 1, y: 0 });
  const foodRef = useRef<Point>(randomFood(START_SNAKE));
  const runningRef = useRef(true);

  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [paused, setPaused] = useState(false);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, GRID * CELL, GRID * CELL);

    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    for (let i = 1; i < GRID; i++) {
      ctx.beginPath();
      ctx.moveTo(i * CELL, 0);
      ctx.lineTo(i * CELL, GRID * CELL);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i * CELL);
      ctx.lineTo(GRID * CELL, i * CELL);
      ctx.stroke();
    }

    const f = foodRef.current;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(f.x * CELL + CELL / 2, f.y * CELL + CELL / 2, CELL / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    const snake = snakeRef.current;
    snake.forEach((seg, i) => {
      ctx.fillStyle = i === 0 ? "#22c55e" : "#16a34a";
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2);
    });
  }, []);

  const reset = useCallback(() => {
    snakeRef.current = [...START_SNAKE];
    dirRef.current = { x: 1, y: 0 };
    nextDirRef.current = { x: 1, y: 0 };
    foodRef.current = randomFood(snakeRef.current);
    setScore(0);
    setGameOver(false);
    setPaused(false);
    runningRef.current = true;
    draw();
  }, [draw]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("snake-best") : null;
    if (stored) setBest(parseInt(stored, 10) || 0);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const k = e.key;
      if (k === " ") {
        e.preventDefault();
        if (gameOver) {
          reset();
        } else {
          setPaused((p) => !p);
        }
        return;
      }
      const d = dirRef.current;
      let nd: Dir | null = null;
      if (k === "ArrowUp" || k === "w" || k === "W") nd = { x: 0, y: -1 };
      else if (k === "ArrowDown" || k === "s" || k === "S") nd = { x: 0, y: 1 };
      else if (k === "ArrowLeft" || k === "a" || k === "A") nd = { x: -1, y: 0 };
      else if (k === "ArrowRight" || k === "d" || k === "D") nd = { x: 1, y: 0 };
      if (nd) {
        e.preventDefault();
        if (nd.x === -d.x && nd.y === -d.y) return;
        nextDirRef.current = nd;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [gameOver, reset]);

  useEffect(() => {
    draw();
    const interval = setInterval(() => {
      if (!runningRef.current || paused) return;

      dirRef.current = nextDirRef.current;
      const head = snakeRef.current[0];
      const newHead = {
        x: head.x + dirRef.current.x,
        y: head.y + dirRef.current.y,
      };

      if (
        newHead.x < 0 ||
        newHead.x >= GRID ||
        newHead.y < 0 ||
        newHead.y >= GRID ||
        snakeRef.current.some((s) => s.x === newHead.x && s.y === newHead.y)
      ) {
        runningRef.current = false;
        setGameOver(true);
        setBest((b) => {
          const nb = Math.max(b, score);
          if (typeof window !== "undefined") localStorage.setItem("snake-best", String(nb));
          return nb;
        });
        return;
      }

      const ate = newHead.x === foodRef.current.x && newHead.y === foodRef.current.y;
      const newSnake = [newHead, ...snakeRef.current];
      if (!ate) newSnake.pop();
      else {
        setScore((s) => s + 1);
        foodRef.current = randomFood(newSnake);
      }
      snakeRef.current = newSnake;
      draw();
    }, TICK_MS);
    return () => clearInterval(interval);
  }, [draw, paused, score]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: "#020617",
        color: "#e2e8f0",
        fontFamily: "system-ui, sans-serif",
        padding: 24,
      }}
    >
      <h1 style={{ fontSize: 32, margin: 0 }}>Snake</h1>
      <div style={{ display: "flex", gap: 24, fontSize: 18 }}>
        <span>Score: {score}</span>
        <span>Best: {best}</span>
      </div>
      <div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={GRID * CELL}
          height={GRID * CELL}
          style={{ border: "2px solid #334155", borderRadius: 8, display: "block" }}
        />
        {(gameOver || paused) && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(2,6,23,0.75)",
              borderRadius: 8,
              gap: 12,
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 700 }}>
              {gameOver ? "Game Over" : "Paused"}
            </div>
            <button
              onClick={gameOver ? reset : () => setPaused(false)}
              style={{
                padding: "8px 16px",
                background: "#22c55e",
                color: "#052e16",
                border: "none",
                borderRadius: 6,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {gameOver ? "Play again" : "Resume"}
            </button>
          </div>
        )}
      </div>
      <p style={{ fontSize: 14, color: "#94a3b8", margin: 0, textAlign: "center" }}>
        Arrow keys or WASD to move · Space to pause / restart
      </p>
    </main>
  );
}
