# NY Stone Task Manager - Repository Summary

## Project Overview

**NY Stone Marketing Task Manager** is a Next.js 15 web application for marketing teams to manage weekly tasks, projects, team members, notes, and calendar-based goals. It features a responsive UI with Tailwind CSS v4, TypeScript, and a Supabase serverless backend.

## Technology Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI:** React 19, TypeScript 5.7, Tailwind CSS v4
- **Icons:** Lucide React
- **Date Handling:** date-fns
- **Backend:** Supabase (serverless functions, CDN for images/PDFs)
- **Font:** Montserrat (Google Fonts)

---

## Directory Structure

```
NY-Stone-task-manager/
└── marketing-app/               # Main application directory
    ├── package.json             # Dependencies & scripts
    ├── tsconfig.json            # TypeScript configuration
    ├── next.config.ts           # Next.js config (remote images)
    ├── postcss.config.mjs       # PostCSS for Tailwind
    ├── README.md                # Next.js boilerplate readme
    └── src/
        ├── app/                 # Next.js App Router pages
        │   ├── layout.tsx       # Root layout (HTML shell, AppProvider, Header)
        │   ├── globals.css      # Global styles, Tailwind imports, Montserrat font
        │   ├── page.tsx         # Home page — Weekly Tasks
        │   ├── projects/
        │   │   ├── page.tsx     # Projects list page
        │   │   └── [projectId]/
        │   │       └── page.tsx # Individual project detail page
        │   ├── team/
        │   │   ├── page.tsx     # Team settings page
        │   │   └── member/
        │   │       └── [memberId]/
        │   │           └── page.tsx  # Member overview dashboard
        │   ├── notes/
        │   │   └── page.tsx     # Company notes page
        │   └── calendar/
        │       └── page.tsx     # Calendar & goals page
        ├── components/          # Shared React components
        │   ├── AppContext.tsx    # Global state (current user, team members)
        │   ├── Header.tsx       # Navigation bar & user selector
        │   ├── TaskForm.tsx     # Reusable task creation/edit form
        │   ├── TaskItem.tsx     # Weekly task card component
        │   └── ProjectTaskItem.tsx  # Project task card (with images)
        └── lib/
            └── api.ts           # API client, type definitions, all endpoints
```

---

## File-by-File Summary

### Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Defines dependencies (Next.js 15.1.0, React 19, Tailwind v4, Lucide, date-fns), scripts (`dev`, `build`, `start`, `lint`) |
| `tsconfig.json` | TypeScript config — strict mode, ES2017 target, `@/*` path alias to `./src/*` |
| `next.config.ts` | Enables remote image optimization for the Supabase CDN domain |
| `postcss.config.mjs` | Configures PostCSS with `@tailwindcss/postcss` plugin |

### Layout & Styles

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout — sets HTML metadata, wraps app in `AppProvider`, renders `Header` and page content |
| `src/app/globals.css` | Imports Tailwind CSS v4, defines Montserrat as the default font family |

### Pages

#### `src/app/page.tsx` — Weekly Tasks (Home)
- Main dashboard for creating and managing weekly team tasks
- Tasks organized by 5 urgency levels: Urgent, High, Medium, Low, Least Urgent
- Color-coded borders by urgency; tracks who last edited each task
- Supports creating, completing, and deleting tasks

#### `src/app/projects/page.tsx` — Projects List
- Grid view of all marketing projects (responsive 1/2/3 columns)
- Create projects with title, description, and image upload
- Project cards show preview image, metadata, and color-coded editor info
- Delete projects (cascading delete of associated tasks)

#### `src/app/projects/[projectId]/page.tsx` — Project Detail
- Manage an individual project's tasks, images, and PDF documents
- Upload/remove multiple images and PDFs
- Create project-specific tasks with urgency levels and per-task images
- Edit project title and description inline

#### `src/app/team/page.tsx` — Team Settings
- Add/remove team members with unique color assignments
- 12 preset colors (red, orange, yellow, green, teal, cyan, blue, indigo, purple, pink, etc.)
- Color-coded member cards; links to individual member dashboards

#### `src/app/team/member/[memberId]/page.tsx` — Member Overview
- Individual dashboard showing a member's contribution stats
- Displays completion percentages, weekly task counts, project task counts
- Progress bar visualization; lists all tasks grouped by project

#### `src/app/notes/page.tsx` — Company Notes
- Two note types: Regular notes and Link references (with external URL)
- Notes can be linked to specific weekly tasks or projects
- Comment system for team collaboration (expand/collapse)
- Color-coded by creator with timestamps

#### `src/app/calendar/page.tsx` — Team Calendar
- Monthly calendar view with navigation (prev/next month)
- Add goals with title, date, and description; toggle completion
- Shows up to 2 goals per day cell with "+X more" overflow
- Overall team progress bar across all tasks; today highlighted

### Components

| File | Purpose |
|------|---------|
| `AppContext.tsx` | React Context provider managing `currentUser` (persisted to localStorage), `teamMembers` array, `getUserColor()` helper, and `refreshTeamMembers()` |
| `Header.tsx` | Sticky navigation bar — logo, nav links (Tasks, Projects, Team, Notes, Calendar) with icons, mobile hamburger menu, team member dropdown selector with color-coded border |
| `TaskForm.tsx` | Reusable form for creating/editing tasks — title input, description textarea, urgency dropdown, cancel/submit buttons |
| `TaskItem.tsx` | Weekly task card — checkbox, title, description, urgency badge, editor name/color, timestamp, delete button; strikethrough when completed |
| `ProjectTaskItem.tsx` | Extended task card with image management — expandable image gallery, upload button, image grid with remove functionality |

### API Layer

#### `src/lib/api.ts`
- Centralized API client connecting to Supabase serverless functions
- Defines all TypeScript interfaces: `TeamMember`, `WeeklyTask`, `Project`, `ProjectTask`, `Note`, `NoteComment`, `CalendarGoal`
- Provides functions for all CRUD operations:
  - **Team Members:** fetch, create, delete
  - **Weekly Tasks:** fetch, create, update, delete
  - **Projects:** fetch, create, update, delete
  - **Project Tasks:** fetch, create, update, delete
  - **Images/PDFs:** upload via FormData
  - **Notes:** fetch, create, update, delete, add comments
  - **Calendar Goals:** fetch, create, update, delete

---

## Key Design Patterns

1. **Team Member Color Coding:** Every editable resource tracks `createdBy` and `lastEditedBy`, displayed with the member's assigned color throughout the UI
2. **Urgency Grouping:** Tasks are grouped and color-coded by 5 urgency levels (red/orange/yellow/blue/gray borders)
3. **localStorage Persistence:** Current user selection is saved to localStorage so it persists across sessions
4. **Responsive Design:** Mobile-first with breakpoints at 640px and 1024px; hamburger menu on mobile, full nav on desktop
5. **Confirmation Dialogs:** All destructive actions (delete) require user confirmation
6. **Optimistic Loading:** Loading states shown during data fetches with try-catch error handling

---

## Getting Started

```bash
cd marketing-app
npm install
npm run dev        # Start dev server (Turbopack)
npm run build      # Production build
npm start          # Serve production build
npm run lint       # Run ESLint
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
