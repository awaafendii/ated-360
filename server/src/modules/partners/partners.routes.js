import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as partnersService from "./partners.service.js";

const router = Router();

const ZONES = ["CONAKRY", "KINDIA", "BOKE", "MAMOU", "LABE", "FARANAH", "KANKAN", "NZEREKORE"];

const listQuerySchema = z.object({
  zone: z.enum(ZONES).optional(),
  search: z.string().max(120).optional(),
});

// Espace réservé aux partenaires (banques, ONG, coopératives).
router.use(authenticate, authorize("PARTENAIRE"));

// GET /api/partners/summary — indicateurs agrégés du réseau
router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const summary = await partnersService.getNetworkSummary();
    ok(res, summary);
  })
);

// GET /api/partners/producers — portefeuille de producteurs avec scores
router.get(
  "/producers",
  validate(listQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const producers = await partnersService.listProducers(req.query);
    ok(res, producers);
  })
);

// GET /api/partners/producers/:id — fiche détaillée d'un producteur
router.get(
  "/producers/:id",
  asyncHandler(async (req, res) => {
    const detail = await partnersService.getProducerDetail(req.params.id);
    ok(res, detail);
  })
);

export default router;
