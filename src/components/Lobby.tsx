import { useEffect, useState } from "react";
import { useAuthStore } from "../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

type SnakeHigh = { length: number; speed: number } | null;
type CardsHigh = { time: number; rightParts: number } | null;
type MazeHigh = { rightPartsMaze: number } | null;

export function Lobby() {
  const logout = useAuthStore((state) => state.logout);
  const currentUser = useAuthStore((state) => state.currentUser);
  const navigate = useNavigate();

  const [snakeHigh, setSnakeHigh] = useState<SnakeHigh>(null);
  const [cardsHigh, setCardsHigh] = useState<CardsHigh>(null);
  const [mazeHigh, setMazeHigh] = useState<MazeHigh>(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const loadScores = async () => {
      if (!currentUser?.id) {
        setSnakeHigh(null);
        setCardsHigh(null);
        setMazeHigh(null);
        return;
      }

      try {
        const [snakeRes, cardsRes, mazeRes] = await Promise.all([
          fetch(`http://localhost:3000/api/scores/snake/high?userId=${currentUser.id}`),
          fetch(`http://localhost:3000/api/scores/cards/high?userId=${currentUser.id}`),
          fetch(`http://localhost:3000/api/scores/maze/high?userId=${currentUser.id}`),
        ]);

        const snakeData = await snakeRes.json();
        const cardsData = await cardsRes.json();
        const mazeData = await mazeRes.json();

        setSnakeHigh(snakeData.highScore || null);
        setCardsHigh(cardsData.highScore || null);
        setMazeHigh(mazeData.highScore || null);
      } catch {
        setSnakeHigh(null);
        setCardsHigh(null);
        setMazeHigh(null);
      }
    };

    loadScores();
  }, [currentUser]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03110d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(74,222,128,0.16),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(45,212,191,0.16),transparent_36%)]" />

      <nav className="relative z-10 border-b border-emerald-300/15 bg-emerald-950/45 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-emerald-100 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]">
            Game Lobby
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
            >
              Main
            </button>
            <button
              onClick={handleLogout}
              className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
            >
              Log out
            </button>
          </div>
          
        </div>
      </nav>

      <main className="relative z-10 mx-auto max-w-7xl space-y-7 px-4 py-10 sm:px-6 lg:px-8">
        <section
        onClick={() => navigate("/profile")}
        className="cursor-pointer transition hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(132,204,22,0.22)] rounded-2xl border border-emerald-300/20 bg-emerald-950/55 p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-emerald-100">Profile</h2>
          <p className="mt-2 text-sm text-emerald-100/70">Your account overview and activity will appear here.</p>
        </section>

        <section className="rounded-2xl border border-teal-200/20 bg-emerald-950/45 p-5 text-center shadow-[0_0_26px_rgba(45,212,191,0.14)] backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-teal-100">Games</h2>
          <p className="mt-1 text-sm text-emerald-100/65">Pick a game and start playing in your browser.</p>
        </section>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article onClick={() => navigate("/snake")}
          className="cursor-pointer rounded-2xl border border-emerald-300/20 bg-emerald-950/55 p-6 text-center shadow-[0_0_24px_rgba(16,185,129,0.14)] transition hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(16,185,129,0.24)]">
            <img src="/snake.png" alt="Snake game" className="mx-auto mb-4 h-24 w-24 rounded-lg object-cover" />
            <p className="font-semibold text-emerald-100">Snake</p>
            <p className="mt-2 flex flex-col items-center gap-1 text-center text-xs font-semibold text-emerald-100/85">
              <span>High Score</span>
              <span>Length - {snakeHigh ? snakeHigh.length : "-"}</span>
              <span>Speed - {snakeHigh ? snakeHigh.speed : "-"}</span>
            </p>
          </article>

          <article onClick={() => navigate("/cards")}
          className="cursor-pointer rounded-2xl border border-emerald-300/20 bg-emerald-950/55 p-6 text-center shadow-[0_0_24px_rgba(16,185,129,0.14)] transition hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(16,185,129,0.24)]">
            <img src="/cards.png" alt="Cards game" className="mx-auto mb-4 h-24 w-24 rounded-lg object-cover" />
            <p className="font-semibold text-emerald-100">Cards</p>
            <p className="mt-2 flex flex-col items-center gap-1 text-center text-xs font-semibold text-emerald-100/85">
              <span>High Score</span>
              <span>Time - {cardsHigh ? cardsHigh.time : "-"}</span>
              <span>Solved successfully - {cardsHigh ? cardsHigh.rightParts : "-"}</span>
            </p>
          </article>

          <article onClick={() => navigate("/maze")}
          className="cursor-pointer rounded-2xl border border-emerald-300/20 bg-emerald-950/55 p-6 text-center shadow-[0_0_24px_rgba(16,185,129,0.14)] transition hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(16,185,129,0.24)]">
            <img src="/maze.png" alt="Maze game" className="mx-auto mb-4 h-24 w-24 rounded-lg object-cover" />
            <p className="font-semibold text-emerald-100">Maze</p>
            <p className="mt-2 flex flex-col items-center gap-1 text-center text-xs font-semibold text-emerald-100/85">
              <span>High Score</span>
              <span>Solved successfully - {mazeHigh ? mazeHigh.rightPartsMaze : "-"}</span>
            </p>
          </article>
        </section>
      </main>
    </div>
  );
}
