import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, created } from "../../utils/response.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as dronesService from "./drones.service.js";

const router = Router();

const ZONES = ["CONAKRY", "KINDIA", "BOKE", "MAMOU", "LABE", "FARANAH", "KANKAN", "NZEREKORE"];

const createMissionSchema = z.object({
  pack: z.enum(["SURVOL", "SANTE", "COMPLET"]),
  parcelle: z.string().min(2, "Le nom de la parcelle est requis").max(120),
  culture: z.string().min(1).max(60),
  hectares: z.coerce.number().nonnegative().optional(),
  zone: z.enum(ZONES),
  scheduledFor: z.coerce.date().optional(),
  note: z.string().max(300).optional(),
});

const statusSchema = z.object({
  status: z.enum(["DEMANDE_ENVOYEE", "PLANIFIE", "REALISE", "RAPPORT_PRET", "ANNULE"]),
});

router.use(authenticate, authorize("PRODUCTEUR"));

// POST /api/drones/missions — demander un survol
router.post(
  "/missions",
  validate(createMissionSchema),
  asyncHandler(async (req, res) => {
    const mission = await dronesService.createMission(req.user.producerId, req.body);
    created(res, mission);
  })
);

// GET /api/drones/missions — lister ses missions (avec rapports)
router.get(
  "/missions",
  asyncHandler(async (req, res) => {
    const missions = await dronesService.listMissions(req.user.producerId);
    ok(res, missions);
  })
);

// GET /api/drones/missions/:id
router.get(
  "/missions/:id",
  asyncHandler(async (req, res) => {
    const mission = await dronesService.getMission(req.user.producerId, req.params.id);
    ok(res, mission);
  })
);

// PATCH /api/drones/missions/:id/status — faire évoluer le statut
router.patch(
  "/missions/:id/status",
  validate(statusSchema),
  asyncHandler(async (req, res) => {
    const mission = await dronesService.updateStatus(
      req.user.producerId,
      req.params.id,
      req.body.status
    );
    ok(res, mission);
  })
);

// POST /api/drones/missions/:id/report — générer le rapport agronomique
router.post(
  "/missions/:id/report",
  asyncHandler(async (req, res) => {
    const result = await dronesService.generateReport(req.user.producerId, req.params.id);
    created(res, result);
  })
);

export default router;
