import { Request, Response } from "express";
import { searchProjects, searchTasks, searchWorkflows } from "../services/search.service";

export async function searchAllController(req: Request, res: Response) {
  try {
    const userId = req.authUser?.userId as string;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.json({
        success: true,
        data: {
          projects: [],
          tasks: [],
          workflows: []
        }
      });
    }

    const [projects, tasks, workflows] = await Promise.all([
      searchProjects(userId, query),
      searchTasks(userId, query),
      searchWorkflows(userId, query)
    ]);

    return res.json({
      success: true,
      data: {
        projects,
        tasks,
        workflows
      }
    });
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Search failed"
    });
  }
}
