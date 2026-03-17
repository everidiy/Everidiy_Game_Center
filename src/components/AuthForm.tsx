import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthSchema, type AuthFormData } from "../schemas/authSchema";
import { useAuthStore } from "../stores/useAuthStore";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function AuthForm() {
  const loginStore = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AuthFormData>({
    resolver: zodResolver(AuthSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    try {
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        alert(result.error || "Registration failed");
        return;
      }

      loginStore(result.user);
      reset();
      navigate("/code", { state: { email: result.user.email } });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03110d] px-4 py-10 flex justify-center items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(74,222,128,0.2),transparent_42%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgba(16,185,129,0.18),transparent_38%)]" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative z-10 mx-auto w-full max-w-md rounded-3xl border border-emerald-300/20 bg-emerald-950/55 p-8 shadow-[0_0_45px_rgba(16,185,129,0.18)] backdrop-blur-md"
      >
        <h2 className="mb-2 text-center text-3xl font-semibold text-white drop-shadow-[0_0_14px_rgba(34,197,94,0.35)]">
          Create Account
        </h2>

        <div className="space-y-2">
          <label className="block text-sm text-emerald-200">Email</label>
          <input
            type="text"
            placeholder="example@mail.com"
            {...register("email")}
            className="w-full rounded-xl border border-emerald-300/20 bg-emerald-950/80 px-4 py-3 text-white outline-none transition placeholder:text-emerald-100/35 focus:border-emerald-300/50 focus:shadow-[0_0_0_3px_rgba(110,231,183,0.2)]"
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
              className="w-full rounded-xl border border-emerald-300/20 bg-emerald-950/80 px-4 py-3 pr-11 text-white outline-none transition placeholder:text-emerald-100/35 focus:border-emerald-300/50 focus:shadow-[0_0_0_3px_rgba(110,231,183,0.2)]"
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

        <div className="mt-5 space-y-2">
          <label className="block text-sm text-emerald-200">Confirm password</label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="******"
              {...register("confirmPassword")}
              className="w-full rounded-xl border border-emerald-300/20 bg-emerald-950/80 px-4 py-3 pr-11 text-white outline-none transition placeholder:text-emerald-100/35 focus:border-emerald-300/50 focus:shadow-[0_0_0_3px_rgba(110,231,183,0.2)]"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 opacity-70 transition hover:opacity-100"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
            >
              <img src={showConfirmPassword ? "/eye.png" : "/closed-eye.png"} alt="toggle confirm password" className="h-5 w-5" />
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-rose-400">{errors.confirmPassword.message}</p>}
        </div>

        <div className="mt-5 flex items-start gap-3">
          <input type="checkbox" {...register("agreement")} className="mt-1 h-4 w-4 cursor-pointer accent-emerald-300" />
          <label className="text-sm text-emerald-100/75">
            I agree with the <span className="font-semibold text-emerald-200">user agreement</span>.
          </label>
        </div>
        {errors.agreement && <p className="mt-1 text-sm text-rose-400">{errors.agreement.message}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-emerald-300 py-3 font-semibold text-black shadow-[0_0_24px_rgba(52,211,153,0.5)] transition hover:bg-emerald-200 disabled:opacity-60"
        >
          Sign Up
        </button>

        <p className="mt-5 text-center text-sm text-emerald-100/60">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-emerald-200 underline-offset-4 transition hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
