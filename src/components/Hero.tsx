import { useNavigate } from "react-router-dom";
import { DNABackground } from "./DNABackground";
import { useAuthStore } from "../stores/useAuthStore";

export function Hero() {
  const navigate = useNavigate();
  const userIsReal = useAuthStore((user) => user.currentUser)

  return (
    <section className="relative h-[620px] overflow-hidden bg-[#03110d]">
      <DNABackground />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(70,255,180,0.22),rgba(0,0,0,0)_46%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020d0a]/70 via-[#03110d]/35 to-[#03110d]/85" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
        <h1 className="mb-6 max-w-4xl text-5xl font-bold text-white drop-shadow-[0_0_18px_rgba(34,197,94,0.45)] md:text-6xl">
          Browser Gaming Platform
        </h1>

        <p className="mb-8 max-w-2xl text-emerald-200/90">
          Rediscover classic browser games brought back with a modern look and a touch of nostalgia.
        </p>

        {userIsReal ? (
          <button 
          onClick={() => navigate("/lobby")}
          className="cursor-pointer rounded-lg bg-emerald-400 px-6 py-3 font-semibold text-black shadow-[0_0_25px_rgba(52,211,153,0.55)] transition hover:bg-emerald-300">
            Go to Lobby
          </button>
        ) : (
          <button 
          onClick={() => navigate("/auth")}
          className="cursor-pointer rounded-lg bg-emerald-400 px-6 py-3 font-semibold text-black shadow-[0_0_25px_rgba(52,211,153,0.55)] transition hover:bg-emerald-300">
            Play Now
          </button>
        )}
      </div>
    </section>
  );
}
