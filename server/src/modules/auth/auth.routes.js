import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import { authenticate } from "../../middlewares/auth.js";
import { registerSchema, loginSchema } from "./auth.schema.js";
import * as ctrl from "./auth.controller.js";

const router = Router();

// POST /api/auth/register  — créer un compte (Producteur ou Partenaire)
router.post("/register", validate(registerSchema), ctrl.register);

// POST /api/auth/login     — se connecter
router.post("/login", validate(loginSchema), ctrl.login);

// GET  /api/auth/me        — profil de l'utilisateur connecté
router.get("/me", authenticate, ctrl.me);

export default router;
