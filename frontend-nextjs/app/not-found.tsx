'use client';
import Link from 'next/link';
import { useState, useEffect } from "react";
import { useAuthStore } from "@/services/store/authStore";

export default function NotFound() {
  const getValidToken = useAuthStore((state) => state.getValidToken);
  const [hasToken, setHasToken] = useState<boolean>(false);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    setHasToken(!!getValidToken());
  }, [getValidToken]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6">
      {/* 404 Icon/Graphic */}
      <div className="text-9xl font-extrabold text-blue-900/20 mb-4 tracking-tighter">
        404
      </div>

      {/* Message */}
      <h2 className="text-3xl font-bold text-blue-950 mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-sm">
        Sorry, the page you are looking for doesn't exist or has been moved.
        Please return to the system overview.
      </p>

      {hasToken && role === 'admin'? (
        <Link
          href="/admin"
          className="px-8 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-all shadow-md"
        >
          Back to Dashboard
        </Link>
      ) : (
        <Link
          href="/"
          className="px-8 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-all shadow-md"
        >
          Back to Home
        </Link>

      )}


    </div>
  );
}