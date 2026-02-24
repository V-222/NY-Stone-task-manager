"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useApp } from "@/components/AppContext";
import {
  getWeeklyTasks,
  getProjects,
  getProjectTasks,
  WeeklyTask,
  Project,
  ProjectTask,
} from "@/lib/api";
import { ArrowLeft, CheckCircle2, Circle, Calendar, FolderKanban } from "lucide-react";
import Spinner from "@/components/Spinner";

export default function MemberOverviewPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = use(params);
  const { teamMembers, getUserColor } = useApp();
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [allProjectTasks, setAllProjectTasks] = useState<Record<string, ProjectTask[]>>({});
  const [loading, setLoading] = useState(true);

  const member = teamMembers.find((m) => m.id === memberId);
  const memberColor = getUserColor(memberId);

  useEffect(() => {
    loadMemberData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memberId]);

  async function loadMemberData() {
    if (!memberId) return;
    setLoading(true);
    try {
      const tasks = await getWeeklyTasks();
      const memberTasks = tasks.filter(
        (t) => t.createdBy === memberId || t.lastEditedBy === memberId
      );
      setWeeklyTasks(memberTasks);

      const allProjects = await getProjects();
      const memberProjects = allProjects.filter(
        (p) => p.createdBy === memberId || p.lastEditedBy === memberId
      );

      const projectTasksMap: Record<string, ProjectTask[]> = {};
      for (const project of allProjects) {
        const ptasks = await getProjectTasks(project.id);
        const memberPT = ptasks.filter(
          (t) => t.createdBy === memberId || t.lastEditedBy === memberId
        );
        if (memberPT.length > 0) {
          projectTasksMap[project.id] = memberPT;
          if (!memberProjects.find((p) => p.id === project.id)) {
            memberProjects.push(project);
          }
        }
      }
      setAllProjectTasks(projectTasksMap);
      setProjects(memberProjects);
    } catch (error) {
      console.error("Failed to load member data:", error);
    } finally {
      setLoading(false);
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "Urgent": return "bg-black text-white";
      case "High": return "bg-gray-800 text-white";
      case "Medium": return "bg-gray-500 text-white";
      case "Low": return "bg-gray-300 text-black";
      case "Least Urgent": return "bg-gray-100 text-black border border-gray-300";
      default: return "bg-gray-200 text-black";
    }
  };

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Member not found</p>
        <Link href="/team" className="text-black underline mt-4 inline-block">
          Back to Team
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  const completedWeekly = weeklyTasks.filter((t) => t.completed).length;
  let completedProject = 0;
  let totalProject = 0;
  Object.values(allProjectTasks).forEach((tasks) => {
    totalProject += tasks.length;
    completedProject += tasks.filter((t) => t.completed).length;
  });

  const totalTasks = weeklyTasks.length + totalProject;
  const completedTasks = completedWeekly + completedProject;
  const progressPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/team"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-black mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Team
        </Link>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-12 sm:w-16 h-12 sm:h-16 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold"
            style={{ backgroundColor: memberColor }}
          >
            {member.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-black">
              {member.name}
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Individual Overview</p>
          </div>
        </div>

        {/* Progress Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Total Progress</div>
            <div className="text-2xl sm:text-3xl font-bold text-black">
              {progressPercentage}%
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedTasks} of {totalTasks} tasks
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Weekly Tasks</div>
            <div className="text-2xl sm:text-3xl font-bold text-black">
              {weeklyTasks.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedWeekly} completed
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Project Tasks</div>
            <div className="text-2xl sm:text-3xl font-bold text-black">{totalProject}</div>
            <div className="text-xs text-gray-500 mt-1">
              {completedProject} completed
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600 mb-1">Projects</div>
            <div className="text-2xl sm:text-3xl font-bold text-black">
              {projects.length}
            </div>
            <div className="text-xs text-gray-500 mt-1">Contributing to</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-bold text-black">
              {progressPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-black h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Weekly Tasks Section */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-5 h-5" />
          <h2 className="text-xl sm:text-2xl font-bold text-black">Weekly Tasks</h2>
          <span className="text-sm text-gray-500">({weeklyTasks.length})</span>
        </div>
        {weeklyTasks.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No weekly tasks for this member
          </div>
        ) : (
          <div className="space-y-3">
            {weeklyTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start gap-3">
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-black mt-0.5 flex-shrink-0" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`text-base font-medium ${
                        task.completed
                          ? "line-through text-gray-500"
                          : "text-black"
                      }`}
                    >
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {task.description}
                      </p>
                    )}
                  </div>
                  <span
                    className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getUrgencyColor(
                      task.urgency
                    )}`}
                  >
                    {task.urgency}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Projects Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <FolderKanban className="w-5 h-5" />
          <h2 className="text-xl sm:text-2xl font-bold text-black">
            Projects &amp; Tasks
          </h2>
          <span className="text-sm text-gray-500">({projects.length})</span>
        </div>
        {projects.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center text-gray-500">
            No projects for this member
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => {
              const projectTasks = allProjectTasks[project.id] || [];
              const completedCount = projectTasks.filter((t) => t.completed).length;
              const projectProgress =
                projectTasks.length > 0
                  ? Math.round((completedCount / projectTasks.length) * 100)
                  : 0;

              return (
                <div
                  key={project.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-lg font-bold text-black hover:underline"
                      >
                        {project.title}
                      </Link>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-gray-600">
                          {completedCount}/{projectTasks.length} tasks
                        </span>
                        <span className="font-bold text-black">
                          {projectProgress}%
                        </span>
                      </div>
                    </div>
                    {project.description && (
                      <p className="text-sm text-gray-600">
                        {project.description}
                      </p>
                    )}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                      <div
                        className="bg-black h-2 rounded-full transition-all duration-300"
                        style={{ width: `${projectProgress}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-4">
                    {projectTasks.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        No tasks for this member in this project
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {projectTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            {task.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <h4
                                className={`text-sm font-medium ${
                                  task.completed
                                    ? "line-through text-gray-500"
                                    : "text-black"
                                }`}
                              >
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {task.description}
                                </p>
                              )}
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getUrgencyColor(
                                task.urgency
                              )}`}
                            >
                              {task.urgency}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
