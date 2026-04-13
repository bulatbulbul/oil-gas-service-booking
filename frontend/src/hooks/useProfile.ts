import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadAvatar } from "../api/auth";
import { useUser } from "../context/UserContext";

export function useProfile() {
    const { me, loading, loadError, setMe, avatarVersion, bumpAvatar } = useUser();
    const [uploadError, setUploadError] = useState<string | null>(null);
    const error = uploadError || loadError;
    const [avatarUploading, setAvatarUploading] = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    function handleLogout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        navigate("/login");
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setAvatarUploading(true);
            setUploadError(null);
            const { avatar_url } = await uploadAvatar(file);
            setMe((prev) => prev ? { ...prev, avatar_url } : prev);
            bumpAvatar(); // cache-bust: force browser to reload image
        } catch {
            setUploadError("Не удалось загрузить аватар");
        } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        }
    }

    return { me, loading, error, avatarUploading, avatarVersion, avatarInputRef, handleLogout, handleAvatarChange };
}
