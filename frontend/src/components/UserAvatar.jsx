import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";

export default function UserAvatar({ className = "" }) {
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await api.getUserProfile();
        if (mounted && data?.imageUrl) {
          setImageUrl(data.imageUrl);
        }
      } catch (err) {
        // ignore silently - fallback to placeholder
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => (mounted = false);
  }, []);

  const handleClick = () => {
    navigate("/account-settings");
  };

  const baseClasses = "h-10 w-10 overflow-hidden rounded-full border-2 border-primary/20 bg-cover bg-center hover:border-primary/40 transition-colors cursor-pointer";

  if (imageUrl) {
    return (
      <button
        onClick={handleClick}
        className={`${baseClasses} ${className}`}
        style={{ backgroundImage: `url("${imageUrl}")` }}
        title="Account Settings"
      />
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`${baseClasses} ${className} flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600 text-white`}
      title="Account Settings"
    >
      <span className="material-symbols-outlined text-xl">account_circle</span>
    </button>
  );
}
