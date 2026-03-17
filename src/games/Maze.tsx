import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

const GRID_SIZE = 25;

type Direction = "UP" | "DOWN" | "LEFT" | "RIGHT";

type Point = {
    x: number,
    y: number
}

type GameState = {
    person: Point,
    escape: Point,
    walls: number[][],
    stepLimit: number
}

function getRandomPosition(): Point {
    return {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
    }
}

function isInside(x: number, y: number) {
    return x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE;
}

function spawnMaze(): number[][] {
    // Perfect maze generator: 1-cell wide corridors and 1-cell thick walls.
    const maze = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => 1));

    const isOddCell = (x: number, y: number) =>
        x % 2 === 1 && y % 2 === 1 && x > 0 && y > 0 && x < GRID_SIZE - 1 && y < GRID_SIZE - 1;

    const stack: Point[] = [{ x: 1, y: 1 }];
    maze[1][1] = 0;

    const directions = [
        { dx: 0, dy: -2 },
        { dx: 0, dy: 2 },
        { dx: -2, dy: 0 },
        { dx: 2, dy: 0 },
    ];

    while (stack.length) {
        const current = stack[stack.length - 1];
        const neighbors = directions
            .map((d) => ({ x: current.x + d.dx, y: current.y + d.dy, dx: d.dx, dy: d.dy }))
            .filter((n) => isInside(n.x, n.y) && isOddCell(n.x, n.y) && maze[n.y][n.x] === 1);

        if (neighbors.length === 0) {
            stack.pop();
            continue;
        }

        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        // Carve the wall between current and next.
        maze[current.y + next.dy / 2][current.x + next.dx / 2] = 0;
        maze[next.y][next.x] = 0;
        stack.push({ x: next.x, y: next.y });
    }

    // Add "holes" in walls to create extra passages (higher = easier).
    const holeChance = 0.35;
    const allowWideChance = 0.15;
    const createsWideArea = (x: number, y: number) => {
        // Prevent 2x2 open blocks so corridors stay 1 cell wide.
        const blocks = [
            [{ x: x - 1, y: y - 1 }, { x, y: y - 1 }, { x: x - 1, y }, { x, y }],
            [{ x, y: y - 1 }, { x: x + 1, y: y - 1 }, { x, y }, { x: x + 1, y }],
            [{ x: x - 1, y }, { x, y }, { x: x - 1, y: y + 1 }, { x, y: y + 1 }],
            [{ x, y }, { x: x + 1, y }, { x, y: y + 1 }, { x: x + 1, y: y + 1 }],
        ];

        for (const block of blocks) {
            let open = 0;
            for (const c of block) {
                if (!isInside(c.x, c.y)) continue;
                if (maze[c.y][c.x] === 0 || (c.x === x && c.y === y)) open += 1;
            }
            if (open >= 3) return true;
        }

        return false;
    };
    for (let y = 1; y < GRID_SIZE - 1; y++) {
        for (let x = 1; x < GRID_SIZE - 1; x++) {
            if (maze[y][x] !== 1) continue;
            const openNeighbors =
                (maze[y][x - 1] === 0 ? 1 : 0) +
                (maze[y][x + 1] === 0 ? 1 : 0) +
                (maze[y - 1][x] === 0 ? 1 : 0) +
                (maze[y + 1][x] === 0 ? 1 : 0);
            if (openNeighbors >= 1 && Math.random() < holeChance) {
                const wouldWiden = createsWideArea(x, y);
                if (!wouldWiden || Math.random() < allowWideChance) {
                    maze[y][x] = 0;
                }
            }
        }
    }

    return maze;
}

function getRandomOpenCell(maze: number[][]): Point {
    // Keep sampling until we land on a walkable cell.
    let p: Point;
    do {
        p = getRandomPosition();
    } while (maze[p.y][p.x] !== 0);
    return p;
}

function shortestPathLength(maze: number[][], start: Point, goal: Point): number {
    // BFS on grid to compute optimal (shortest) path length.
    const visited = Array.from({ length: GRID_SIZE }, () => Array.from({ length: GRID_SIZE }, () => false));
    const queue: Array<{ x: number; y: number; d: number }> = [{ x: start.x, y: start.y, d: 0 }];
    visited[start.y][start.x] = true;

    const steps = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 },
    ];

    while (queue.length) {
        const { x, y, d } = queue.shift()!;
        if (x === goal.x && y === goal.y) return d;

        for (const s of steps) {
            const nx = x + s.dx;
            const ny = y + s.dy;
            if (!isInside(nx, ny)) continue;
            if (visited[ny][nx]) continue;
            if (maze[ny][nx] === 1) continue;
            visited[ny][nx] = true;
            queue.push({ x: nx, y: ny, d: d + 1 });
        }
    }

    return Number.POSITIVE_INFINITY;
}

function initializeGame(): GameState {
    // Generate until we have a reachable exit (perfect maze should always be reachable).
    let walls = spawnMaze();
    let person = getRandomOpenCell(walls);
    let escape = getRandomOpenCell(walls);
    while (escape.x === person.x && escape.y === person.y) {
        escape = getRandomOpenCell(walls);
    }

    let stepLimit = shortestPathLength(walls, person, escape);
    while (!Number.isFinite(stepLimit)) {
        walls = spawnMaze();
        person = getRandomOpenCell(walls);
        escape = getRandomOpenCell(walls);
        while (escape.x === person.x && escape.y === person.y) {
            escape = getRandomOpenCell(walls);
        }
        stepLimit = shortestPathLength(walls, person, escape);
    }

    return { walls, person, escape, stepLimit };
}

export function RandomMaze() {
    const navigate = useNavigate();
    const currentUser = useAuthStore((state) => state.currentUser);

    const [rightPartsMaze, setRightPartsMaze] = useState(0);
    const [steps, setSteps] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [gameWin, setGameWin] = useState(false);
    const [status, setStatus] = useState<"playing" | "win" | "lose">("playing");
    const [{ person, escape, walls, stepLimit }, setGame] = useState<GameState>(() => initializeGame());
    const [highScore, setHighScore] = useState<{ rightPartsMaze: number } | null>(null);

    const personRef = useRef<Point>(person);
    const escapeRef = useRef<Point>(escape);

    const restartGame = useCallback(() => {
        setGame(initializeGame());
        setStatus(status);
        setGameOver(false);
        setGameWin(false);
        setSteps(0);
    }, []);

    const movePerson = useCallback((dir: Direction) => {
        setGame((state) => {
            const { person, escape, walls, stepLimit } = state;

            let { x, y } = person;

            if (dir === "UP") y -= 1;
            if (dir === "DOWN") y += 1;
            if (dir === "LEFT") x -= 1;
            if (dir === "RIGHT") x += 1;

            if (!isInside(x, y)) return state;

            if (walls[y][x] === 1) return state;

            // Count steps and lose if we exceed the optimal path length.
            setSteps((s) => {
                const next = s + 1;
                if (next > stepLimit) {
                    setStatus("lose");
                    setGameOver(true);
                }
                return next;
            });

            if (x === escape.x && y === escape.y) {
                setStatus("win");
                setRightPartsMaze(rightPartsMaze + 1);
                setGameWin(true);
            }

            return {
                ...state,
                person: { x, y }
            };
        })
        
    }, []);

    useEffect(() => {
        personRef.current = person;
        escapeRef.current = escape;
    }, [person, escape]);

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (gameOver || gameWin && (e.key === "Enter" || e.key === " ")) {
                restartGame();
                return;
            }

            const nextDirection: Direction | null =
                e.key === "ArrowUp" ? "UP"
                : e.key === "ArrowDown" ? "DOWN"
                : e.key === "ArrowLeft" ? "LEFT"
                : e.key === "ArrowRight" ? "RIGHT"
                : null;
            
            if (!nextDirection) return;

            movePerson(nextDirection);
        }

        window.addEventListener("keydown", handleKey);

        return () => window.removeEventListener("keydown", handleKey);
    }, [gameOver, restartGame]);

    const saveDataGame = async () => {
        if (!currentUser?.id) return;
        try {
            await fetch("http://localhost:3000/api/scores/maze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: currentUser.id,
                    rightPartsMaze,
                }),
            });
        } catch {
            // ignore score save failures
        }
    };

    useEffect(() => {
        const loadHighScore = async () => {
            if (!currentUser?.id) {
                setHighScore(null);
                return;
            }

            try {
                const res = await fetch(
                    `http://localhost:3000/api/scores/maze/high?userId=${currentUser.id}`
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

                                const isPerson = person.x === x && person.y === y;
                                const isEscape = escape.x === x && escape.y === y;
                                const isWall = walls[y][x] === 1;

                                const cellClass = isPerson
                                    ? "bg-emerald-500"
                                    : isEscape
                                    ? "bg-rose-500"
                                    : isWall
                                    ? "bg-emerald-500/10"
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
                            saveDataGame()
                            restartGame()
                        }}
                        className="cursor-pointer space-y-2 rounded-2xl border border-rose-400/40 bg-rose-500/10 px-6 py-4 text-rose-100 shadow-[0_0_24px_rgba(244,63,94,0.25)]">
                            <p className="text-lg font-semibold">Game Over</p>
                            <p className="text-sm text-rose-100/80 sm:hidden">Tap to restart</p>
                            <p className="hidden text-sm text-rose-100/80 sm:block">
                                Press Enter to play again!
                            </p>
                        </div>
                    ) : gameWin ? (
                        <div onClick={() => {
                            saveDataGame()
                            restartGame()
                        }}
                        className="cursor-pointer space-y-2 rounded-2xl border border-emerald-400/40 bg-emerald-500/10 px-6 py-4 text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                            <p className="text-lg font-semibold">You Win!</p>
                            <p className="text-sm text-emerald-100/80 sm:hidden">Tap to restart</p>
                            <p className="hidden text-sm text-emerald-100/80 sm:block">
                                Press Enter to play again!
                            </p>
                        </div>
                    ) : (
                        <div className="text-sm text-emerald-100/70">
                            Steps left: {Math.max(0, stepLimit - steps)}
                        </div>
                    )}

                    <div className="flex items-center justify-center sm:hidden">
                        <div className="grid grid-cols-3 gap-2">
                            <div />
                            <button
                                type="button"
                                onPointerDown={() => movePerson("UP")}
                                className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
                                aria-label="Move up"
                            >
                                ↑
                            </button>
                            <div />
                            <button
                                type="button"
                                onPointerDown={() => movePerson("LEFT")}
                                className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
                                aria-label="Move left"
                            >
                                ←
                            </button>
                            <button
                                type="button"
                                onPointerDown={() => movePerson("DOWN")}
                                className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
                                aria-label="Move down"
                            >
                                ↓
                            </button>
                            <button
                                type="button"
                                onPointerDown={() => movePerson("RIGHT")}
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
                        <button
                            onClick={() => restartGame()}
                            className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-5 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
                        >
                            Rebuild
                        </button>
                    </div>

                    <p className="mt-2 flex flex-col items-center gap-1 text-center text-xs font-semibold text-emerald-100/85">
                        <span>High Score</span>
                        <span>Solved successfully - {highScore ? highScore.rightPartsMaze : "-"}</span>
                    </p>

                    <p className="mt-2 flex flex-col items-center gap-1 text-center text-xs font-semibold text-emerald-100/85">
                        <span>New Score</span>
                        <span>Solved successfully - {rightPartsMaze}</span>
                    </p>
                </div>
            </main>
        </div>
    )
}
