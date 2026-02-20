"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FolderKanban, Trash2 } from "lucide-react";
import { getProjects, createProject, deleteProject, Project } from "@/lib/api";
import { useApp } from "@/components/AppContext";
import { format } from "date-fns";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const { currentUser, getUserColor, teamMembers } = useApp();

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjects(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to load projects:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !currentUser) {
      if (!currentUser) alert("Please select a team member first");
      return;
    }
    try {
      await createProject(title.trim(), description.trim(), currentUser);
      await loadProjects();
      setShowForm(false);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create project:", error);
      alert("Failed to create project. Please try again.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this project? All associated tasks will also be deleted."
      )
    )
      return;
    try {
      await deleteProject(projectId);
      await loadProjects();
    } catch (error) {
      console.error("Failed to delete project:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Projects
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Organize your marketing campaigns and initiatives
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Project
          </h3>
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Enter project name"
                autoFocus
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Describe the project goals and strategy"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Create Project
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setTitle("");
                  setDescription("");
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FolderKanban className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No projects yet
          </h3>
          <p className="text-gray-600 mb-4">
            Create your first project to organize marketing campaigns
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {projects.map((project) => {
            const editorColor = getUserColor(project.lastEditedBy);
            const editor = teamMembers.find(
              (m) => m.id === project.lastEditedBy
            );

            return (
              <div
                key={project.id}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden group"
                style={{ boxShadow: `0 0 0 2px ${editorColor}20` }}
              >
                {project.images && project.images.length > 0 ? (
                  <div className="h-40 sm:h-48 overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.images[0]}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-40 sm:h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                    <FolderKanban className="w-16 h-16 text-gray-300" />
                  </div>
                )}

                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg leading-tight flex-1">
                      {project.title}
                    </h3>
                    <button
                      onClick={() => handleDeleteProject(project.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {project.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    {editor && (
                      <span className="flex items-center gap-1">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: editorColor }}
                        />
                        {editor.name}
                      </span>
                    )}
                    <span>
                      {format(new Date(project.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  <Link
                    href={`/projects/${project.id}`}
                    className="block w-full px-4 py-2 bg-black text-white text-center rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                  >
                    View Project
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
