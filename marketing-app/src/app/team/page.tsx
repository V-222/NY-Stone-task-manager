"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Trash2, Users as UsersIcon, Eye } from "lucide-react";
import { useApp } from "@/components/AppContext";
import { getSupabase } from "@/lib/supabase";
import Spinner from "@/components/Spinner";

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981", "#14B8A6",
  "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#EC4899",
];

export default function TeamPage() {
  const { teamMembers, teamLoading, refreshTeamMembers } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      const { error } = await getSupabase()
        .from("team_members")
        .insert({ name: name.trim(), color: selectedColor });

      if (error) throw error;

      await refreshTeamMembers();
      setShowForm(false);
      setName("");
      setSelectedColor(PRESET_COLORS[0]);
    } catch (error) {
      console.error("Failed to create team member:", error);
      alert("Failed to create team member.");
    }
  };

  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;
    try {
      const { error } = await getSupabase()
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;

      await refreshTeamMembers();
    } catch (error) {
      console.error("Failed to delete team member:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black">
            Team Settings
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage your team members and their color coding
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Member
        </button>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-black mb-2">About Color Coding</h3>
        <p className="text-sm text-gray-700">
          Each team member is assigned a unique color. When you make edits to
          tasks or projects, those items will be highlighted with your color so
          everyone can see who made the last change.
        </p>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-black mb-4">
            Add Team Member
          </h3>
          <form onSubmit={handleCreateMember} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter team member name"
                autoFocus
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color *
              </label>
              <div className="grid grid-cols-6 gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-full aspect-square rounded-lg transition-all ${
                      selectedColor === color
                        ? "ring-4 ring-offset-2 ring-black scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Add Member
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setName("");
                  setSelectedColor(PRESET_COLORS[0]);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {teamLoading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : teamMembers.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <UsersIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">
            No team members yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first team member to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-lg border-l-4 border-y border-r border-gray-200 p-4 hover:shadow-md transition-shadow group"
              style={{ borderLeftColor: member.color }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className="w-12 h-12 rounded-full flex-shrink-0"
                    style={{ backgroundColor: member.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-black truncate">
                      {member.name}
                    </h3>
                    <p className="text-sm text-gray-500">{member.color}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Link
                    href={`/team/member/${member.id}`}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-600 hover:text-black hover:bg-gray-50 rounded transition-all"
                    title="View member overview"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteMember(member.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
