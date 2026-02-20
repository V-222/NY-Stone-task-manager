"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Trash2,
  Users as UsersIcon,
  Eye,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { useApp } from "@/components/AppContext";
import { getSupabase } from "@/lib/supabase";
import Spinner from "@/components/Spinner";

const PRESET_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#84CC16", "#10B981", "#14B8A6",
  "#06B6D4", "#3B82F6", "#6366F1", "#8B5CF6", "#A855F7", "#EC4899",
];

export default function TeamPage() {
  const { teamMembers, setTeamMembers, teamLoading, refreshTeamMembers } =
    useApp();

  // ── Create state ────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [creatingMember, setCreatingMember] = useState(false);

  // ── Inline‑edit state ───────────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ── Delete state ────────────────────────────────────────────────────────
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // ── CREATE ──────────────────────────────────────────────────────────────
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setCreatingMember(true);
    try {
      const { data, error } = await getSupabase()
        .from("team_members")
        .insert({ name: name.trim(), role: role.trim(), color: selectedColor })
        .select()
        .single();

      if (error) throw error;

      // Optimistic: append new member locally
      setTeamMembers((prev) => [
        ...prev,
        {
          id: data.id,
          name: data.name,
          role: data.role ?? "",
          color: data.color,
          createdAt: data.created_at,
        },
      ]);

      setShowForm(false);
      setName("");
      setRole("");
      setSelectedColor(PRESET_COLORS[0]);
    } catch (error) {
      console.error("Failed to create team member:", error);
      // Refresh to stay in sync after failure
      await refreshTeamMembers();
    } finally {
      setCreatingMember(false);
    }
  };

  // ── UPDATE (inline) ────────────────────────────────────────────────────
  const startEditing = (memberId: string) => {
    const member = teamMembers.find((m) => m.id === memberId);
    if (!member) return;
    setEditingId(memberId);
    setEditName(member.name);
    setEditRole(member.role);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
    setEditRole("");
  };

  const handleUpdateMember = async (memberId: string) => {
    if (!editName.trim()) return;

    const previous = teamMembers.find((m) => m.id === memberId);
    if (!previous) return;

    // Nothing changed — just close the editor
    if (editName.trim() === previous.name && editRole.trim() === previous.role) {
      cancelEditing();
      return;
    }

    setUpdatingId(memberId);

    // Optimistic: update locally first
    setTeamMembers((prev) =>
      prev.map((m) =>
        m.id === memberId
          ? { ...m, name: editName.trim(), role: editRole.trim() }
          : m
      )
    );
    cancelEditing();

    try {
      const { error } = await getSupabase()
        .from("team_members")
        .update({ name: editName.trim(), role: editRole.trim() })
        .eq("id", memberId);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to update team member:", error);
      // Rollback optimistic update
      setTeamMembers((prev) =>
        prev.map((m) => (m.id === memberId ? previous : m))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // ── DELETE ──────────────────────────────────────────────────────────────
  const handleDeleteMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    setDeletingId(memberId);

    // Snapshot for rollback
    const previous = teamMembers;

    // Optimistic: remove locally
    setTeamMembers((prev) => prev.filter((m) => m.id !== memberId));

    try {
      const { error } = await getSupabase()
        .from("team_members")
        .delete()
        .eq("id", memberId);

      if (error) throw error;
    } catch (error) {
      console.error("Failed to delete team member:", error);
      // Rollback
      setTeamMembers(previous);
    } finally {
      setDeletingId(null);
    }
  };

  // ── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Info box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="font-semibold text-black mb-2">About Color Coding</h3>
        <p className="text-sm text-gray-700">
          Each team member is assigned a unique color. When you make edits to
          tasks or projects, those items will be highlighted with your color so
          everyone can see who made the last change.
        </p>
      </div>

      {/* ── Create form ─────────────────────────────────────────────────── */}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="e.g. Designer, Developer, Manager"
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
                disabled={creatingMember}
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creatingMember ? (
                  <>
                    <Spinner size="sm" className="text-white" />
                    Adding…
                  </>
                ) : (
                  "Add Member"
                )}
              </button>
              <button
                type="button"
                disabled={creatingMember}
                onClick={() => {
                  setShowForm(false);
                  setName("");
                  setRole("");
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

      {/* ── Member list ─────────────────────────────────────────────────── */}
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
          {teamMembers.map((member) => {
            const isEditing = editingId === member.id;
            const isUpdating = updatingId === member.id;
            const isDeleting = deletingId === member.id;

            return (
              <div
                key={member.id}
                className={`bg-white rounded-lg border-l-4 border-y border-r border-gray-200 p-4 hover:shadow-md transition-shadow group ${
                  isDeleting ? "opacity-50 pointer-events-none" : ""
                }`}
                style={{ borderLeftColor: member.color }}
              >
                {isEditing ? (
                  /* ── Inline edit mode ──────────────────────────────── */
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: member.color }}
                      />
                      <div className="flex-1 min-w-0 space-y-2">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="Name"
                          autoFocus
                        />
                        <input
                          type="text"
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="Role"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => handleUpdateMember(member.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                        title="Save"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={cancelEditing}
                        className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"
                        title="Cancel"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── Display mode ─────────────────────────────────── */
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-12 h-12 rounded-full flex-shrink-0"
                        style={{ backgroundColor: member.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-black truncate flex items-center gap-2">
                          {member.name}
                          {isUpdating && (
                            <Spinner size="sm" className="text-gray-400" />
                          )}
                        </h3>
                        {member.role ? (
                          <p className="text-sm text-gray-500 truncate">
                            {member.role}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">
                            No role
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => startEditing(member.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                        title="Edit member"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
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
                        title="Delete member"
                      >
                        {isDeleting ? (
                          <Spinner size="sm" className="text-red-400" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
