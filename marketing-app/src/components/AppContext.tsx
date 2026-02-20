"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getTeamMembers, TeamMember } from "@/lib/api";

interface AppContextType {
  currentUser: string | null;
  setCurrentUser: (userId: string | null) => void;
  teamMembers: TeamMember[];
  refreshTeamMembers: () => Promise<void>;
  getUserColor: (userId: string | undefined) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("nystone_current_user");
    if (stored) setCurrentUser(stored);
  }, []);

  const refreshTeamMembers = async () => {
    try {
      const members = await getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
    }
  };

  useEffect(() => {
    refreshTeamMembers();
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (currentUser) {
      localStorage.setItem("nystone_current_user", currentUser);
    } else {
      localStorage.removeItem("nystone_current_user");
    }
  }, [currentUser, mounted]);

  const getUserColor = (userId: string | undefined): string => {
    if (!userId) return "#6b7280";
    const member = teamMembers.find((m) => m.id === userId);
    return member?.color || "#6b7280";
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        teamMembers,
        refreshTeamMembers,
        getUserColor,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within AppProvider");
  }
  return context;
}
