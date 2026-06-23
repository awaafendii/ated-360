import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, created } from "../../utils/response.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as alertsService from "./alerts.service.js";

const router = Router();

const createAlertSchema = z.object({
  priority: z.enum(["URGENT", "NORMAL", "INFO"]),
  kind: z.enum(["VACCIN", "CLIMAT", "TRAITEMENT"]),
  title: z.string().min(2).max(120),
  description: z.string().min(2).max(400),
  dueAt: z.coerce.date().optional(),
});

const listQuerySchema = z.object({
  priority: z.enum(["URGENT", "NORMAL", "INFO"]).optional(),
  resolved: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

router.use(authenticate, authorize("PRODUCTEUR"));

// GET /api/alerts — liste filtrable
router.get(
  "/",
  validate(listQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const alerts = await alertsService.listAlerts(req.user.producerId, req.query);
    ok(res, alerts);
  })
);

// GET /api/alerts/summary — décompte par priorité
router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const summary = await alertsService.getSummary(req.user.producerId);
    ok(res, summary);
  })
);

// POST /api/alerts — créer une alerte manuelle
router.post(
  "/",
  validate(createAlertSchema),
  asyncHandler(async (req, res) => {
    const alert = await alertsService.createAlert(req.user.producerId, req.body);
    created(res, alert);
  })
);

// PATCH /api/alerts/:id/resolve — marquer comme traitée
router.patch(
  "/:id/resolve",
  asyncHandler(async (req, res) => {
    const alert = await alertsService.resolveAlert(req.user.producerId, req.params.id);
    ok(res, alert);
  })
);

export default router;
