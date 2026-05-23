import { Router } from "express";
import { generateWorkflowController, listWorkflowSuggestionsController } from "../controllers/ai.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.get("/suggestions", listWorkflowSuggestionsController);
router.post("/generate-workflow", generateWorkflowController);

export default router;
