"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import Button from "./Button";
import { LogOut } from "lucide-react";

type NavbarProps = {
  userName: string;
  role: "admin" | "viewer";
};

export default function Navbar({ userName, role }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const links = [
    { href: "/dashboard/calendar", label: "Kalendar" },
    { href: "/dashboard/shows", label: "Emisije" },
    ...(role === "admin"
      ? [{ href: "/dashboard/users", label: "Korisnici" }]
      : []),
  ];

  return (
    <nav className="bg-zinc-900/90 backdrop-blur-sm border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <span className="font-bold text-white text-sm tracking-wide shrink-0">
            TV Kalendar
          </span>

          {/* Desktop links */}
          <div className="hidden sm:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  pathname.startsWith(link.href)
                    ? "bg-red-600/20 text-red-400"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right */}
          <div className="hidden sm:flex items-center gap-3">
            <span className="text-sm text-zinc-400">{userName}</span>
            {role === "admin" && (
              <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full font-medium">
                Admin
              </span>
            )}
            <Button onClick={handleLogout} variant="ghost" className="text-sm">
              <LogOut size={16} />
              Odjavi se
            </Button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="sm:hidden p-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Meni"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-zinc-800 px-4 py-3 space-y-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                pathname.startsWith(link.href)
                  ? "bg-red-600/20 text-red-400"
                  : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-2 mt-2 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">{userName}</span>
              {role === "admin" && (
                <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full font-medium">
                  Admin
                </span>
              )}
            </div>
            <Button onClick={handleLogout} variant="ghost" className="text-sm">
              <LogOut size={16} />
              Odjavi se
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
