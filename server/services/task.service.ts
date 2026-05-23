import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";

export type CreateTaskInput = {
  userId: string;
  projectId: string;
  title: string;
  description?: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: Date;
};

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, "userId" | "projectId">>;

export async function createTask(input: CreateTaskInput) {
  const task = await prisma.task.create({
    data: {
      title: input.title,
      description: input.description || null,
      priority: input.priority || "MEDIUM",
      dueDate: input.dueDate || null,
      projectId: input.projectId,
      createdById: input.userId,
      assigneeId: null
    },
    include: {
      assignee: true,
      project: true
    }
  });

  return task;
}

export async function createMultipleTasks(
  inputs: Omit<CreateTaskInput, "userId">[],
  userId: string
) {
  const tasks = await Promise.all(
    inputs.map((input) =>
      createTask({
        ...input,
        userId
      })
    )
  );

  return tasks;
}

export async function getUserTasks(userId: string) {
  const tasks = await prisma.task.findMany({
    where: {
      OR: [{ createdById: userId }, { assigneeId: userId }]
    },
    include: {
      assignee: true,
      createdBy: true,
      project: true
    },
    orderBy: { createdAt: "desc" }
  });

  return tasks;
}

export async function getProjectTasks(projectId: string, userId: string) {
  // Verify user owns the project
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project || project.ownerId !== userId) {
    throw new Error("Unauthorized");
  }

  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: true,
      createdBy: true
    },
    orderBy: { createdAt: "desc" }
  });

  return tasks;
}

export async function updateTask(
  taskId: string,
  userId: string,
  data: UpdateTaskInput
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) {
    throw new Error("Task not found");
  }

  // Check if user is authorized
  if (task.project.ownerId !== userId && task.createdById !== userId) {
    throw new Error("Unauthorized");
  }

  return prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      assignee: true,
      createdBy: true,
      project: true
    }
  });
}

export async function deleteTask(taskId: string, userId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) {
    throw new Error("Task not found");
  }

  if (task.project.ownerId !== userId) {
    throw new Error("Unauthorized");
  }

  return prisma.task.delete({
    where: { id: taskId }
  });
}

export async function getTasksByStatus(
  userId: string,
  status: "TODO" | "IN_PROGRESS" | "DONE"
) {
  const tasks = await prisma.task.findMany({
    where: {
      status,
      OR: [{ createdById: userId }, { assigneeId: userId }]
    },
    include: {
      assignee: true,
      createdBy: true,
      project: true
    },
    orderBy: { createdAt: "desc" }
  });

  return tasks;
}
