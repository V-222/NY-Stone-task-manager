const PROJECT_ID = "xowephnjpfixseglbsxc";
const PUBLIC_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvd2VwaG5qcGZpeHNlZ2xic3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEyNzgzNDQsImV4cCI6MjA4Njg1NDM0NH0.0j7bS0r4n9ezdUDUMOGWGKbWWbrJm42SC7kkyCB3tXg";

const BASE_URL = `https://${PROJECT_ID}.supabase.co/functions/v1/make-server-6a27fa5b`;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PUBLIC_ANON_KEY}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    console.error(`API Error for ${endpoint}:`, error);
    throw new Error(error.error || "Request failed");
  }

  return response.json();
}

// ── Types ────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
  createdAt: string;
}

export interface WeeklyTask {
  id: string;
  title: string;
  description: string;
  urgency: "Urgent" | "High" | "Medium" | "Low" | "Least Urgent";
  completed: boolean;
  createdBy?: string;
  createdAt: string;
  lastEditedBy?: string;
  lastEditedAt: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  pdfs: Array<{ fileName: string; url: string }>;
  createdBy?: string;
  createdAt: string;
  lastEditedBy?: string;
  lastEditedAt: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string;
  urgency: "Urgent" | "High" | "Medium" | "Low" | "Least Urgent";
  completed: boolean;
  images: string[];
  createdBy?: string;
  createdAt: string;
  lastEditedBy?: string;
  lastEditedAt: string;
}

export interface NoteComment {
  id: string;
  comment: string;
  createdBy?: string;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  type: "regular" | "link";
  link?: string | null;
  linkedTaskId?: string | null;
  linkedProjectId?: string | null;
  comments: NoteComment[];
  createdBy?: string;
  createdAt: string;
  lastEditedBy?: string;
  lastEditedAt: string;
}

export interface CalendarGoal {
  id: string;
  title: string;
  date: string;
  description: string;
  completed: boolean;
  createdBy?: string;
  createdAt: string;
  lastEditedBy?: string;
  lastEditedAt: string;
}

// ── Team Members ─────────────────────────────────────────────────────────

export async function getTeamMembers(): Promise<TeamMember[]> {
  const data = await fetchAPI("/team-members");
  return data.members;
}

export async function createTeamMember(
  name: string,
  color: string
): Promise<TeamMember> {
  const data = await fetchAPI("/team-members", {
    method: "POST",
    body: JSON.stringify({ name, color }),
  });
  return data.member;
}

export async function deleteTeamMember(id: string): Promise<void> {
  await fetchAPI(`/team-members/${id}`, { method: "DELETE" });
}

// ── Weekly Tasks ─────────────────────────────────────────────────────────

export async function getWeeklyTasks(): Promise<WeeklyTask[]> {
  const data = await fetchAPI("/weekly-tasks");
  return data.tasks;
}

export async function createWeeklyTask(
  title: string,
  description: string,
  urgency: string,
  createdBy?: string
): Promise<WeeklyTask> {
  const data = await fetchAPI("/weekly-tasks", {
    method: "POST",
    body: JSON.stringify({ title, description, urgency, createdBy }),
  });
  return data.task;
}

export async function updateWeeklyTask(
  id: string,
  updates: Partial<WeeklyTask>
): Promise<WeeklyTask> {
  const data = await fetchAPI(`/weekly-tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return data.task;
}

export async function deleteWeeklyTask(id: string): Promise<void> {
  await fetchAPI(`/weekly-tasks/${id}`, { method: "DELETE" });
}

// ── Projects ─────────────────────────────────────────────────────────────

export async function getProjects(): Promise<Project[]> {
  const data = await fetchAPI("/projects");
  return data.projects;
}

export async function createProject(
  title: string,
  description: string,
  createdBy?: string
): Promise<Project> {
  const data = await fetchAPI("/projects", {
    method: "POST",
    body: JSON.stringify({ title, description, createdBy }),
  });
  return data.project;
}

export async function updateProject(
  id: string,
  updates: Partial<Project>
): Promise<Project> {
  const data = await fetchAPI(`/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return data.project;
}

export async function deleteProject(id: string): Promise<void> {
  await fetchAPI(`/projects/${id}`, { method: "DELETE" });
}

// ── Project Tasks ────────────────────────────────────────────────────────

export async function getProjectTasks(
  projectId: string
): Promise<ProjectTask[]> {
  const data = await fetchAPI(`/projects/${projectId}/tasks`);
  return data.tasks;
}

export async function createProjectTask(
  projectId: string,
  title: string,
  description: string,
  urgency: string,
  createdBy?: string
): Promise<ProjectTask> {
  const data = await fetchAPI(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify({ title, description, urgency, createdBy }),
  });
  return data.task;
}

export async function updateProjectTask(
  projectId: string,
  taskId: string,
  updates: Partial<ProjectTask>
): Promise<ProjectTask> {
  const data = await fetchAPI(`/projects/${projectId}/tasks/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return data.task;
}

export async function deleteProjectTask(
  projectId: string,
  taskId: string
): Promise<void> {
  await fetchAPI(`/projects/${projectId}/tasks/${taskId}`, {
    method: "DELETE",
  });
}

// ── Image Upload ─────────────────────────────────────────────────────────

export async function uploadImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload-image`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PUBLIC_ANON_KEY}` },
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || "Upload failed");
  }

  const data = await response.json();
  return data.url;
}

// ── PDF Upload ───────────────────────────────────────────────────────────

export async function uploadPDF(
  file: File
): Promise<{ fileName: string; url: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/upload-pdf`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PUBLIC_ANON_KEY}` },
    body: formData,
  });

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Upload failed" }));
    throw new Error(error.error || "Upload failed");
  }

  const data = await response.json();
  return { fileName: data.fileName, url: data.url };
}

// ── Notes ────────────────────────────────────────────────────────────────

export async function getNotes(): Promise<Note[]> {
  const data = await fetchAPI("/notes");
  return data.notes;
}

export async function createNote(
  title: string,
  content: string,
  type: "regular" | "link",
  link?: string,
  linkedTaskId?: string,
  linkedProjectId?: string,
  createdBy?: string
): Promise<Note> {
  const data = await fetchAPI("/notes", {
    method: "POST",
    body: JSON.stringify({
      title,
      content,
      type,
      link,
      linkedTaskId,
      linkedProjectId,
      createdBy,
    }),
  });
  return data.note;
}

export async function updateNote(
  id: string,
  updates: Partial<Note>
): Promise<Note> {
  const data = await fetchAPI(`/notes/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return data.note;
}

export async function deleteNote(id: string): Promise<void> {
  await fetchAPI(`/notes/${id}`, { method: "DELETE" });
}

export async function addNoteComment(
  noteId: string,
  comment: string,
  createdBy?: string
): Promise<Note> {
  const data = await fetchAPI(`/notes/${noteId}/comments`, {
    method: "POST",
    body: JSON.stringify({ comment, createdBy }),
  });
  return data.note;
}

// ── Calendar Goals ───────────────────────────────────────────────────────

export async function getCalendarGoals(): Promise<CalendarGoal[]> {
  const data = await fetchAPI("/calendar-goals");
  return data.goals;
}

export async function createCalendarGoal(
  title: string,
  date: string,
  description: string,
  createdBy?: string
): Promise<CalendarGoal> {
  const data = await fetchAPI("/calendar-goals", {
    method: "POST",
    body: JSON.stringify({ title, date, description, createdBy }),
  });
  return data.goal;
}

export async function updateCalendarGoal(
  id: string,
  updates: Partial<CalendarGoal>
): Promise<CalendarGoal> {
  const data = await fetchAPI(`/calendar-goals/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
  return data.goal;
}

export async function deleteCalendarGoal(id: string): Promise<void> {
  await fetchAPI(`/calendar-goals/${id}`, { method: "DELETE" });
}
