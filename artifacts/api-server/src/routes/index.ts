import { Router, type IRouter } from "express";
import healthRouter from "./health";
import viewsRouter from "./views";
import catalogueAssetsRouter from "./catalogue-assets";

const router: IRouter = Router();

router.use(healthRouter);
router.use(viewsRouter);
router.use(catalogueAssetsRouter);

export default router;
