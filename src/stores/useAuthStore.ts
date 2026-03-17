import { create } from "zustand";
import type { StoredUser } from "../types/user";

type AuthState = {
    token: string | null;
    currentUser: StoredUser | null;
    login: (user: StoredUser) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
    token: null,
    currentUser: null,
        login: (user) =>
            set({
                token: `demo-jwt-${crypto.randomUUID()}`,
                currentUser: user,
            }),
        logout: () => set({ token: null, currentUser: null })
}));