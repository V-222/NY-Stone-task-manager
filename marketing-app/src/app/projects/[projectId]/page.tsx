"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Upload,
  X,
  Image as ImageIcon,
  Trash2,
  FileText,
} from "lucide-react";
import {
  getProjects,
  getProjectTasks,
  createProjectTask,
  updateProjectTask,
  deleteProjectTask,
  updateProject,
  uploadImage,
  uploadPDF,
  Project,
  ProjectTask,
} from "@/lib/api";
import { useApp } from "@/components/AppContext";
import ProjectTaskItem from "@/components/ProjectTaskItem";
import TaskForm from "@/components/TaskForm";

const URGENCY_ORDER = ["Urgent", "High", "Medium", "Low", "Least Urgent"] as const;

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { currentUser } = useApp();

  const loadProject = async () => {
    try {
      setLoading(true);
      const projects = await getProjects();
      setProject(projects.find((p) => p.id === projectId) || null);
    } catch (error) {
      console.error("Failed to load project:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async () => {
    try {
      const data = await getProjectTasks(projectId);
      setTasks(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to load project tasks:", error);
    }
  };

  useEffect(() => {
    loadProject();
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const handleCreateTask = async (
    title: string,
    description: string,
    urgency: string
  ) => {
    if (!currentUser) {
      alert("Please select a team member first");
      return;
    }
    try {
      await createProjectTask(projectId, title, description, urgency, currentUser);
      await loadTasks();
      setShowTaskForm(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleToggleComplete = async (task: ProjectTask) => {
    if (!currentUser) {
      alert("Please select a team member first");
      return;
    }
    try {
      await updateProjectTask(projectId, task.id, {
        completed: !task.completed,
        lastEditedBy: currentUser,
      });
      await loadTasks();
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      await deleteProjectTask(projectId, taskId);
      await loadTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleUploadProjectImage = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !project || !currentUser) return;
    try {
      setUploading(true);
      const url = await uploadImage(file);
      await updateProject(project.id, {
        images: [...(project.images || []), url],
        lastEditedBy: currentUser,
      });
      await loadProject();
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProjectImage = async (imageUrl: string) => {
    if (!project || !currentUser || !confirm("Remove this image?")) return;
    try {
      await updateProject(project.id, {
        images: project.images.filter((img) => img !== imageUrl),
        lastEditedBy: currentUser,
      });
      await loadProject();
    } catch (error) {
      console.error("Failed to remove image:", error);
    }
  };

  const handleUploadProjectPDF = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !project || !currentUser) return;
    try {
      setUploading(true);
      const pdfData = await uploadPDF(file);
      await updateProject(project.id, {
        pdfs: [...(project.pdfs || []), pdfData],
        lastEditedBy: currentUser,
      });
      await loadProject();
    } catch (error) {
      console.error("Failed to upload PDF:", error);
      alert("Failed to upload PDF.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveProjectPDF = async (pdfUrl: string) => {
    if (!project || !currentUser || !confirm("Remove this PDF?")) return;
    try {
      await updateProject(project.id, {
        pdfs: (project.pdfs || []).filter((pdf) => pdf.url !== pdfUrl),
        lastEditedBy: currentUser,
      });
      await loadProject();
    } catch (error) {
      console.error("Failed to remove PDF:", error);
    }
  };

  const handleAddTaskImage = async (task: ProjectTask, file: File) => {
    if (!currentUser) return;
    try {
      const url = await uploadImage(file);
      await updateProjectTask(projectId, task.id, {
        images: [...(task.images || []), url],
        lastEditedBy: currentUser,
      });
      await loadTasks();
    } catch (error) {
      console.error("Failed to upload task image:", error);
    }
  };

  const handleRemoveTaskImage = async (task: ProjectTask, imageUrl: string) => {
    if (!currentUser) return;
    try {
      await updateProjectTask(projectId, task.id, {
        images: task.images.filter((img) => img !== imageUrl),
        lastEditedBy: currentUser,
      });
      await loadTasks();
    } catch (error) {
      console.error("Failed to remove task image:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Project not found
        </h2>
        <Link href="/projects" className="text-blue-600 hover:underline">
          Return to Projects
        </Link>
      </div>
    );
  }

  const grouped = Object.fromEntries(
    URGENCY_ORDER.map((u) => [u, tasks.filter((t) => t.urgency === u)])
  );

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {project.title}
            </h2>
            {project.description && (
              <p className="text-gray-600 mt-2 max-w-3xl text-sm sm:text-base">
                {project.description}
              </p>
            )}
          </div>
          <button
            onClick={() => setShowTaskForm(true)}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 self-start"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>
      </div>

      {/* Project Images */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Project Images
          </h3>
          <label className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">
              {uploading ? "Uploading..." : "Upload Image"}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUploadProjectImage}
              className="hidden"
              disabled={uploading || !currentUser}
            />
          </label>
        </div>

        {project.images && project.images.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {project.images.map((imageUrl, index) => (
              <div key={index} className="relative group aspect-square">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt={`Project image ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => handleRemoveProjectImage(imageUrl)}
                  className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No images uploaded yet</p>
          </div>
        )}
      </div>

      {/* Project PDFs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">Project PDFs</h3>
          <label className="px-3 sm:px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" />
            <span className="hidden sm:inline">
              {uploading ? "Uploading..." : "Upload PDF"}
            </span>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleUploadProjectPDF}
              className="hidden"
              disabled={uploading || !currentUser}
            />
          </label>
        </div>

        {project.pdfs && project.pdfs.length > 0 ? (
          <div className="space-y-2">
            {project.pdfs.map((pdf, index) => (
              <div
                key={index}
                className="group relative flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <a
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 flex-1 min-w-0"
                >
                  <FileText className="w-6 h-6 text-gray-600 flex-shrink-0" />
                  <span className="text-sm font-medium text-black truncate">
                    {pdf.fileName}
                  </span>
                </a>
                <button
                  onClick={() => handleRemoveProjectPDF(pdf.url)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
            <FileText className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No PDFs uploaded yet</p>
          </div>
        )}
      </div>

      {/* Task Form */}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskForm(false)}
        />
      )}

      {/* Tasks */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Tasks</h3>

        {tasks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-600">
              No tasks yet. Create your first task to get started.
            </p>
          </div>
        ) : (
          URGENCY_ORDER.map((urgency) => {
            const urgencyTasks = grouped[urgency];
            if (urgencyTasks.length === 0) return null;
            return (
              <div key={urgency}>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  {urgency} ({urgencyTasks.length})
                </h4>
                <div className="space-y-3">
                  {urgencyTasks.map((task) => (
                    <ProjectTaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                      onAddImage={handleAddTaskImage}
                      onRemoveImage={handleRemoveTaskImage}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
