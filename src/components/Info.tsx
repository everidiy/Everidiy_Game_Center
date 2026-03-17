export function Info() {
  return (
    <section className="relative overflow-hidden bg-[#03110d] px-6 py-24">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(74,222,128,0.16),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_75%,rgba(16,185,129,0.2),transparent_35%)]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-semibold text-white drop-shadow-[0_0_16px_rgba(34,197,94,0.35)] md:text-4xl">
            Why you should try this
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-emerald-200/80">
            This project reimagines the spirit of classic games in a modern way.  
            It combines nostalgia, simplicity, and thoughtful design to create an experience that feels both familiar and fresh.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">

          <div className="rounded-2xl border border-emerald-300/20 bg-emerald-950/50 p-7 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(16,185,129,0.28)]">
            <span className="mb-4 inline-block rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-emerald-200">
              sentimental
            </span>

            <h3 className="mb-3 text-xl font-semibold text-white">
              Nostalgia
            </h3>

            <p className="text-sm text-emerald-100/80">
              Rediscover the feeling of classic games that shaped our childhood — now presented in a modern style.
            </p>
          </div>


          <div className="rounded-2xl border border-lime-300/20 bg-emerald-950/55 p-7 shadow-[0_0_30px_rgba(132,204,22,0.12)] backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(132,204,22,0.26)]">
            <span className="mb-4 inline-block rounded-full border border-lime-300/30 bg-lime-300/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-lime-200">
              clarity
            </span>

            <h3 className="mb-3 text-xl font-semibold text-white">
              Simplicity
            </h3>

            <p className="text-sm text-emerald-100/80">
              A clean interface and minimalistic design help you focus on the experience without distractions.
            </p>
          </div>


          <div className="rounded-2xl border border-teal-200/20 bg-emerald-950/60 p-7 shadow-[0_0_30px_rgba(45,212,191,0.12)] backdrop-blur-sm transition hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(45,212,191,0.24)]">
            <span className="mb-4 inline-block rounded-full border border-teal-200/30 bg-teal-300/15 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-teal-100">
              passion
            </span>

            <h3 className="mb-3 text-xl font-semibold text-white">
              Crafted with care
            </h3>

            <p className="text-sm text-emerald-100/80">
              Built with passion for curious users who enjoy exploring simple but meaningful experiences.
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}
