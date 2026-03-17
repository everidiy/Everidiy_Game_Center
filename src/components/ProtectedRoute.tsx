import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/useAuthStore";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
    const user = useAuthStore((state) => state.currentUser);

    if (!user) {
        return <Navigate to="/auth" replace />
    }

    return <>{children}</>
}