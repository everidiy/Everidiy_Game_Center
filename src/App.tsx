import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthForm } from "./components/AuthForm";
import { LoginForm } from "./components/LoginForm";
import { Lobby } from "./components/Lobby";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { VerifyCodeForm } from "./components/VerifyCodeForm";
import { Home } from "./components/Home";
import { Profile } from "./components/Profile";
import { Snake } from "./games/Snake";
import { MemoryGame } from "./games/Cards";
import { RandomMaze } from "./games/Maze";

type LOcationState = {
    email?: string;
  }

function CodePage() {
  const location = useLocation();
  const email = (location.state as LOcationState)?.email;

  return email
    ? <VerifyCodeForm email={email} />
    : <Navigate to="/auth" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={<LoginForm />} />
        <Route path="/auth" element={<AuthForm />} />

        <Route path="/code" element={<CodePage />} />

        <Route path="/lobby" element={
          <ProtectedRoute>
            <Lobby />
          </ProtectedRoute>
        }
        />

        <Route path="/snake" element={
          <ProtectedRoute>
            <Snake />
          </ProtectedRoute>
        }
        />

        <Route path="/cards" element={
          <ProtectedRoute>
            <MemoryGame />
          </ProtectedRoute>
        }
        />

        <Route path="/maze" element={
          <ProtectedRoute>
            <RandomMaze />
          </ProtectedRoute>
        }
        />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
        />

        <Route path="*" element={<Navigate to="/" replace />}/>
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
