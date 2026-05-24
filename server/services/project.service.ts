import { prisma } from "../config/prisma";
import { $Enums } from "@prisma/client";

const ProjectStatus = $Enums.ProjectStatus;
type ProjectStatus = $Enums.ProjectStatus;

export type CreateProjectInput = {
  userId: string;
  name: string;
  description?: string;
};

export async function createProject(input: CreateProjectInput) {
  const project = await prisma.project.create({
    data: {
      name: input.name,
      description: input.description || null,
      ownerId: input.userId,
      status: ProjectStatus.ACTIVE
    }
  });

  return project;
}

export async function listUserProjects(userId: string) {
  const projects = await prisma.project.findMany({
    where: { ownerId: userId },
    include: {
      tasks: true,
      _count: {
        select: { tasks: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return projects;
}

export async function getProjectById(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      tasks: {
        include: {
          assignee: true
        }
      },
      owner: true
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId) {
    throw new Error("Unauthorized");
  }

  return project;
}

export async function updateProject(
  projectId: string,
  userId: string,
  data: { name?: string; description?: string; status?: ProjectStatus }
) {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId) {
    throw new Error("Unauthorized");
  }

  return prisma.project.update({
    where: { id: projectId },
    data
  });
}

export async function deleteProject(projectId: string, userId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (project.ownerId !== userId) {
    throw new Error("Unauthorized");
  }

  return prisma.project.delete({
    where: { id: projectId }
  });
}