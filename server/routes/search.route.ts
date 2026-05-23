import { Router } from "express";
import { searchAllController } from "../controllers/search.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);

router.get("/", searchAllController);

export default router;
