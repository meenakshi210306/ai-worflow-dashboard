# AI Workflow Dashboard

A production-ready, full-stack AI Workflow Automation Dashboard built with **Next.js 15**, **Express**, **TypeScript**, **Prisma**, **PostgreSQL**, **JWT authentication**, and optional **OpenAI** integration.

---
## 🚀 Live Demo

**[https://ai-worflow-dashboard-client-qvpi-skzn3c806.vercel.app/login](https://ai-worflow-dashboard-client-qvpi-skzn3c806.vercel.app/login)**


## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Folder Structure](#folder-structure)
- [Database Schema](#database-schema)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Key Modules](#key-modules)
  - [Authentication](#authentication)
  - [Projects](#projects)
  - [Tasks](#tasks)
  - [AI Workflow Generator](#ai-workflow-generator)
  - [Search](#search)
  - [Notifications](#notifications)
  - [Settings](#settings)
- [Common Issues & Fixes](#common-issues--fixes)
- [Git Workflow](#git-workflow)

---

## Overview

The AI Workflow Dashboard is a collaborative project management tool that helps teams plan, track, and execute work — enhanced with AI-powered workflow generation. Users can create projects, manage tasks in a Kanban-style board, and use an AI prompt to automatically generate a full execution plan with tasks assigned to a project.

---

## Features

- ✅ **User Authentication** — Register, login, logout with JWT access tokens and HTTP-only refresh token cookies
- ✅ **Auth UX** — Register flow redirects to login (no automatic dashboard login), then users sign in explicitly
- ✅ **Project Management** — Create and manage multiple projects; click on any project to view its specific task board
- ✅ **Task Board (Kanban)** — View tasks grouped by status: To Do, In Progress, Done — scoped per project
- ✅ **Task Controls** — Move tasks between statuses, edit generated tasks, delete unwanted tasks, and add tasks manually
- ✅ **AI Workflow Generator** — Generate a complete execution plan (tasks, priorities, owners, ETAs) from a natural language prompt; tasks are automatically assigned to the active project
- ✅ **Global Search** — Search across projects, tasks, and workflows
- ✅ **Notifications** — In-app alerts drawer, received/read visibility, and popup toast on newly received notifications
- ✅ **User Settings** — Update profile details (name, email)
- ✅ **Dark/Light Theme** — Theme toggle with persistent preference
- ✅ **Hydration-safe** — `suppressHydrationWarning` on root layout for compatibility with browser extensions
- ✅ **CORS-safe** — Backend CORS dynamically configured via environment variable

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL 16 (Docker) |
| ORM | Prisma 6 |
| Authentication | JWT (access token) + HTTP-only Refresh Token Cookie + bcryptjs |
| AI | OpenAI API (gpt-4.1-mini) with a structured fallback if no key is set |
| State Management | Zustand |
| Form Handling | React Hook Form + Zod |
| Animations | Framer Motion |
| Package Manager | npm workspaces (monorepo) |
| Container | Docker Compose (PostgreSQL only) |

---

## Architecture

The codebase is a **monorepo** with two independently deployable applications:

```
client/   →   Next.js 15 frontend  (runs on :3000)
server/   →   Express API backend  (runs on :3001)
```

The frontend communicates with the backend exclusively via REST API calls. Auth tokens are stored in `localStorage` (access token) and an HTTP-only cookie (refresh token). All protected API routes require a valid `Authorization: Bearer <token>` header.

---

## Folder Structure

```text
ai-workflow-dashboard/
├── client/
│   ├── app/
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Dashboard overview
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx          # All projects list
│   │   │   │   └── [projectId]/
│   │   │   │       └── page.tsx      # Individual project task board
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx          # All tasks (global view)
│   │   │   ├── ai-suggestions/
│   │   │   │   └── page.tsx          # AI workflow suggestions history
│   │   │   ├── notifications/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── layout.tsx                # Root layout (suppressHydrationWarning)
│   │   └── globals.css
│   ├── components/
│   │   ├── modals/
│   │   │   ├── create-project-modal.tsx
│   │   │   ├── workflow-generator-modal.tsx   # AI generator with project context
│   │   │   ├── notifications-drawer.tsx
│   │   │   └── task-editor-modal.tsx          # Create/edit task modal
│   │   ├── theme-provider.tsx
│   │   └── toast-stack.tsx
│   ├── hooks/
│   │   ├── use-projects.ts
│   │   ├── use-project-tasks.ts      # Fetch tasks scoped to one project
│   │   ├── use-tasks-by-status.ts    # Global tasks view
│   │   ├── use-dashboard-overview.ts
│   │   ├── use-notifications.ts
│   │   └── use-workflow-suggestions.ts
│   ├── lib/
│   │   └── api.ts                    # Axios instance with auth interceptors
│   ├── services/
│   │   └── api/
│   │       ├── ai.ts
│   │       ├── projects.ts
│   │       └── tasks.ts
│   ├── store/
│   │   ├── auth-store.ts
│   │   └── toast-store.ts
│   └── types/
│       └── dashboard.ts
│
├── server/
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── project.controller.ts
│   │   ├── task.controller.ts
│   │   ├── ai.controller.ts          # Accepts optional projectId in body
│   │   ├── search.controller.ts      # Fixed: uses req.authUser?.userId
│   │   ├── dashboard.controller.ts
│   │   ├── notifications.controller.ts
│   │   └── settings.controller.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── project.service.ts
│   │   ├── task.service.ts
│   │   ├── ai.service.ts             # Smart project resolution (no auto Default Project)
│   │   └── search.service.ts
│   ├── routes/
│   │   ├── auth.route.ts
│   │   ├── project.route.ts
│   │   ├── task.route.ts
│   │   ├── ai.route.ts
│   │   ├── search.route.ts
│   │   ├── dashboard.route.ts
│   │   ├── notifications.route.ts
│   │   ├── settings.route.ts
│   │   └── health.route.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   └── error.middleware.ts
│   ├── config/
│   │   ├── env.ts                    # Zod-validated environment schema
│   │   └── prisma.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   ├── http-error.ts
│   │   └── cookies.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── app.ts                        # Express app setup with CORS
│   └── index.ts                      # Server entry point
│
├── docker-compose.yml                # PostgreSQL container on port 5433
├── package.json                      # npm workspaces root
└── README.md
```

---

## Database Schema

Core Prisma models:

| Model | Purpose |
|---|---|
| `User` | Auth, ownership, profile |
| `Project` | Workspace grouping for tasks |
| `Task` | Work items with status, priority, assignee |
| `WorkflowSuggestion` | AI-generated plan records (linked to a project) |
| `RefreshToken` | Persistent login support |
| `Notification` | In-app alerts |
| `ActivityLog` | Audit trail |

Core enums: `Role`, `ProjectStatus`, `TaskStatus` (`TODO`, `IN_PROGRESS`, `DONE`), `TaskPriority` (`LOW`, `MEDIUM`, `HIGH`, `URGENT`)

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- Docker Desktop (for PostgreSQL)
- npm ≥ 9

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ai-workflow-dashboard

# Install all workspace dependencies
npm install
```

### Environment Variables

**Server** — Copy and fill in `server/.env`:

```bash
cp server/.env.example server/.env
```

| Variable | Description | Example |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://postgres:postgres@127.0.0.1:5433/ai_dashboard` |
| `JWT_SECRET` | Secret for access tokens (≥16 chars) | `supersecretjwtkey` |
| `JWT_EXPIRES_IN` | Access token lifetime | `7d` |
| `REFRESH_TOKEN_SECRET` | Secret for refresh tokens (≥16 chars) | `supersecretrefreshkey` |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime | `30d` |
| `REFRESH_TOKEN_COOKIE_NAME` | Cookie name | `ai_workflow_refresh_token` |
| `PORT` | Server port | `4000` |
| `CORS_ORIGIN` | Comma-separated allowed origins | `http://localhost:3000,http://localhost:3002` |
| `OPENAI_API_KEY` | *(Optional)* OpenAI key for real AI responses | `sk-...` |
| `OPENAI_MODEL` | OpenAI model to use | `gpt-4.1-mini` |

> **Note:** If `OPENAI_API_KEY` is not set, the AI Workflow Generator uses a built-in fallback that generates a realistic plan locally without any API calls.

**Client** — Create `client/.env.local`:

```bash
echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > client/.env.local
```

> **Important:** If Next.js starts on a port other than 3000 (e.g., 3002 because 3000 is in use), add that port to `CORS_ORIGIN` in `server/.env` and restart both servers.

### Database Setup

Start PostgreSQL via Docker:

```bash
docker compose up -d
```

Apply the Prisma schema to the database:

```bash
npm run prisma:migrate --workspace server
# or to push without migration history:
npx prisma db push --prefix server
```

### Running the App

```bash
# Run both client and server concurrently
npm run dev

# Or run separately
npm run dev:client
npm run dev:server
```

| Service | Default URL |
|---|---|
| Frontend (Next.js) | http://localhost:3000 |
| Backend (Express) | http://localhost:3001 |
| PostgreSQL | localhost:5433 |

---

## Key Modules

### Authentication

- **Register:** `POST /api/auth/register` — creates a user, returns JWT + sets refresh cookie
- **Login:** `POST /api/auth/login` — verifies credentials, returns JWT + sets refresh cookie
- **Refresh:** `POST /api/auth/refresh` — issues a new access token from the HTTP-only cookie
- **Logout:** `POST /api/auth/logout` — revokes the refresh token and clears the cookie
- **Me:** `GET /api/auth/me` — returns the authenticated user's profile

Passwords are hashed with `bcryptjs`. Access tokens expire in 7 days by default. Refresh tokens are stored hashed in the database and rotated on each use.

**Frontend behavior:** After successful registration, users are redirected to `/login` and shown a success message to sign in.

### Projects

- **List:** `GET /api/projects` — returns all projects owned by the authenticated user
- **Create:** `POST /api/projects` — creates a new project for the user
- **Get:** `GET /api/projects/:projectId` — returns a single project
- **Update:** `PUT /api/projects/:projectId` — update name, description, or status
- **Delete:** `DELETE /api/projects/:projectId`

**Frontend behaviour:** Clicking on a project card navigates to `/dashboard/projects/:projectId`, which shows a Kanban board with tasks scoped to that specific project only.

### Tasks

- **All tasks:** `GET /api/tasks` — all tasks for the user's projects
- **By status:** `GET /api/tasks/by-status/:status` — filtered by `TODO`, `IN_PROGRESS`, or `DONE`
- **By project:** `GET /api/tasks/project/:projectId` — all tasks for a specific project (used by the project detail page)
- **Create:** `POST /api/tasks` — requires `projectId`, `title`; optional `description`, `priority`, `status`, `dueDate`
- **Update:** `PUT /api/tasks/:taskId` — update any field including status
- **Delete:** `DELETE /api/tasks/:taskId`

**Frontend behavior:** Both project and global task views support moving tasks by status, editing/deleting existing tasks, and creating tasks manually via modal.

### AI Workflow Generator

- **Generate:** `POST /api/ai/generate-workflow`
  - Body: `{ prompt: string, projectId?: string }`
  - When `projectId` is provided, tasks are created under that specific project
  - When omitted, tasks fall back to the user's most recently created project
  - Only creates a new "My Project" if the user has no projects at all — **no automatic "Default Project" is ever created**
- **List suggestions:** `GET /api/ai/suggestions` — last 10 generated workflows

The generator creates:
1. A `WorkflowSuggestion` record with the full plan stored as JSON
2. Individual `Task` rows linked to the correct project
3. An `ActivityLog` entry
4. A `Notification` for the user

The workflow modal automatically reads the current project from the URL (if you're inside `/dashboard/projects/:projectId`) and passes it to the API, so generated tasks always land in the right project.

### Search

- **Search:** `GET /api/search?q=<query>` — searches projects, tasks, and workflow suggestions for the authenticated user
- Returns: `{ projects: [...], tasks: [...], workflows: [...] }`

### Notifications

- **List:** `GET /api/notifications` — all notifications for the user
- **Mark read:** `PATCH /api/notifications/:id/read`
- **Mark all read:** `PATCH /api/notifications/read-all`

**Frontend behavior:** Alerts show received/unread/read counts and trigger popup toasts for newly received notifications.

### Settings

- **Get profile:** `GET /api/settings/profile`
- **Update profile:** `PATCH /api/settings/profile` — update name and/or email

---

## Common Issues & Fixes

| Issue | Fix |
|---|---|
| Network error on login/register | Ensure `CORS_ORIGIN` in `server/.env` includes the port Next.js is running on (e.g., `:3002` if `:3000` was taken). Also ensure `client/.env.local` contains `NEXT_PUBLIC_API_URL=http://localhost:3001`. |
| Hydration mismatch warning | The root `<html>` and `<body>` tags use `suppressHydrationWarning={true}` to handle browser extensions that modify the DOM before React hydrates. |
| Tasks going to wrong project | The AI generator modal reads the current URL's `projectId` param. Always open the generator from inside a project's detail page (`/dashboard/projects/:id`) to target that project. |
| "Default Project" appearing | Fixed: the backend no longer auto-creates a "Default Project". It uses the user's most recently created project as the target when no `projectId` is specified. |
| Port 3000 in use | Next.js will use the next available port (e.g., 3002). Add it to `CORS_ORIGIN` in `server/.env` and restart the server. |
| Prisma generate error (EPERM) | Stop the dev server before running `prisma generate` or `prisma db push` to avoid file lock conflicts on Windows. |
| Search returns 401 | Fixed: the search controller now correctly reads the user ID from `req.authUser?.userId` (not `req.userId`). |

---

## Git Workflow

Recommended branch strategy:

```
main         →  stable, production-ready releases
develop      →  integration branch for features
feature/*    →  individual feature branches (e.g., feature/project-detail-view)
fix/*        →  bug fix branches
```

Commit messages follow conventional commits:
- `feat:` for new features
- `fix:` for bug fixes
- `chore:` for tooling/config changes
- `refactor:` for code refactoring without behaviour changes
