"use client";

import { useState } from "react";
import {
  Check,
  Trash2,
  Upload,
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
} from "lucide-react";
import { ProjectTask } from "@/lib/api";
import { useApp } from "./AppContext";
import { format } from "date-fns";

interface ProjectTaskItemProps {
  task: ProjectTask;
  onToggleComplete: (task: ProjectTask) => void;
  onDelete: (taskId: string) => void;
  onAddImage: (task: ProjectTask, file: File) => void;
  onRemoveImage: (task: ProjectTask, imageUrl: string) => void;
}

export default function ProjectTaskItem({
  task,
  onToggleComplete,
  onDelete,
  onAddImage,
  onRemoveImage,
}: ProjectTaskItemProps) {
  const [showImages, setShowImages] = useState(false);
  const { getUserColor, teamMembers, currentUser } = useApp();

  const urgencyBorder: Record<string, string> = {
    Urgent: "border-l-red-500",
    High: "border-l-orange-500",
    Medium: "border-l-yellow-500",
    Low: "border-l-blue-500",
    "Least Urgent": "border-l-gray-400",
  };

  const editorColor = getUserColor(task.lastEditedBy);
  const editor = teamMembers.find((m) => m.id === task.lastEditedBy);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onAddImage(task, file);
  };

  return (
    <div
      className={`bg-white rounded-lg border-l-4 border-y border-r border-gray-200 p-3 sm:p-4 hover:shadow-md transition-shadow ${
        urgencyBorder[task.urgency]
      }`}
      style={{ boxShadow: `0 0 0 2px ${editorColor}20` }}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <button
          onClick={() => onToggleComplete(task)}
          className={`flex-shrink-0 w-6 h-6 rounded border-2 transition-all mt-0.5 ${
            task.completed
              ? "bg-green-500 border-green-500"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          {task.completed && (
            <Check className="w-full h-full text-white p-0.5" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <h4
            className={`font-semibold text-gray-900 ${
              task.completed ? "line-through text-gray-500" : ""
            }`}
          >
            {task.title}
          </h4>
          {task.description && (
            <p
              className={`text-sm text-gray-600 mt-1 ${
                task.completed ? "line-through" : ""
              }`}
            >
              {task.description}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-2 text-xs text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded">
              {task.urgency}
            </span>
            {editor && (
              <span className="flex items-center gap-1">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: editorColor }}
                />
                <span className="hidden sm:inline">Last edited by </span>
                {editor.name}
              </span>
            )}
            <span>{format(new Date(task.lastEditedAt), "MMM d, h:mm a")}</span>
          </div>

          {/* Image Section */}
          <div className="mt-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImages(!showImages)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
              >
                <ImageIcon className="w-4 h-4" />
                Images ({task.images?.length || 0})
                {showImages ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
              <label className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1">
                <Upload className="w-4 h-4" />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={!currentUser}
                />
              </label>
            </div>

            {showImages && (
              <div className="mt-3">
                {task.images && task.images.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {task.images.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="relative group aspect-square"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={`Task image ${index + 1}`}
                          className="w-full h-full object-cover rounded"
                        />
                        <button
                          onClick={() => onRemoveImage(task, imageUrl)}
                          className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded text-xs text-gray-500">
                    No images uploaded
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(task.id)}
          className="flex-shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
