"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Link2, MessageCircle, FileText, ExternalLink, Send } from "lucide-react";
import { useApp } from "@/components/AppContext";
import { getNotes, createNote, deleteNote, addNoteComment, getWeeklyTasks, getProjects, Note, WeeklyTask, Project } from "@/lib/api";

export default function NotesPage() {
  const { currentUser, teamMembers, getUserColor } = useApp();
  const [notes, setNotes] = useState<Note[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<"regular" | "link">("regular");
  const [link, setLink] = useState("");
  const [linkedTaskId, setLinkedTaskId] = useState("");
  const [linkedProjectId, setLinkedProjectId] = useState("");
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const [notesData, tasksData, projectsData] = await Promise.all([getNotes(), getWeeklyTasks(), getProjects()]);
      setNotes(notesData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setTasks(tasksData);
      setProjects(projectsData);
    } catch (error) { console.error("Failed to load data:", error); }
  }

  async function handleCreateNote(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    try {
      await createNote(title.trim(), content.trim(), noteType, noteType === "link" ? link : undefined, linkedTaskId || undefined, linkedProjectId || undefined, currentUser || undefined);
      await loadData();
      setShowForm(false); setTitle(""); setContent(""); setLink(""); setLinkedTaskId(""); setLinkedProjectId(""); setNoteType("regular");
    } catch (error) { console.error("Failed to create note:", error); alert("Failed to create note."); }
  }

  async function handleDeleteNote(noteId: string) {
    if (!confirm("Delete this note?")) return;
    try { await deleteNote(noteId); await loadData(); } catch (error) { console.error(error); }
  }

  async function handleAddComment(noteId: string) {
    const comment = commentInputs[noteId];
    if (!comment?.trim()) return;
    try { await addNoteComment(noteId, comment.trim(), currentUser || undefined); setCommentInputs({ ...commentInputs, [noteId]: "" }); await loadData(); } catch (error) { console.error(error); }
  }

  const getLinkedTaskName = (taskId: string | null | undefined) => taskId ? tasks.find((t) => t.id === taskId)?.title : null;
  const getLinkedProjectName = (pid: string | null | undefined) => pid ? projects.find((p) => p.id === pid)?.title : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-black">Company Notes</h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Share notes, links, and collaborate with your team</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Note
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-black mb-4">Create New Note</h3>
          <form onSubmit={handleCreateNote} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="Enter note title" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Content *</label><textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black min-h-[100px]" placeholder="Enter note content" required /></div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Note Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={noteType === "regular"} onChange={() => setNoteType("regular")} className="w-4 h-4" /><FileText className="w-4 h-4" /> Regular</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={noteType === "link"} onChange={() => setNoteType("link")} className="w-4 h-4" /><Link2 className="w-4 h-4" /> Link</label>
              </div>
            </div>
            {noteType === "link" && <div><label className="block text-sm font-medium text-gray-700 mb-1">URL</label><input type="url" value={link} onChange={(e) => setLink(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black" placeholder="https://example.com" /></div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Link to Task</label><select value={linkedTaskId} onChange={(e) => setLinkedTaskId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"><option value="">No task linked</option>{tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}</select></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Link to Project</label><select value={linkedProjectId} onChange={(e) => setLinkedProjectId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"><option value="">No project linked</option>{projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}</select></div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button type="submit" className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors">Create Note</button>
              <button type="button" onClick={() => { setShowForm(false); setTitle(""); setContent(""); setLink(""); setLinkedTaskId(""); setLinkedProjectId(""); setNoteType("regular"); }} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-black mb-2">No notes yet</h3>
          <p className="text-gray-600 mb-4">Create your first company note to get started</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const creatorColor = getUserColor(note.createdBy);
            const lastEditorColor = getUserColor(note.lastEditedBy);
            const isExpanded = expandedNotes[note.id];
            const hasComments = note.comments && note.comments.length > 0;
            return (
              <div key={note.id} className="bg-white rounded-lg border-l-4 border-y border-r border-gray-200 overflow-hidden" style={{ borderLeftColor: creatorColor }}>
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {note.type === "link" ? <Link2 className="w-5 h-5 text-gray-600 flex-shrink-0" /> : <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />}
                        <h3 className="text-lg font-bold text-black truncate">{note.title}</h3>
                      </div>
                      <p className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base">{note.content}</p>
                      {note.type === "link" && note.link && <a href={note.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2 break-all"><ExternalLink className="w-4 h-4 flex-shrink-0" />{note.link}</a>}
                      {(note.linkedTaskId || note.linkedProjectId) && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {note.linkedTaskId && <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Task: {getLinkedTaskName(note.linkedTaskId)}</span>}
                          {note.linkedProjectId && <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">Project: {getLinkedProjectName(note.linkedProjectId)}</span>}
                        </div>
                      )}
                    </div>
                    <button onClick={() => handleDeleteNote(note.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all flex-shrink-0"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: creatorColor }} /><span>{teamMembers.find((m) => m.id === note.createdBy)?.name || "Unknown"}</span></div>
                    <span>&bull;</span><span>{new Date(note.createdAt).toLocaleDateString()}</span>
                    {note.lastEditedBy && note.lastEditedBy !== note.createdBy && (<><span className="hidden sm:inline">&bull;</span><div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: lastEditorColor }} /><span>Edited by {teamMembers.find((m) => m.id === note.lastEditedBy)?.name || "Unknown"}</span></div></>)}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <button onClick={() => setExpandedNotes({ ...expandedNotes, [note.id]: !isExpanded })} className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition-colors">
                      <MessageCircle className="w-4 h-4" /> Comments {hasComments && `(${note.comments.length})`}
                    </button>
                    {isExpanded && (
                      <div className="mt-3 space-y-3">
                        {hasComments && <div className="space-y-2 mb-3">{note.comments.map((c) => (<div key={c.id} className="bg-gray-50 rounded-lg p-3"><p className="text-sm text-gray-800">{c.comment}</p><div className="flex items-center gap-2 mt-2 text-xs text-gray-500"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: getUserColor(c.createdBy) }} /><span>{teamMembers.find((m) => m.id === c.createdBy)?.name || "Unknown"}</span><span>&bull;</span><span>{new Date(c.createdAt).toLocaleDateString()}</span></div></div>))}</div>}
                        <div className="flex gap-2">
                          <input type="text" value={commentInputs[note.id] || ""} onChange={(e) => setCommentInputs({ ...commentInputs, [note.id]: e.target.value })} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black" placeholder="Add a comment..." onKeyDown={(e) => { if (e.key === "Enter") handleAddComment(note.id); }} />
                          <button onClick={() => handleAddComment(note.id)} className="px-3 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"><Send className="w-4 h-4" /></button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
