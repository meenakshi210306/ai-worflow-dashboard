import { Router } from "express";
import { getDashboardOverviewController } from "../controllers/dashboard.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.get("/overview", getDashboardOverviewController);

export default router;
