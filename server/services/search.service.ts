import { prisma } from "../config/prisma";

export async function searchProjects(userId: string, query: string) {
  const lowerQuery = query.toLowerCase();

  const projects = await prisma.project.findMany({
    where: {
      ownerId: userId,
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } }
      ]
    },
    include: {
      _count: {
        select: { tasks: true }
      }
    },
    take: 10
  });

  return projects;
}

export async function searchTasks(userId: string, query: string) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ createdById: userId }, { assigneeId: userId }],
      AND: [
        {
          OR: [
            { title: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } }
          ]
        }
      ]
    },
    include: {
      project: true,
      assignee: true,
      createdBy: true
    },
    take: 10,
    orderBy: { createdAt: "desc" }
  });

  return tasks;
}

export async function searchWorkflows(userId: string, query: string) {
  const workflows = await prisma.workflowSuggestion.findMany({
    where: {
      userId,
      OR: [
        { prompt: { contains: query, mode: "insensitive" } }
      ]
    },
    take: 10,
    orderBy: { createdAt: "desc" }
  });

  return workflows;
}
