import Report from "../models/Report.js";

// ============================
// CREATE REPORT
// ============================

export const createReport = async (req, res) => {

  try {

    console.log("BODY DATA:");
    console.log(req.body);

    console.log("UPLOADED FILES:");
    console.log(req.files);

    const screenshots =
      req.files
        ? req.files.map(file => file.path)
        : [];

    const report = new Report({
      reporterName: req.body.reporterName,
      reporterEmail: req.body.reporterEmail,
      institution: req.body.institution,
      scamType: req.body.scamType,
      platform: req.body.platform,
      scammerContact: req.body.scammerContact,
      description: req.body.description,
      screenshots
    });

    const savedReport =
      await report.save();

    res.status(201).json({
      success: true,
      message:
        "Report submitted successfully",
      data: savedReport
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};

// ============================
// GET ALL REPORTS
// ============================

export const getReports = async (req, res) => {

  try {

    const reports =
      await Report.find().sort({
        createdAt: -1
      });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};

// ============================
// GET VERIFIED REPORTS
// ============================

export const getVerifiedReports = async (req, res) => {

  try {

    const reports =
      await Report.find({
        status: "verified"
      }).sort({
        createdAt: -1
      });

    res.json({
      success: true,
      count: reports.length,
      data: reports
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};

// ============================
// UPDATE REPORT STATUS
// ============================

export const updateReportStatus =
async (req, res) => {

  try {

    const report =
      await Report.findByIdAndUpdate(

        req.params.id,

        {
          status:
            req.body.status
        },

        {
          new: true
        }

      );

    if (!report) {

      return res.status(404).json({
        success: false,
        message:
          "Report not found"
      });

    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};

// ============================
// DELETE REPORT
// ============================

export const deleteReport =
async (req, res) => {

  try {

    const report =
      await Report.findByIdAndDelete(
        req.params.id
      );

    if (!report) {

      return res.status(404).json({
        success: false,
        message:
          "Report not found"
      });

    }

    res.json({
      success: true,
      message:
        "Report deleted successfully"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error"
    });

  }

};