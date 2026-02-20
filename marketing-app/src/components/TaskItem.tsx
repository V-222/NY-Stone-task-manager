"use client";

import { Check, Trash2 } from "lucide-react";
import { WeeklyTask } from "@/lib/api";
import { useApp } from "./AppContext";
import { format } from "date-fns";

interface TaskItemProps {
  task: WeeklyTask;
  onToggleComplete: (task: WeeklyTask) => void;
  onDelete: (taskId: string) => void;
}

export default function TaskItem({
  task,
  onToggleComplete,
  onDelete,
}: TaskItemProps) {
  const { getUserColor, teamMembers } = useApp();

  const urgencyBorder: Record<string, string> = {
    Urgent: "border-l-red-500",
    High: "border-l-orange-500",
    Medium: "border-l-yellow-500",
    Low: "border-l-blue-500",
    "Least Urgent": "border-l-gray-400",
  };

  const editorColor = getUserColor(task.lastEditedBy);
  const editor = teamMembers.find((m) => m.id === task.lastEditedBy);

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
