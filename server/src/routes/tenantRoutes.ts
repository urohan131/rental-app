import express from "express";
import {
  getTenant,
  createTenant,
  updateTenant,
  getCurrentResidences,
} from "../controllers/tenantControllers";

const router = express.Router();

router.get("/:cognitoId", getTenant);
router.put("/:cognitoId", updateTenant);
router.get("/:cognitoId/properties", getCurrentResidences);
router.post("/", createTenant);

export default router;
