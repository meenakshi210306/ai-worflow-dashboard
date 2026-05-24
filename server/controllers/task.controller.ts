import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../utils/http-error";
import {
  createTask,
  getUserTasks,
  getProjectTasks,
  updateTask,
  deleteTask,
  getTasksByStatus
} from "../services/task.service";

const createTaskSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.string().datetime().optional()
});

const updateTaskSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  dueDate: z.string().datetime().optional(),
  assigneeId: z.string().optional()
});

export async function createTaskController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const parsedBody = createTaskSchema.parse(req.body);
  const task = await createTask({
    userId,
    projectId: parsedBody.projectId,
    title: parsedBody.title,
    description: parsedBody.description,
    priority: parsedBody.priority,
    status: parsedBody.status,
    dueDate: parsedBody.dueDate ? new Date(parsedBody.dueDate) : undefined
  });

  res.status(201).json({
    success: true,
    message: "Task created successfully",
    data: task
  });
}

export async function getUserTasksController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const tasks = await getUserTasks(userId);

  res.status(200).json({
    success: true,
    data: tasks
  });
}

export async function getTasksByStatusController(req: Request, res: Response) {
  const userId = req.authUser?.userId;
  const { status } = req.params;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  if (!status || !["TODO", "IN_PROGRESS", "DONE"].includes(String(status))) {
    throw new HttpError(400, "Invalid status");
  }

  const tasks = await getTasksByStatus(userId, status as "TODO" | "IN_PROGRESS" | "DONE");

  res.status(200).json({
    success: true,
    data: tasks
  });
}

export async function getProjectTasksController(req: Request, res: Response) {
  const userId = req.authUser?.userId;
  const projectId = String(req.params.projectId);

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const tasks = await getProjectTasks(projectId, userId);

  res.status(200).json({
    success: true,
    data: tasks
  });
}

export async function updateTaskController(req: Request, res: Response) {
  const userId = req.authUser?.userId;
  const taskId = String(req.params.taskId);

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const parsedBody = updateTaskSchema.parse(req.body);
  const task = await updateTask(taskId, userId, {
    ...parsedBody,
    dueDate: parsedBody.dueDate ? new Date(parsedBody.dueDate) : undefined
  });

  res.status(200).json({
    success: true,
    message: "Task updated successfully",
    data: task
  });
}

export async function deleteTaskController(req: Request, res: Response) {
  const userId = req.authUser?.userId;
  const taskId = String(req.params.taskId);

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  await deleteTask(taskId, userId);

  res.status(200).json({
    success: true,
    message: "Task deleted successfully"
  });
}
