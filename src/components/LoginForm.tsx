import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogSchema, type LogFormData } from "../schemas/logSchema";
import { useAuthStore } from "../stores/useAuthStore";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function LoginForm() {
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LogFormData>({
    resolver: zodResolver(LogSchema),
  });

  const onSubmit = async (data: LogFormData) => {
    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok) {
        alert(result.error || "Login failed");
        return;
      }

      loginStore(result.user);
      reset();
      navigate("/lobby");
    } catch (err) {
      console.error(err);
      alert("Server error");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03110d] px-4 py-10 flex justify-center items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(45,212,191,0.18),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_85%,rgba(16,185,129,0.2),transparent_35%)]" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 mx-auto w-full max-w-md rounded-3xl border border-emerald-300/20 bg-emerald-950/60 p-8 shadow-[0_0_45px_rgba(13,148,136,0.2)] backdrop-blur-md"
      >
        <h2 className="mb-2 text-center text-3xl font-semibold text-white drop-shadow-[0_0_14px_rgba(45,212,191,0.35)]">
          Welcome Back
        </h2>

        <div className="space-y-2">
          <label className="block text-sm text-emerald-200">Email</label>
          <input
            type="email"
            placeholder="example@mail.com"
            {...register("email")}
            className="w-full rounded-xl border border-emerald-300/20 bg-emerald-950/80 px-4 py-3 text-white outline-none transition placeholder:text-emerald-100/35 focus:border-teal-200/50 focus:shadow-[0_0_0_3px_rgba(94,234,212,0.2)]"
          />
          {errors.email && <p className="text-sm text-rose-400">{errors.email.message}</p>}
        </div>

        <div className="mt-5 space-y-2">
          <label className="block text-sm text-emerald-200">Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="******"
              {...register("password")}
              className="w-full rounded-xl border border-emerald-300/20 bg-emerald-950/80 px-4 py-3 pr-11 text-white outline-none transition placeholder:text-emerald-100/35 focus:border-teal-200/50 focus:shadow-[0_0_0_3px_rgba(94,234,212,0.2)]"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 transition hover:opacity-100"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              <img src={showPassword ? "/eye.png" : "/closed-eye.png"} alt="toggle password" className="h-5 w-5" />
            </button>
          </div>
          {errors.password && <p className="text-sm text-rose-400">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-teal-300 py-3 font-semibold text-black shadow-[0_0_24px_rgba(45,212,191,0.5)] transition hover:bg-teal-200 disabled:opacity-60"
        >
          Log In
        </button>

        <p className="mt-5 text-center text-sm text-emerald-100/60">
          New here?{" "}
          <Link to="/auth" className="font-semibold text-teal-200 underline-offset-4 transition hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </div>
  );
}
