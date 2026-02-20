"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, Trash2 } from "lucide-react";
import { useApp } from "@/components/AppContext";
import {
  getCalendarGoals, createCalendarGoal, updateCalendarGoal, deleteCalendarGoal,
  getWeeklyTasks, getProjects, getProjectTasks, CalendarGoal,
} from "@/lib/api";

export default function CalendarPage() {
  const { currentUser, getUserColor } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [goals, setGoals] = useState<CalendarGoal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [teamProgress, setTeamProgress] = useState({ completed: 0, total: 0 });

  useEffect(() => { loadGoals(); loadTeamProgress(); }, []);

  async function loadGoals() {
    try { setGoals(await getCalendarGoals()); } catch (e) { console.error(e); }
  }

  async function loadTeamProgress() {
    try {
      const [weeklyTasks, projects] = await Promise.all([getWeeklyTasks(), getProjects()]);
      let completed = weeklyTasks.filter((t) => t.completed).length;
      let total = weeklyTasks.length;
      for (const project of projects) {
        const tasks = await getProjectTasks(project.id);
        total += tasks.length;
        completed += tasks.filter((t) => t.completed).length;
      }
      setTeamProgress({ completed, total });
    } catch (e) { console.error(e); }
  }

  async function handleCreateGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !selectedDate) return;
    try {
      await createCalendarGoal(title.trim(), selectedDate, description.trim(), currentUser || undefined);
      await loadGoals();
      setShowForm(false); setTitle(""); setDescription(""); setSelectedDate(null);
    } catch (e) { console.error(e); alert("Failed to create goal."); }
  }

  async function handleToggleGoal(goal: CalendarGoal) {
    try {
      await updateCalendarGoal(goal.id, { completed: !goal.completed, lastEditedBy: currentUser || undefined });
      await loadGoals(); await loadTeamProgress();
    } catch (e) { console.error(e); }
  }

  async function handleDeleteGoal(goalId: string) {
    if (!confirm("Delete this goal?")) return;
    try { await deleteCalendarGoal(goalId); await loadGoals(); } catch (e) { console.error(e); }
  }

  function getDaysInMonth(date: Date): Date[] {
    const year = date.getFullYear(), month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) days.push(new Date(year, month, -firstDayOfWeek + i + 1));
    for (let day = 1; day <= lastDay.getDate(); day++) days.push(new Date(year, month, day));
    return days;
  }

  function getGoalsForDate(date: Date): CalendarGoal[] {
    const dateStr = date.toISOString().split("T")[0];
    return goals.filter((g) => g.date === dateStr);
  }

  const formatDateForInput = (d: Date) => d.toISOString().split("T")[0];
  const changeMonth = (delta: number) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + delta, 1));
  const isToday = (d: Date) => d.toDateString() === new Date().toDateString();
  const isCurrentMonth = (d: Date) => d.getMonth() === currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const days = getDaysInMonth(currentDate);
  const progressPct = teamProgress.total > 0 ? Math.round((teamProgress.completed / teamProgress.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black">Team Calendar</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Set goals and track monthly team progress</p>
        </div>
        <button onClick={() => { setSelectedDate(formatDateForInput(new Date())); setShowForm(true); }} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Goal
        </button>
      </div>

      {/* Team Progress */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-6">
        <h3 className="text-lg font-bold text-black mb-4">Overall Team Progress</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Collective Completion</span>
              <span className="text-sm font-bold text-black">{progressPct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div className="bg-black h-4 rounded-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <div className="text-center px-6 py-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-black">{teamProgress.completed}</div>
            <div className="text-xs text-gray-600">of {teamProgress.total} tasks</div>
          </div>
        </div>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-black mb-4">Add Calendar Goal</h3>
          <form onSubmit={handleCreateGoal} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Goal Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="Enter goal title" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Date *</label><input type="date" value={selectedDate || ""} onChange={(e) => setSelectedDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[80px]" placeholder="Optional description" /></div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">Add Goal</button>
              <button type="button" onClick={() => { setShowForm(false); setTitle(""); setDescription(""); setSelectedDate(null); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <h3 className="text-lg font-bold text-black">{monthName}</h3>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-200 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>

        {/* Day Labels */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-2 sm:p-3 text-center text-xs sm:text-sm font-semibold text-gray-600 border-r border-gray-200 last:border-r-0">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const dayGoals = getGoalsForDate(date);
            return (
              <div key={index} className={`min-h-[80px] sm:min-h-[120px] border-r border-b border-gray-200 last:border-r-0 p-1 sm:p-2 ${!isCurrentMonth(date) ? "bg-gray-50" : ""} ${isToday(date) ? "bg-blue-50" : ""}`}>
                <div className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${isToday(date) ? "text-blue-600" : isCurrentMonth(date) ? "text-black" : "text-gray-400"}`}>{date.getDate()}</div>
                <div className="space-y-1">
                  {dayGoals.slice(0, 2).map((goal) => {
                    const creatorColor = getUserColor(goal.createdBy);
                    return (
                      <div key={goal.id} className="group relative">
                        <div className={`text-[10px] sm:text-xs px-1 sm:px-2 py-0.5 sm:py-1 rounded flex items-center gap-1 cursor-pointer transition-all ${goal.completed ? "bg-gray-200 text-gray-600 line-through" : "bg-black text-white hover:bg-gray-800"}`} onClick={() => handleToggleGoal(goal)} style={{ borderLeft: `3px solid ${creatorColor}` }}>
                          {goal.completed ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> : <Circle className="w-3 h-3 flex-shrink-0" />}
                          <span className="truncate flex-1">{goal.title}</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteGoal(goal.id); }} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-0.5 sm:p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all transform -translate-y-1/2 translate-x-1/2">
                          <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        </button>
                      </div>
                    );
                  })}
                  {dayGoals.length > 2 && <div className="text-[10px] sm:text-xs text-gray-500 px-1 sm:px-2">+{dayGoals.length - 2} more</div>}
                  {isCurrentMonth(date) && (
                    <button onClick={() => { setSelectedDate(formatDateForInput(date)); setShowForm(true); }} className="text-[10px] sm:text-xs text-gray-400 hover:text-black transition-colors flex items-center gap-0.5 px-1 sm:px-2 py-0.5">
                      <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3" /><span className="hidden sm:inline">Add</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-black mb-3">Calendar Key</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-50 border border-blue-200 rounded" /><span className="text-gray-600">Today</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 bg-black rounded" /><span className="text-gray-600">Active Goal</span></div>
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-gray-600" /><span className="text-gray-600">Completed</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 border-l-4 border-blue-500 bg-gray-100 rounded" /><span className="text-gray-600">Color = Member</span></div>
        </div>
      </div>
    </div>
  );
}
