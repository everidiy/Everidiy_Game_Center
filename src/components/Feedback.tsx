import { useState } from "react";

export function Feedback() {
  const [type, setType] = useState<"idea" | "bug">("idea");

  return (
    <section className="relative overflow-hidden bg-[#03110d] px-6 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(52,211,153,0.18),transparent_38%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_80%,rgba(16,185,129,0.2),transparent_35%)]" />

      <div className="relative mx-auto max-w-xl rounded-3xl border border-emerald-300/20 bg-emerald-950/55 p-8 shadow-[0_0_45px_rgba(16,185,129,0.18)] backdrop-blur-sm md:p-10">
        <h2 className="mb-3 text-center text-3xl font-semibold text-white drop-shadow-[0_0_16px_rgba(16,185,129,0.35)]">
          Send Your Voice
        </h2>
        <p className="mb-6 text-center text-emerald-100/70">
          We’d love to hear from you! Send us your ideas or report any bugs so we can make things better.
        </p>

        <div className="mb-6 flex rounded-xl border border-emerald-300/20 bg-emerald-900/45 p-1.5">
          <button
            onClick={() => setType("idea")}
            className={`flex-1 rounded-lg py-2 text-[13px] font-medium transition sm:py-2.5 sm:text-sm ${
              type === "idea"
                ? "bg-emerald-300 text-black shadow-[0_0_18px_rgba(110,231,183,0.45)]"
                : "text-emerald-200/85 hover:bg-emerald-900/55"
            }`}
          >
            Got an idea? Let us know!
          </button>

          <button
            onClick={() => setType("bug")}
            className={`flex-1 rounded-lg py-2 text-[13px] font-medium transition sm:py-2.5 sm:text-sm ${
              type === "bug"
                ? "bg-emerald-300 text-black shadow-[0_0_18px_rgba(110,231,183,0.45)]"
                : "text-emerald-200/85 hover:bg-emerald-900/55"
            }`}
          >
            Found a bug? Tell us about it!
          </button>
        </div>

        <form className="flex flex-col gap-4">
          <input
            type="text"
            placeholder={type === "idea" ? "Your idea..." : "Bug title..."}
            className="rounded-xl border border-emerald-300/20 bg-emerald-950/80 p-3 text-white outline-none transition placeholder:text-emerald-100/35 focus:border-emerald-300/50 focus:shadow-[0_0_0_3px_rgba(110,231,183,0.2)]"
          />

          <textarea
            placeholder="Describe it..."
            className="h-32 rounded-xl border border-emerald-300/20 bg-emerald-950/80 p-3 text-white outline-none transition placeholder:text-emerald-100/35 focus:border-emerald-300/50 focus:shadow-[0_0_0_3px_rgba(110,231,183,0.2)]"
          />

          <button className="rounded-xl bg-emerald-300 py-3 font-semibold text-black shadow-[0_0_24px_rgba(52,211,153,0.45)] transition hover:bg-emerald-200">
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
