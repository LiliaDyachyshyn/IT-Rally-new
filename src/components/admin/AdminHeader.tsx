"use client";

import { signOut } from "next-auth/react";

interface AdminHeaderProps {
  user: { name?: string | null; email?: string | null };
}

export default function AdminHeader({ user }: AdminHeaderProps) {
  return (
    <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center justify-end px-6 gap-4">
      <span className="text-gray-400 text-sm">{user.email}</span>
      <button
        onClick={() => signOut({ callbackUrl: "/admin/login" })}
        className="text-sm text-gray-400 hover:text-white transition-colors"
      >
        Вийти
      </button>
    </header>
  );
}
