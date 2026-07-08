import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, created } from "../../utils/response.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import * as producersService from "./producers.service.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

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

const updateProfileSchema = z.object({
  zone: z.enum(ZONES).optional(),
  farmType: z.enum(["AVICOLE", "AGRICOLE", "MIXTE"]).optional(),
  poultryCount: z.coerce.number().int().nonnegative().optional(),
  hectares: z.coerce.number().nonnegative().optional(),
  fieldLocation: z.string().max(200).optional(),
  cultures: z.array(z.string().max(60)).max(30).optional(),
  startYear: z.coerce.number().int().min(1950).max(2100).optional(),
  investedAmount: z.string().max(120).optional(),
  youthEmployed: z.coerce.number().int().nonnegative().optional(),
  womenEmployed: z.coerce.number().int().nonnegative().optional(),
  annualRevenue: z.string().max(120).optional(),
  legalStatus: z.enum(["Formel", "Informel"]).optional(),
  challenges: z.string().max(2000).optional(),
  achievements: z.string().max(2000).optional(),
  outlook: z.string().max(2000).optional(),
});

const addProofSchema = z.object({
  type: z.enum(["PHOTO", "VIDEO", "DOCUMENT"]),
  label: z.string().max(150).optional(),
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

// POST /api/producers/cv — téléverser/remplacer le CV du producteur
router.post(
  "/cv",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const profile = await producersService.uploadCv(req.user.producerId, req.file);
    ok(res, profile);
  })
);

// GET /api/producers/proofs — lister mes preuves (photos, vidéos, documents)
router.get(
  "/proofs",
  asyncHandler(async (req, res) => {
    const proofs = await producersService.listProofs(req.user.producerId);
    ok(res, proofs);
  })
);

// POST /api/producers/proofs — téléverser une preuve
router.post(
  "/proofs",
  upload.single("file"),
  validate(addProofSchema),
  asyncHandler(async (req, res) => {
    const proof = await producersService.addProof(req.user.producerId, req.file, req.body);
    created(res, proof);
  })
);

// DELETE /api/producers/proofs/:id — retirer une preuve
router.delete(
  "/proofs/:id",
  asyncHandler(async (req, res) => {
    await producersService.removeProof(req.user.producerId, req.params.id);
    ok(res, { removed: true });
  })
);

export default router;
