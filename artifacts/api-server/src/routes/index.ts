import { Router, type IRouter } from "express";
import healthRouter from "./health";
import viewsRouter from "./views";

const router: IRouter = Router();

router.use(healthRouter);
router.use(viewsRouter);

export default router;
