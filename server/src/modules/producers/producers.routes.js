import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as producersService from "./producers.service.js";

const router = Router();

const ZONES = ["CONAKRY", "KINDIA", "BOKE", "MAMOU", "LABE", "FARANAH", "KANKAN", "NZEREKORE"];

const updateProfileSchema = z.object({
  zone: z.enum(ZONES).optional(),
  farmType: z.enum(["AVICOLE", "AGRICOLE", "MIXTE"]).optional(),
  poultryCount: z.coerce.number().int().nonnegative().optional(),
  hectares: z.coerce.number().nonnegative().optional(),
});

router.use(authenticate, authorize("PRODUCTEUR"));

// GET /api/producers/dashboard — données agrégées du tableau de bord
router.get(
  "/dashboard",
  asyncHandler(async (req, res) => {
    const data = await producersService.getDashboard(req.user.producerId);
    ok(res, data);
  })
);

// PATCH /api/producers/profile — mettre à jour le profil de la ferme
router.patch(
  "/profile",
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const profile = await producersService.updateProfile(req.user.producerId, req.body);
    ok(res, profile);
  })
);

export default router;
