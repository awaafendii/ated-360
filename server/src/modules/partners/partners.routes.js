import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as partnersService from "./partners.service.js";

const router = Router();

const ZONES = [
  "BEYLA", "BOFFA", "BOKE", "CONAKRY", "COYAH",
  "DABOLA", "DALABA", "DINGUIRAYE", "DUBREKA",
  "FARANAH", "FORECARIAH", "FRIA",
  "GAOUAL", "GUECKEDOU",
  "KANKAN", "KAMSAR", "KEROUANE", "KINDIA", "KISSIDOUGOU",
  "KOUNDARA", "KOUROUSSA", "KOUBIA",
  "LABE", "LELOUMA", "LOLA",
  "MACENTA", "MALI", "MANDIANA", "MAMOU",
  "NZEREKORE",
  "PITA",
  "SANGAREDI", "SIGUIRI",
  "TELIMELE", "TOUGUE",
  "YOMOU",
];

const listQuerySchema = z.object({
  zone: z.enum(ZONES).optional(),
  search: z.string().max(120).optional(),
});

const offerSchema = z.object({
  producerId: z.string().uuid(),
  partnerName: z.string().min(1).max(120),
  message: z.string().min(5, "Le message doit contenir au moins 5 caractères").max(1000),
  amount: z.string().max(60).optional(),
  phone: z.string().max(30).optional(),
  email: z.string().email().optional(),
});

router.use(authenticate, authorize("PARTENAIRE"));

router.get(
  "/summary",
  asyncHandler(async (req, res) => {
    const summary = await partnersService.getNetworkSummary();
    ok(res, summary);
  })
);

router.get(
  "/producers",
  validate(listQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const producers = await partnersService.listProducers(req.query);
    ok(res, producers);
  })
);

router.get(
  "/producers/:id",
  asyncHandler(async (req, res) => {
    const detail = await partnersService.getProducerDetail(req.params.id);
    ok(res, detail);
  })
);

router.post(
  "/offers",
  validate(offerSchema),
  asyncHandler(async (req, res) => {
    await partnersService.sendOffer(req.body);
    ok(res, { sent: true });
  })
);

export default router;
