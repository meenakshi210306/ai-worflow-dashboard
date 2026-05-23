import { Router } from "express";
import {
  createTaskController,
  getUserTasksController,
  getTasksByStatusController,
  getProjectTasksController,
  updateTaskController,
  deleteTaskController
} from "../controllers/task.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.post("/", createTaskController);
router.get("/", getUserTasksController);
router.get("/by-status/:status", getTasksByStatusController);
router.get("/project/:projectId", getProjectTasksController);
router.put("/:taskId", updateTaskController);
router.delete("/:taskId", deleteTaskController);

export default router;
