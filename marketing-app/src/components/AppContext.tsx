"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { TeamMember } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";

interface AppContextType {
  currentUser: string | null;
  setCurrentUser: (userId: string | null) => void;
  teamMembers: TeamMember[];
  teamLoading: boolean;
  refreshTeamMembers: () => Promise<void>;
  getUserColor: (userId: string | undefined) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamLoading, setTeamLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("nystone_current_user");
    if (stored) setCurrentUser(stored);
  }, []);

  const refreshTeamMembers = useCallback(async () => {
    try {
      setTeamLoading(true);
      const { data, error } = await getSupabase()
        .from("team_members")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) throw error;

      const members: TeamMember[] = (data ?? []).map((row) => ({
        id: row.id,
        name: row.name,
        color: row.color,
        createdAt: row.created_at,
      }));
      setTeamMembers(members);
    } catch (error) {
      console.error("Failed to fetch team members:", error);
    } finally {
      setTeamLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTeamMembers();
  }, [refreshTeamMembers]);

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
        teamLoading,
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
