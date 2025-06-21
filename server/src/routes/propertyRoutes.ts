import express from "express";
import {
  getProperties,
  createProperty,
  getProperty,
} from "../controllers/propertyController";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware";

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const router = express.Router();

router.get("/:", getProperties);
router.get("/:id", getProperty);
router.post(
  "/",
  authMiddleware(["Manager"]),
  upload.array("photos"),
  createProperty
);

export default router;
