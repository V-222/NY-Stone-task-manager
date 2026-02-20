"use client";

import { useState, useEffect } from "react";
import { Plus, AlertCircle, CheckSquare } from "lucide-react";
import {
  getWeeklyTasks,
  createWeeklyTask,
  updateWeeklyTask,
  deleteWeeklyTask,
  WeeklyTask,
} from "@/lib/api";
import { useApp } from "@/components/AppContext";
import TaskItem from "@/components/TaskItem";
import TaskForm from "@/components/TaskForm";

const URGENCY_ORDER = ["Urgent", "High", "Medium", "Low", "Least Urgent"] as const;

export default function WeeklyTasksPage() {
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const { currentUser } = useApp();

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await getWeeklyTasks();
      setTasks(
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (error) {
      console.error("Failed to load weekly tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

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
      await createWeeklyTask(title, description, urgency, currentUser);
      await loadTasks();
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create task:", error);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleToggleComplete = async (task: WeeklyTask) => {
    if (!currentUser) {
      alert("Please select a team member first");
      return;
    }
    try {
      await updateWeeklyTask(task.id, {
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
      await deleteWeeklyTask(taskId);
      await loadTasks();
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const grouped = Object.fromEntries(
    URGENCY_ORDER.map((u) => [u, tasks.filter((t) => t.urgency === u)])
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading tasks...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Weekly Tasks
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Plan and track your weekly marketing activities
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

      {!currentUser && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-yellow-800">
            <strong>Select a team member</strong> from the dropdown in the
            header to create and edit tasks.
          </div>
        </div>
      )}

      {showForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowForm(false)}
        />
      )}

      {tasks.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first weekly task
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {URGENCY_ORDER.map((urgency) => {
            const urgencyTasks = grouped[urgency];
            if (urgencyTasks.length === 0) return null;
            return (
              <div key={urgency}>
                <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                  {urgency} ({urgencyTasks.length})
                </h3>
                <div className="space-y-3">
                  {urgencyTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggleComplete={handleToggleComplete}
                      onDelete={handleDeleteTask}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
