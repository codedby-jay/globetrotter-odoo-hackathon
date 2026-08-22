import { useState } from "react";

const SIZES = {
  sm: "h-7 w-7 text-xs",
  md: "h-14 w-14 text-xl",
  lg: "h-20 w-20 text-2xl md:h-24 md:w-24 md:text-3xl",
};

export default function UserAvatar({ user, size = "md", className = "" }) {
  const [failed, setFailed] = useState(false);
  const initial = (user?.name || user?.email || "T").slice(0, 1).toUpperCase();
  const photo = user?.photoUrl && !failed ? user.photoUrl : null;
  const box = SIZES[size] || SIZES.md;

  if (photo) {
    return (
      <img
        src={photo}
        alt={user?.name ? `${user.name}’s photo` : "Profile photo"}
        className={`${box} shrink-0 rounded-full object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`inline-flex ${box} shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,#1a7a72,#0d5757)] font-display font-semibold text-white ${className}`}
      role="img"
      aria-label={user?.name ? `${user.name}'s avatar` : "Profile avatar"}
    >
      {initial}
    </span>
  );
}
