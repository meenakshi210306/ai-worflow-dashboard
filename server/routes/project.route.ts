import { Router } from "express";
import {
  createProjectController,
  listProjectsController,
  getProjectController,
  updateProjectController,
  deleteProjectController
} from "../controllers/project.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.post("/", createProjectController);
router.get("/", listProjectsController);
router.get("/:projectId", getProjectController);
router.put("/:projectId", updateProjectController);
router.delete("/:projectId", deleteProjectController);

export default router;
