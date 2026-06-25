"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/services/auth/authStore";
import ProfileDropdown from "./ProfileDropdown";

interface ProfileSectionProps {
  isMainPage?: boolean;
}

export default function ProfileSection({ isMainPage = false }: ProfileSectionProps) {
  const getValidToken = useAuthStore((state) => state.getValidToken);
  const [hasToken, setHasToken] = useState<boolean>(false);

  useEffect(() => {
    setHasToken(!!getValidToken());
  }, [getValidToken]);

  return (
    <div>
      {hasToken ? (
        // if the token is exist show dropdown
        <ProfileDropdown isMainPage={isMainPage} />
      ) : (
        /* if not token show lo */
        <Link
          href="/login"
          className={`text-xs font-bold tracking-wider uppercase px-4 py-2 rounded-md transition ${
            isMainPage
              ? "border border-white/40 hover:bg-white/10 text-white"
              : "bg-blue-900 text-white hover:bg-blue-950"
          }`}
        >
          Login
        </Link>
      )}
    </div>
  );
}