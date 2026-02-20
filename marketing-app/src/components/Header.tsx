"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CheckSquare,
  FolderKanban,
  Users,
  FileText,
  Calendar as CalendarIcon,
  Menu,
  X,
} from "lucide-react";
import { useApp } from "./AppContext";

const NAV_ITEMS = [
  { href: "/", label: "Tasks", icon: CheckSquare, match: (p: string) => p === "/" },
  { href: "/projects", label: "Projects", icon: FolderKanban, match: (p: string) => p.startsWith("/projects") },
  { href: "/team", label: "Team", icon: Users, match: (p: string) => p.startsWith("/team") },
  { href: "/notes", label: "Notes", icon: FileText, match: (p: string) => p.startsWith("/notes") },
  { href: "/calendar", label: "Calendar", icon: CalendarIcon, match: (p: string) => p.startsWith("/calendar") },
];

export default function Header() {
  const pathname = usePathname();
  const { currentUser, teamMembers, setCurrentUser } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentMember = teamMembers.find((m) => m.id === currentUser);

  return (
    <header className="bg-black sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl sm:text-2xl font-bold text-white whitespace-nowrap">
            NY Stone Marketing
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => (
              <Link
                key={href}
                href={href}
                className={`px-3 lg:px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors ${
                  match(pathname)
                    ? "bg-white text-black"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden lg:inline">{label}</span>
              </Link>
            ))}
          </nav>

          {/* User selector (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <select
              value={currentUser || ""}
              onChange={(e) => setCurrentUser(e.target.value || null)}
              className="px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white max-w-[180px]"
              style={{
                borderLeft: currentMember
                  ? `4px solid ${currentMember.color}`
                  : undefined,
              }}
            >
              <option value="">Select member</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-white"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-800 bg-black pb-4">
          <nav className="flex flex-col px-4 pt-2 gap-1">
            {NAV_ITEMS.map(({ href, label, icon: Icon, match }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg flex items-center gap-3 text-sm transition-colors ${
                  match(pathname)
                    ? "bg-white text-black"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </nav>
          <div className="px-4 pt-3">
            <label className="block text-xs text-gray-400 mb-1">Current User</label>
            <select
              value={currentUser || ""}
              onChange={(e) => setCurrentUser(e.target.value || null)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-white"
              style={{
                borderLeft: currentMember
                  ? `4px solid ${currentMember.color}`
                  : undefined,
              }}
            >
              <option value="">Select member</option>
              {teamMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </header>
  );
}
