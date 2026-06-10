import express from "express";
import multer from "multer";

import {
  createReport,
  getReports,
  getVerifiedReports,
  updateReportStatus,
  deleteReport
} from "../controllers/reportController.js";

const router = express.Router();

// ============================
// MULTER CONFIG
// ============================

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {
    cb(
      null,
      Date.now() + "-" + file.originalname
    );
  }

});

const upload = multer({
  storage
});

// ============================
// ROUTES
// ============================

// Get all reports
router.get(
  "/",
  getReports
);

// Get only verified reports
router.get(
  "/verified",
  getVerifiedReports
);

// Create report
router.post(
  "/",
  upload.array("screenshots"),
  createReport
);

// Update report status
router.patch(
  "/:id",
  updateReportStatus
);

// Delete report
router.delete(
  "/:id",
  deleteReport
);

export default router;