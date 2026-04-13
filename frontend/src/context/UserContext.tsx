import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { getMe } from "../api/auth";
import type { Me } from "../types";

type UserCtx = {
    me: Me | null;
    loading: boolean;
    loadError: string | null;
    avatarVersion: number;
    setMe: (updater: Me | ((prev: Me | null) => Me | null)) => void;
    bumpAvatar: () => void;
    refresh: () => void;
};

const UserContext = createContext<UserCtx>({
    me: null,
    loading: true,
    loadError: null,
    avatarVersion: 0,
    setMe: () => {},
    bumpAvatar: () => {},
    refresh: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
    const [me, setMeRaw] = useState<Me | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [avatarVersion, setAvatarVersion] = useState(0);

    const setMe = useCallback((updater: Me | ((prev: Me | null) => Me | null)) => {
        setMeRaw(updater as any);
    }, []);

    const bumpAvatar = useCallback(() => setAvatarVersion((v) => v + 1), []);

    const load = useCallback(() => {
        const token = localStorage.getItem("authToken");
        if (!token) { setLoading(false); return; }
        setLoading(true);
        getMe()
            .then((data) => { setMeRaw(data); setLoadError(null); })
            .catch(() => setLoadError("Не удалось загрузить профиль"))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { load(); }, [load]);

    return (
        <UserContext.Provider value={{ me, loading, loadError, avatarVersion, setMe, bumpAvatar, refresh: load }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);