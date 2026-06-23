import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { ok, created } from "../../utils/response.js";
import { authenticate, authorize } from "../../middlewares/auth.js";
import { validate } from "../../middlewares/validate.js";
import { createRecordSchema, listRecordsQuerySchema } from "./records.schema.js";
import * as recordsService from "./records.service.js";

const router = Router();

// Toutes les routes du registre nécessitent un PRODUCTEUR authentifié.
router.use(authenticate, authorize("PRODUCTEUR"));

// POST /api/records — enregistrer une activité
router.post(
  "/",
  validate(createRecordSchema),
  asyncHandler(async (req, res) => {
    const record = await recordsService.createRecord(req.user.producerId, req.body);
    created(res, record);
  })
);

// GET /api/records — historique paginé et filtrable
router.get(
  "/",
  validate(listRecordsQuerySchema, "query"),
  asyncHandler(async (req, res) => {
    const result = await recordsService.listRecords(req.user.producerId, req.query);
    ok(res, result.items, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      pages: result.pages,
    });
  })
);

// GET /api/records/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const record = await recordsService.getRecord(req.user.producerId, req.params.id);
    ok(res, record);
  })
);

// DELETE /api/records/:id
router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await recordsService.deleteRecord(req.user.producerId, req.params.id);
    ok(res, { deleted: true });
  })
);

export default router;
