import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import clinicsRouter from "./clinics";
import doctorsRouter from "./doctors";
import appointmentsRouter from "./appointments";
import tokensRouter from "./tokens";
import subscriptionsRouter from "./subscriptions";
import paymentsRouter from "./payments";
import invoicesRouter from "./invoices";
import adminRouter from "./admin";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(clinicsRouter);
router.use(doctorsRouter);
router.use(appointmentsRouter);
router.use(tokensRouter);
router.use(subscriptionsRouter);
router.use(paymentsRouter);
router.use(invoicesRouter);
router.use(adminRouter);
router.use(dashboardRouter);

export default router;
