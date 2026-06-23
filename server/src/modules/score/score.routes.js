import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok } from "../../utils/response.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { badRequest } from "../../utils/AppError.js";
import * as scoreService from "./score.service.js";

const router = Router();

// GET /api/score?farmType=AVICOLE|AGRICOLE — score courant du producteur connecté
router.get(
  "/",
  authenticate,
  authorize("PRODUCTEUR"),
  asyncHandler(async (req, res) => {
    const farmType = (req.query.farmType || "AVICOLE").toUpperCase();
    if (!["AVICOLE", "AGRICOLE"].includes(farmType)) {
      throw badRequest("farmType doit valoir AVICOLE ou AGRICOLE");
    }
    const result = await scoreService.computeScore(req.user.producerId, farmType);
    ok(res, result);
  })
);

// POST /api/score/snapshot — recalcule et enregistre un instantané
router.post(
  "/snapshot",
  authenticate,
  authorize("PRODUCTEUR"),
  asyncHandler(async (req, res) => {
    const farmType = (req.body?.farmType || "AVICOLE").toUpperCase();
    const result = await scoreService.computeAndSnapshot(req.user.producerId, farmType);
    ok(res, result);
  })
);

// GET /api/score/history — historique des scores du producteur
router.get(
  "/history",
  authenticate,
  authorize("PRODUCTEUR"),
  asyncHandler(async (req, res) => {
    const history = await scoreService.getScoreHistory(req.user.producerId);
    ok(res, history);
  })
);

export default router;
