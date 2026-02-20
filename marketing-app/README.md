# NY Stone Marketing - Task Manager

A responsive Next.js 15 app with Tailwind CSS v4, rebuilt from the original Vite/React Router version.

## Tech Stack

- **Next.js 15** (App Router, Turbopack)
- **React 19**
- **Tailwind CSS v4**
- **TypeScript**
- **Lucide React** for icons
- **date-fns** for date formatting

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with providers + header
│   ├── page.tsx            # Weekly Tasks (home page)
│   ├── globals.css         # Tailwind + Montserrat font
│   ├── projects/
│   │   ├── page.tsx        # Projects listing
│   │   └── [projectId]/
│   │       └── page.tsx    # Project detail + tasks
│   ├── team/
│   │   ├── page.tsx        # Team settings
│   │   └── member/
│   │       └── [memberId]/
│   │           └── page.tsx # Member overview
│   ├── notes/
│   │   └── page.tsx        # Company notes
│   └── calendar/
│       └── page.tsx        # Team calendar
├── components/
│   ├── AppContext.tsx       # Global state (current user, team members)
│   ├── Header.tsx          # Responsive nav with mobile hamburger menu
│   ├── TaskForm.tsx        # Reusable task creation form
│   ├── TaskItem.tsx        # Weekly task card
│   └── ProjectTaskItem.tsx # Project task card with image support
└── lib/
    └── api.ts              # Supabase API client
```

## Features

- **Weekly Tasks**: Create, complete, and delete tasks grouped by urgency
- **Projects**: Create projects with images, PDFs, and sub-tasks
- **Team Settings**: Add team members with color coding
- **Member Overview**: Per-member progress dashboard
- **Company Notes**: Shared notes with comments, links, task/project linking
- **Calendar**: Monthly view with goals and team progress tracking

## Responsive Design

- Mobile-first with hamburger navigation on small screens
- Fluid grid layouts (1→2→3 columns)
- Touch-friendly tap targets
- Adaptive text sizes and spacing
