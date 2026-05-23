import { Router } from "express";
import {
  listNotificationsController,
  markAllNotificationsReadController,
  markNotificationReadController
} from "../controllers/notifications.controller";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();

router.use(requireAuth);
router.get("/", listNotificationsController);
router.patch("/read-all", markAllNotificationsReadController);
router.patch("/:id/read", markNotificationReadController);

export default router;
