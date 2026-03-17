import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

type Card = {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
};

const EMOJIS = [
  "🐶", "🐱", "🐭", "🐹", "🐰", "🦊",
  "🐻", "🐼", "🐨", "🐯", "🦁", "🐮",
];

export function MemoryGame() {
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.currentUser);

  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [rightParts, setRightParts] = useState(0);
  const [time, setTime] = useState(60);
  const [status, setStatus] = useState<"playing" | "win" | "lose">("playing");
  const [highScore, setHighScore] = useState<{ time: number; rightParts: number } | null>(null);

  function initializeGame() {
    const pairs = [...EMOJIS, ...EMOJIS];

    const newCards: Card[] = pairs.map((emoji, index) => ({
      id: index,
      emoji,
      flipped: false,
      matched: false,
    }));

    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
  }

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (status !== "playing") return;

    const timer = window.setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          window.clearInterval(timer);
          setStatus("lose");
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [status]);

  function handleCardClick(card: Card) {
    if (card.flipped || card.matched || flippedCards.length === 2) return;

    const updatedCards = cards.map((c) =>
      c.id === card.id ? { ...c, flipped: true } : c
    );

    setCards(updatedCards);
    setFlippedCards([...flippedCards, { ...card, flipped: true }]);
  }

  useEffect(() => {
    if (flippedCards.length !== 2) return;

    const [card1, card2] = flippedCards;

    if (card1.emoji === card2.emoji) {
      setCards((prev) =>
        prev.map((c) =>
          c.emoji === card1.emoji ? { ...c, matched: true } : c
        )
      );

      setMatchedPairs((p) => p + 1);
      setFlippedCards([]);
    } else {
      window.setTimeout(() => {
        setCards((prev) =>
          prev.map((c) =>
            c.id === card1.id || c.id === card2.id
              ? { ...c, flipped: false }
              : c
          )
        );

        setFlippedCards([]);
      }, 500);
    }
  }, [flippedCards]);

  useEffect(() => {
    if (matchedPairs === EMOJIS.length) {
      setStatus("win");
      setRightParts(rightParts + 1);
    }
  }, [matchedPairs]);

  function restartGame() {
    setMatchedPairs(0);
    setFlippedCards([]);
    setTime(60);
    setStatus("playing");
    initializeGame();
  }

  const saveDataGame = async () => {
    if (!currentUser?.id) return;
    try {
      await fetch("http://localhost:3000/api/scores/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          time,
          rightParts,
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
          `http://localhost:3000/api/scores/cards/high?userId=${currentUser.id}`
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

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12 text-center">
        <div className="w-full max-w-4xl space-y-6">
          <h1 className="text-2xl font-semibold text-emerald-100 drop-shadow-[0_0_14px_rgba(16,185,129,0.35)] sm:text-3xl">
            Memory Game
          </h1>

          <p className="text-sm text-emerald-100/70">
            {status === "win" && "You win!"}
            {status === "lose" && "You lose!"}
            {status === "playing" && "Find all matching pairs!"}
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-emerald-100/70">
            <span>Time: {time}s</span>
          </div>

          <div className="mx-auto grid max-w-[520px] grid-cols-6 gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-950/60 p-4 shadow-[0_0_40px_rgba(16,185,129,0.2)] backdrop-blur-sm sm:gap-4">
            {cards.map((card) => {
              const faceUp = card.flipped || card.matched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(card)}
                  aria-label="Memory card"
                  className="cursor-pointer relative h-14 w-14 rounded-xl border border-emerald-500/20 sm:h-16 sm:w-16"
                  style={{ perspective: "800px" }}
                >
                  <div
                    className={`relative h-full w-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d] ${
                      faceUp ? "[transform:rotateY(180deg)]" : ""
                    }`}
                  >
                    <div
                      className="absolute inset-0 grid place-items-center rounded-xl bg-[#020b08] text-2xl font-semibold text-emerald-100/80 shadow-[0_0_10px_rgba(16,185,129,0.18)]"
                      style={{ backfaceVisibility: "hidden" }}
                    >
                      ?
                    </div>
                    <div
                      className="absolute inset-0 grid place-items-center rounded-xl bg-emerald-500/90 text-2xl font-semibold text-[#03110d] shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      {card.emoji}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {(status === "win" || status === "lose") && (
            <button
              onClick={() => {
                saveDataGame();
                restartGame();
              }}
              className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-5 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
            >
              Restart Game
            </button>
          )}

          <div className="pt-4">
            <button
              onClick={() => navigate("/lobby")}
              className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-5 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
            >
              Back to Lobby
            </button>
          </div>

          <p className="mt-2 flex flex-col items-center gap-1 text-center text-xs font-semibold text-emerald-100/85">
              <span>High Score</span>
              <span>Time - {highScore ? highScore.time : "-"}</span>
              <span>Solved successfully - {highScore ? highScore.rightParts : "-"}</span>
          </p>

          <p className="mt-2 flex flex-col items-center gap-1 text-center text-xs font-semibold text-emerald-100/85">
              <span>New Score</span>
              <span>Time - {time}</span>
              <span>Solved successfully - {rightParts}</span>
          </p>
        </div>
      </main>
    </div>
  );
}
