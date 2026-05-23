import type { Request, Response } from "express";
import { z } from "zod";
import { HttpError } from "../utils/http-error";
import { createWorkflowSuggestion, listWorkflowSuggestions } from "../services/ai.service";

const generateWorkflowSchema = z.object({
  prompt: z.string().trim().min(10).max(1000),
  projectId: z.string().optional()
});

export async function generateWorkflowController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const parsedBody = generateWorkflowSchema.parse(req.body);
  const data = await createWorkflowSuggestion({
    userId,
    prompt: parsedBody.prompt,
    projectId: parsedBody.projectId
  });

  res.status(201).json({
    success: true,
    message: "Workflow generated successfully",
    data
  });
}

export async function listWorkflowSuggestionsController(req: Request, res: Response) {
  const userId = req.authUser?.userId;

  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }

  const data = await listWorkflowSuggestions(userId);

  res.status(200).json({
    success: true,
    data
  });
}
