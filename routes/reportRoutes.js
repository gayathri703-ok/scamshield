import express from "express";
import multer from "multer";

import {
createReport,
getReports,
updateReportStatus,
deleteReport
} from "../controllers/reportController.js";

const router = express.Router();

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

router.get(
"/",
getReports
);

router.post(
"/",
upload.array("screenshots"),
createReport
);

router.patch(
"/:id",
updateReportStatus
);

router.delete(
"/:id",
deleteReport
);

export default router;
