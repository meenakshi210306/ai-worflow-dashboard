import { prisma } from "../config/prisma";

type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

function getDayLabels(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    return date;
  });
}

function toDayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function getDashboardOverview(userId: string) {
  const [projects, tasks, suggestions, notifications, activityLogs] = await Promise.all([
    prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: {
        _count: { select: { tasks: true } },
        tasks: { select: { id: true, status: true } }
      }
    }),
    prisma.task.findMany({
      where: { project: { ownerId: userId } },
      orderBy: { updatedAt: "desc" },
      take: 8,
      include: {
        project: { select: { id: true, name: true } },
        assignee: { select: { id: true, name: true, email: true } }
      }
    }),
    prisma.workflowSuggestion.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.activityLog.findMany({
      where: { OR: [{ userId }, { project: { ownerId: userId } }] },
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        project: { select: { name: true } },
        task: { select: { title: true } }
      }
    })
  ]);

  const totalProjects = projects.length;
  const completedTasks = await prisma.task.count({
    where: { project: { ownerId: userId }, status: "DONE" }
  });
  const openTasks = await prisma.task.count({
    where: { project: { ownerId: userId }, status: { not: "DONE" } }
  });

  const projectSummaries = projects.map((project: any) => {
    const taskCount = project._count.tasks || 0;
    const completedCount = project.tasks.filter((task: any) => task.status === "DONE").length;
    return {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      updatedAt: project.updatedAt,
      progress: taskCount === 0 ? 0 : Math.round((completedCount / taskCount) * 100),
      taskCount,
      completedCount
    };
  });

  const taskSummaries = tasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    status: task.status,
    priority: task.priority,
    projectName: task.project.name,
    assigneeName: task.assignee?.name ?? task.assignee?.email ?? "Unassigned",
    dueDate: task.dueDate?.toISOString() ?? null,
    updatedAt: task.updatedAt.toISOString()
  }));

  const activitySummaries = activityLogs.map((entry: any) => ({
    id: entry.id,
    action: entry.action,
    entityType: entry.entityType,
    entityId: entry.entityId,
    label: entry.task?.title ?? entry.project?.name ?? entry.action,
    createdAt: entry.createdAt.toISOString()
  }));

  const suggestionCreatedByDay = new Map<string, number>();
  const completedByDay = new Map<string, number>();
  const activityByDay = new Map<string, number>();

  const dateRange = getDayLabels(7);
  dateRange.forEach((date) => {
    suggestionCreatedByDay.set(toDayKey(date), 0);
    completedByDay.set(toDayKey(date), 0);
    activityByDay.set(toDayKey(date), 0);
  });

  suggestions.forEach((suggestion: any) => {
    const key = toDayKey(suggestion.createdAt);
    if (suggestionCreatedByDay.has(key)) {
      suggestionCreatedByDay.set(key, (suggestionCreatedByDay.get(key) ?? 0) + 1);
    }
  });

  tasks
    .filter((task: any) => task.status === "DONE")
    .forEach((task: any) => {
      const key = toDayKey(task.updatedAt);
      if (completedByDay.has(key)) {
        completedByDay.set(key, (completedByDay.get(key) ?? 0) + 1);
      }
    });

  activityLogs.forEach((entry: any) => {
    const key = toDayKey(entry.createdAt);
    if (activityByDay.has(key)) {
      activityByDay.set(key, (activityByDay.get(key) ?? 0) + 1);
    }
  });

  const trends = dateRange.map((date) => {
    const key = toDayKey(date);
    return {
      label: formatShortDate(date),
      workflows: suggestionCreatedByDay.get(key) ?? 0,
      completedTasks: completedByDay.get(key) ?? 0,
      activities: activityByDay.get(key) ?? 0
    };
  });

  return {
    stats: { totalProjects, completedTasks, openTasks, aiSuggestions: suggestions.length, unreadNotifications: notifications },
    projects: projectSummaries,
    tasks: taskSummaries,
    recentSuggestions: suggestions.map((suggestion: any) => ({
      id: suggestion.id,
      prompt: suggestion.prompt,
      result: suggestion.result,
      createdAt: suggestion.createdAt.toISOString()
    })),
    activity: activitySummaries,
    trends
  };
}