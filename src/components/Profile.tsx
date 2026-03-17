import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

function getInitials(email: string) {
  const localPart = email.split("@")[0] || "";
  const parts = localPart.split(/[._-]+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return localPart.slice(0, 2).toUpperCase() || "U";
}

export function Profile() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [copiedField, setCopiedField] = useState<"email" | "id" | null>(null);

  const initials = useMemo(
    () => (currentUser ? getInitials(currentUser.email) : "U"),
    [currentUser]
  );

  const copyValue = async (value: string, field: "email" | "id") => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 1400);
    } catch {
      setCopiedField(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#03110d] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(74,222,128,0.16),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_80%,rgba(45,212,191,0.16),transparent_36%)]" />

      <nav className="relative z-10 border-b border-emerald-300/15 bg-emerald-950/45 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-semibold text-emerald-100 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]">
            My Profile
          </h1>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/lobby")}
              className="rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
            >
              Lobby
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
        {!currentUser ? (
          <section className="rounded-2xl border border-emerald-300/20 bg-emerald-950/55 p-6 text-center shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-emerald-100">Profile</h2>
            <p className="mt-2 text-sm text-emerald-100/70">
              You are not logged in. Sign in to see your profile details.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-4 rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
            >
              Go to login
            </button>
          </section>
        ) : (
          <>
            <section className="rounded-2xl border border-emerald-300/20 bg-emerald-950/55 p-6 shadow-[0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-2xl border border-emerald-300/20 bg-emerald-950/55 text-xl font-bold text-emerald-100 shadow-[0_0_24px_rgba(16,185,129,0.14)]">
                  {initials}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-emerald-100">Account overview</h2>
                  <p className="mt-1 text-sm text-emerald-100/70">
                    Your account overview and activity details.
                  </p>
                </div>
              </div>
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <article className="rounded-2xl border border-emerald-300/20 bg-emerald-950/55 p-6 shadow-[0_0_24px_rgba(16,185,129,0.14)] transition hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(16,185,129,0.24)]">
                <p className="text-xs uppercase tracking-wide text-emerald-100/70">Email</p>
                <p className="mt-3 break-all font-semibold text-emerald-100">{currentUser.email}</p>
                <button
                  onClick={() => copyValue(currentUser.email, "email")}
                  className="mt-4 rounded-lg border border-emerald-200/30 bg-emerald-300/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/20"
                >
                  {copiedField === "email" ? "Copied" : "Copy email"}
                </button>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
