'use client';

import React, {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";

type AuthChangeListener = () => void;

type AuthContextType = {
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
    subscribe: (listener: AuthChangeListener) => () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

let latestToken: string | null = null;

export const AuthProvider = ({children}: { children: ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Subscribers to auth change
    const listeners = useRef<Set<AuthChangeListener>>(new Set());

    // Hydrate on mount
    useEffect(() => {
        const stored = typeof window === "undefined" ? null : localStorage.getItem("token");
        setToken(stored);
        latestToken = stored;
        setLoading(false);
    }, []);

    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === "token") {
                setToken(e.newValue);
                latestToken = e.newValue;
            }
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, []);

    // Notify all listeners
    const notifyListeners = () => {
        listeners.current.forEach(cb => {
            try {
                cb();
            } catch (err) {
                /* swallow */
            }
        });
    };

    const login = (newToken: string) => {
        setToken(newToken);
        latestToken = newToken;
        if (typeof window !== "undefined") {
            localStorage.setItem("token", newToken);
        }
        notifyListeners();
    };

    const logout = () => {
        setToken(null);
        latestToken = null;
        if (typeof window !== "undefined") {
            localStorage.removeItem("token");
        }
        notifyListeners();
    };

    // Allow components to subscribe for auth changes
    const subscribe = (listener: AuthChangeListener) => {
        listeners.current.add(listener);
        return () => {
            listeners.current.delete(listener);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                isAuthenticated: !!token,
                loading,
                login,
                logout,
                subscribe,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
}

export function getAuthToken(): string | null {
    return latestToken;
}