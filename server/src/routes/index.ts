import { Router } from "express";
import authRouter from "./auth.js";
import usersRouter from "./users.js";
import postsRouter from "./posts.js";
import categoriesRouter from "./categories.js";
import trendingRouter from "./trending.js";
import notificationsRouter from "./notifications.js";
import requirementsRouter from "./requirements.js";
import messagesRouter from "./messages.js";
import workRouter from "./work.js";
import adminRouter from "./admin.js";

const router = Router();

router.get("/healthz", (_req, res) => res.json({ status: "ok" }));
router.use(authRouter);
router.use(usersRouter);
router.use(postsRouter);
router.use(categoriesRouter);
router.use(trendingRouter);
router.use(notificationsRouter);
router.use(requirementsRouter);
router.use(messagesRouter);
router.use(workRouter);
router.use(adminRouter);

export default router;
