import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function VerifyCodeForm({ email }: { email: string }) {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:3000/api/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.join("") }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Verification failed");
        return;
      }

      navigate("/lobby");
    } catch (err) {
      console.error(err);
      setError("Server error");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value.replace(/\D/, "");
    if (!val) return;

    const newCode = [...code];
    newCode[index] = val;
    setCode(newCode);

    if (index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      const newCode = [...code];

      if (newCode[index]) {
        newCode[index] = "";
        setCode(newCode);
      } else if (index > 0) {
        newCode[index - 1] = "";
        setCode(newCode);

        const prevInput = document.getElementById(`code-${index - 1}`) as HTMLInputElement;
        if (prevInput) prevInput.focus();
      }
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03110d] px-4 py-10 flex justify-center items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(45,212,191,0.18),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_85%,rgba(16,185,129,0.2),transparent_35%)]" />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 mx-auto w-full max-w-md rounded-3xl border border-emerald-300/20 bg-emerald-950/60 p-8 shadow-[0_0_45px_rgba(13,148,136,0.2)] backdrop-blur-md"
      >
        <h2 className="mb-2 text-center text-3xl font-semibold text-white drop-shadow-[0_0_14px_rgba(45,212,191,0.35)]">
          Enter Verification Code
        </h2>
        <p className="mb-6 text-center text-sm text-emerald-100/70">We sent a 6-digit code to {email}</p>

        <div className="flex justify-between gap-2">
          {code.map((c, i) => (
            <input
              key={i}
              id={`code-${i}`}
              type="text"
              maxLength={1}
              value={c}
              onChange={(e) => handleChange(e, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="h-14 w-12 rounded-xl border border-emerald-300/20 bg-emerald-950/80 text-center text-xl text-white outline-none transition placeholder:text-emerald-100/35 focus:border-teal-200/50 focus:shadow-[0_0_0_3px_rgba(94,234,212,0.2)]"
            />
          ))}
        </div>

        {error && <p className="mt-4 text-center text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          className="mt-6 w-full rounded-xl bg-teal-300 py-3 font-semibold text-black shadow-[0_0_24px_rgba(45,212,191,0.5)] transition hover:bg-teal-200"
        >
          Confirm Code
        </button>
      </form>
    </div>
  );
}
