import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../utils/http-error";
import {
  createProject,
  listUserProjects,
  getProjectById,
  updateProject,
  deleteProject
} from "../services/project.service";

const createProjectSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional()
});

const updateProjectSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  status: z.enum(["ACTIVE", "ARCHIVED"]).optional()
});

export async function createProjectController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const parsedBody = createProjectSchema.parse(req.body);
  const project = await createProject({
    userId,
    name: parsedBody.name,
    description: parsedBody.description
  });

  res.status(201).json({
    success: true,
    message: "Project created successfully",
    data: project
  });
}

export async function listProjectsController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const projects = await listUserProjects(userId);

  res.status(200).json({
    success: true,
    data: projects
  });
}

export async function getProjectController(req: Request, res: Response) {
  const userId = req.authUser?.userId;
  const projectId = String(req.params.projectId);

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const project = await getProjectById(projectId, userId);

  res.status(200).json({
    success: true,
    data: project
  });
}

export async function updateProjectController(req: Request, res: Response) {
  const userId = req.authUser?.userId;
  const projectId = String(req.params.projectId);

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const parsedBody = updateProjectSchema.parse(req.body);
  const project = await updateProject(projectId, userId, parsedBody);

  res.status(200).json({
    success: true,
    message: "Project updated successfully",
    data: project
  });
}

export async function deleteProjectController(req: Request, res: Response) {
  const userId = req.authUser?.userId;
  const projectId = String(req.params.projectId);

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  await deleteProject(projectId, userId);

  res.status(200).json({
    success: true,
    message: "Project deleted successfully"
  });
}
