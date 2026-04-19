import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadAvatar, updateMe, getMyStats } from "../api/auth";
import { useUser } from "../context/UserContext";

type Stats = { total_bookings: number; active_bookings: number; completed_bookings: number };

export function useProfile() {
    const { me, loading, loadError, setMe, avatarVersion, bumpAvatar } = useUser();
    const [uploadError, setUploadError]     = useState<string | null>(null);
    const [avatarUploading, setAvatarUploading] = useState(false);
    const [stats, setStats]                 = useState<Stats | null>(null);
    const [editing, setEditing]             = useState(false);
    const [editName, setEditName]           = useState("");
    const [editEmail, setEditEmail]         = useState("");
    const [saving, setSaving]               = useState(false);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const error = uploadError || loadError;

    useEffect(() => {
        getMyStats().then(setStats).catch(() => {});
    }, []);

    function handleLogout() {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userRole");
        navigate("/login");
    }

    function startEditing() {
        setEditName(me?.name ?? "");
        setEditEmail(me?.email ?? "");
        setEditing(true);
    }

    function cancelEditing() {
        setEditing(false);
    }

    async function handleSave() {
        if (!editName.trim()) return;
        try {
            setSaving(true);
            const updated = await updateMe({ name: editName.trim(), email: editEmail.trim() || undefined });
            setMe(prev => prev ? { ...prev, name: updated.name, email: updated.email } : prev);
            setEditing(false);
        } catch {
            setUploadError("Не удалось сохранить изменения");
        } finally {
            setSaving(false);
        }
    }

    async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            setAvatarUploading(true);
            setUploadError(null);
            const { avatar_url } = await uploadAvatar(file);
            setMe(prev => prev ? { ...prev, avatar_url } : prev);
            bumpAvatar();
        } catch {
            setUploadError("Не удалось загрузить аватар");
        } finally {
            setAvatarUploading(false);
            if (avatarInputRef.current) avatarInputRef.current.value = "";
        }
    }

    return {
        me, loading, error, stats,
        avatarUploading, avatarVersion, avatarInputRef, handleAvatarChange,
        editing, editName, editEmail, setEditName, setEditEmail,
        saving, startEditing, cancelEditing, handleSave,
        handleLogout,
    };
}
