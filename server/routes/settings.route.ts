import { Router } from "express";
import { changePasswordController, updateProfileController } from "../controllers/settings.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.patch("/profile", updateProfileController);
router.patch("/password", changePasswordController);

export default router;
