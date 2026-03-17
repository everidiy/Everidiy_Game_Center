import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const GRID_SIZE = 20;
const BASE_SPEED = 500;
const SPEED_STEP = 5;
const MIN_SPEED = 50;
type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

type Point = {
    x: number;
    y: number;
};

const INITIAL_SNAKE: Point[] = [
    { x: 10, y: 10 },
    { x: 9, y: 10 },
];

function spawnFood(snake: Point[]): Point {
    let candidate: Point;
    do {
        candidate = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE),
        };
    } while (snake.some((s) => s.x === candidate.x && s.y === candidate.y));
    return candidate;
}

export function Snake() {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.currentUser);

    const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
    const [direction, setDirection] = useState<Direction>("RIGHT");
    const [food, setFood] = useState<Point>(() => spawnFood(INITIAL_SNAKE));
    const [gameOver, setGameOver] = useState(false);
    const [speed, setSpeed] = useState(BASE_SPEED);
    const [highScore, setHighScore] = useState<{ length: number; speed: number } | null>(null);

    const directionRef = useRef<Direction>(direction);
    const foodRef = useRef<Point>(food);

    useEffect(() => {
        directionRef.current = direction;
    }, [direction]);

    useEffect(() => {
        foodRef.current = food;
    }, [food]);

    const restartGame = useCallback(() => {
        setSnake(INITIAL_SNAKE);
        setDirection("RIGHT");
        setFood(spawnFood(INITIAL_SNAKE));
        setGameOver(false);
        setSpeed(BASE_SPEED);
    }, []);

    const saveDataGame = async () => {
        if (!currentUser?.id) return;
        try {
            await fetch("http://localhost:3000/api/scores/snake", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser.id,
                    length: snake.length,
                    speed,
                }),
            });
        } catch {
            // ignore score save failures
        }
    };

    const applyDirection = useCallback((nextDirection: Direction) => {
        const opposite: Record<Direction, Direction> = {
            UP: "DOWN",
            DOWN: "UP",
            LEFT: "RIGHT",
            RIGHT: "LEFT",
        };

        if (opposite[directionRef.current] !== nextDirection) {
            setDirection(nextDirection);
        }
    }, []);

    const moveSnake = useCallback(() => {
        setSnake((prev) => {
            const newSnake = [...prev];
            const head = { ...newSnake[0] };
            const currentDirection = directionRef.current;

            if (currentDirection === "UP") head.y -= 1;
            if (currentDirection === "DOWN") head.y += 1;
            if (currentDirection === "LEFT") head.x -= 1;
            if (currentDirection === "RIGHT") head.x += 1;

            if (head.x < 0) head.x = GRID_SIZE - 1;
            if (head.x >= GRID_SIZE) head.x = 0;
            if (head.y < 0) head.y = GRID_SIZE - 1;
            if (head.y >= GRID_SIZE) head.y = 0;

            if (newSnake.some((segment, index) => index > 0 && segment.x === head.x && segment.y === head.y)) {
                setGameOver(true);
                return prev;
            }

            newSnake.unshift(head);

            const currentFood = foodRef.current;
            if (head.x === currentFood.x && head.y === currentFood.y) {
                setFood(spawnFood(newSnake));
                setSpeed((prev) => Math.max(MIN_SPEED, prev - SPEED_STEP));
            } else {
                newSnake.pop();
            }

            return newSnake;
        });
    }, []);

    useEffect(() => {
        if (gameOver) return;

        const interval = window.setInterval(moveSnake, speed);

        return () => window.clearInterval(interval);
    }, [speed, gameOver, moveSnake]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (gameOver && (e.key === "Enter" || e.key === " ")) {
                saveDataGame();
                restartGame();
                return;
            }

            const nextDirection: Direction | null =
                e.key === "ArrowUp" ? "UP"
                : e.key === "ArrowDown" ? "DOWN"
                : e.key === "ArrowRight" ? "RIGHT"
                : e.key === "ArrowLeft" ? "LEFT"
                : null;

            if (!nextDirection) return;

            applyDirection(nextDirection);
        };

        window.addEventListener("keydown", handleKey);

        return () => window.removeEventListener("keydown", handleKey);
    }, [applyDirection, gameOver, restartGame]);

    useEffect(() => {
        const loadHighScore = async () => {
            if (!currentUser?.id) {
                setHighScore(null);
                return;
            }

            try {
                const res = await fetch(
                    `http://localhost:3000/api/scores/snake/high?userId=${currentUser.id}`
                );
                const data = await res.json();
                setHighScore(data.highScore || null);
            } catch {
                setHighScore(null);
            }
        };

        loadHighScore();
    }, [currentUser]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#03110d] text-white">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(74,222,128,0.16),transparent_45%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(45,212,191,0.18),transparent_40%)]" />

            <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
                <div className="w-full max-w-3xl space-y-6 text-center">
                    <h2 className="text-xl font-semibold text-emerald-100 drop-shadow-[0_0_14px_rgba(16,185,129,0.35)] sm:text-2xl">
                        Use the arrow keys to move!
                    </h2>

                    <div className="mx-auto flex w-full justify-center">
                        <div
                            className="grid rounded-2xl border border-emerald-300/25 bg-emerald-950/60 p-3 shadow-[0_0_40px_rgba(16,185,129,0.2)] backdrop-blur-sm [--cell-size:14px] sm:[--cell-size:20px]"
                            style={{
                                gridTemplateColumns: `repeat(${GRID_SIZE}, var(--cell-size))`,
                            }}
                        >
                            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
                                const x = i % GRID_SIZE;
                                const y = Math.floor(i / GRID_SIZE);

                                const isSnake = snake.some((s) => s.x === x && s.y === y);
                                const isFood = food.x === x && food.y === y;

                                const cellClass = isSnake
                                    ? "bg-emerald-500"
                                    : isFood
                                    ? "bg-rose-500"
                                    : "bg-[#020b08]";

                                return (
                                    <div
                                        key={i}
                                        className={`h-[var(--cell-size)] w-[var(--cell-size)] border border-emerald-500/10 ${cellClass}`}
                                    />
                                );
                            })}
                        </div>
                    </div>

                    {gameOver ? (
                        <div onClick={() => {
                            saveDataGame();
                            restartGame();
                        }}
                        className="cursor-pointer space-y-2 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-6 py-4 text-rose-100 shadow-[0_0_24px_rgba(244,63,94,0.25)]">
                            <p className="text-lg font-semibold">Game Over</p>
                            <p className="text-sm text-rose-100/80 sm:hidden">Tap to restart</p>
                            <p className="hidden text-sm text-rose-100/80 sm:block">
                                Press Enter to play again!
                            </p>
                        </div>
                    ) : (
                        <div className="text-sm text-emerald-100/70">
                            Length of the snake: {snake.length} • Speed: {speed} ms
                        </div>
                    )}

                    <div className="flex items-center justify-center sm:hidden">
                        <div className="grid grid-cols-3 gap-2">
                            <div />
                            <button
                                type="button"
                                onPointerDown={() => applyDirection("UP")}
                                className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
                                aria-label="Move up"
                            >
                                ↑
                            </button>
                            <div />
                            <button
                                type="button"
                                onPointerDown={() => applyDirection("LEFT")}
                                className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
                                aria-label="Move left"
                            >
                                ←
                            </button>
                            <button
                                type="button"
                                onPointerDown={() => applyDirection("DOWN")}
                                className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
                                aria-label="Move down"
                            >
                                ↓
                            </button>
                            <button
                                type="button"
                                onPointerDown={() => applyDirection("RIGHT")}
                                className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
                                aria-label="Move right"
                            >
                                →
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-center gap-4">
                        <button
                            onClick={() => navigate("/lobby")}
                            className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-5 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
                        >
                            Back to Lobby
                        </button>
                    </div>

                    <p className="mt-2 flex flex-col items-center gap-1 text-center text-xs font-semibold text-emerald-100/85">
                        <span>High Score</span>
                        <span>Length - {highScore ? highScore.length : "-"}</span>
                        <span>Speed - {highScore ? highScore.speed : "-"}</span>
                    </p>

                    <p className="mt-2 flex flex-col items-center gap-1 text-center text-xs font-semibold text-emerald-100/85">
                        <span>New Score</span>
                        <span>Length - {snake.length}</span>
                        <span>Speed - {speed}</span>
                    </p>
                </div>
            </main>
        </div>
    );
}
