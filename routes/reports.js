const express = require("express");

const router = express.Router();

const Report =
  require("../models/Report");

const upload =
  require("../middleware/upload");

/* ======================================================
   GET ALL REPORTS
====================================================== */

router.get("/", async (req, res) => {

  try {

    const reports =
      await Report.find().sort({
        createdAt: -1
      });

    res.json({

      success: true,

      reports

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message

    });

  }

});

/* ======================================================
   CREATE REPORT
====================================================== */

router.post(

  "/",

  upload.single("screenshot"),

  async (req, res) => {

    try {

      const {
        scamType,
        description,
        amountLost,
        phone
      } = req.body;

      /* image path */

      const screenshot =
        req.file
          ? `/uploads/${req.file.filename}`
          : "";

      /* create report */

      const report =
        await Report.create({

          scamType,
          description,
          amountLost,
          phone,
          screenshot

        });

      res.status(201).json({

        success: true,

        message:
          "Report submitted successfully",

        report

      });

    } catch (error) {

      res.status(500).json({

        success: false,

        message: error.message

      });

    }

  }

);

/* ======================================================
   EXPORT ROUTER
====================================================== */

module.exports = router;