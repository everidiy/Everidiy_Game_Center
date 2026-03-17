import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

export function Header() {
  const userIsReal = useAuthStore((user) => user.currentUser)

  return (
    <header className="bg-[#03110d] border-b border-emerald-300/20 shadow-[0_1px_0_rgba(110,231,183,0.12)]">
      <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
        
        <h1 className="text-white font-semibold text-lg">
          Everidiy Game Center
        </h1>

        <nav className="flex gap-6 text-emerald-200 text-sm">
          {userIsReal ? (
            <Link 
              to="/lobby"
              className="hover:text-white transition cursor-pointer"
            >Lobby</Link>
          ) : (
            <div className="flex gap-6">
              <Link 
                to="/auth"
                className="hover:text-white transition cursor-pointer"
              >Sign up</Link>
              <Link 
                to="/auth"
                className="hover:text-white transition cursor-pointer"
              >Login</Link>
            </div>
          )}
        </nav>

      </div>
    </header>
  );
}
