import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import multer from "multer";
import path from "path";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";

import Report from "./models/Report.js";
import Blacklist from "./models/Blacklist.js";
import transporter from "./config/mailer.js";

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "client")));

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {

    console.log("MongoDB Connected");

  })
  .catch((error) => {

    console.log(error);

  });

const storage = multer.diskStorage({

  destination: function(req, file, cb) {

    cb(null, "uploads/");

  },

  filename: function(req, file, cb) {

    cb(
      null,
      Date.now() + "-" + file.originalname
    );

  }

});

const upload = multer({ storage });

const ADMIN_EMAIL =
  "admin@scamshield.com";

const ADMIN_PASSWORD =
  bcrypt.hashSync("admin123", 10);

const protect = (req, res, next) => {

  try {

    const token =
      req.headers.authorization;

    if(!token) {

      return res.status(401).json({

        success: false,
        message: "No token provided"

      });

    }

    const decoded = jwt.verify(

      token,
      process.env.JWT_SECRET

    );

    req.admin = decoded;

    next();

  }

  catch(error) {

    return res.status(401).json({

      success: false,
      message: "Invalid token"

    });

  }

};

app.get("/api", (req, res) => {

  res.json({

    success: true,
    name: "ScamShield API"

  });

});

app.get("/", (req, res) => {

  res.sendFile(

    path.join(
      __dirname,
      "client",
      "index.html"
    )

  );

});

app.post(

  "/api/admin/login",

  async (req, res) => {

    try {

      const {
        email,
        password
      } = req.body;

      if(email !== ADMIN_EMAIL) {

        return res.status(400).json({

          success: false,
          message: "Invalid email"

        });

      }

      const isMatch =
        await bcrypt.compare(

          password,
          ADMIN_PASSWORD

        );

      if(!isMatch) {

        return res.status(400).json({

          success: false,
          message: "Invalid password"

        });

      }

      const token = jwt.sign(

        {
          email: ADMIN_EMAIL
        },

        process.env.JWT_SECRET,

        {
          expiresIn: "7d"
        }

      );

      res.status(200).json({

        success: true,
        token

      });

    }

    catch(error) {

      res.status(500).json({

        success: false,
        message: error.message

      });

    }

  }

);

app.post(

  "/api/reports",

  upload.array("screenshots", 5),

  async (req, res) => {

    try {

      console.log("BODY:");
      console.log(req.body);

      console.log("FILES:");
      console.log(req.files);

      const {

        reporterName,
        reporterEmail,
        institution,
        scamType,
        platform,
        scammerContact,
        description

      } = req.body;

      if(
        !reporterName ||
        !reporterEmail
      ) {

        return res.status(400).json({

          success: false,
          message: "Name and Email required"

        });

      }

      let screenshots = [];

      if(
        req.files &&
        req.files.length > 0
      ) {

       const screenshots = req.files
  ? req.files.map(file => file.filename)
  : [];
      }

      const report =
        await Report.create({

          reporterName,
          reporterEmail,
          institution,
          scamType,
          platform,
          scammerContact,
          description,
          screenshots,
          status: "pending"

        });

        console.log("EMAIL_USER =", process.env.EMAIL_USER);
console.log("EMAIL_PASS =", process.env.EMAIL_PASS);
        try {

  await transporter.sendMail({

    from: process.env.EMAIL_USER,

    to: reporterEmail,

    subject: "ScamShield Report Received",

    html: `
      <h2>Report Submitted Successfully</h2>

      <p>Hello ${reporterName}</p>

      <p>Your report has been received.</p>

      <p>Scam Type: ${scamType}</p>

      <p>Platform: ${platform}</p>

    `

  });

  console.log("User email sent");

}

catch(error){

  console.log(error);

}

      return res.status(201).json({

        success: true,

        message:
          "Report submitted successfully",

        reportId: report._id,

        data: report

      });

    }

    catch(error) {

      console.log(error);

      return res.status(500).json({

        success: false,
        message: error.message

      });

    }

  }

);

app.get(

  "/api/reports",

  protect,

  async (req, res) => {

    try {

      const reports =
        await Report.find()
          .sort({ createdAt: -1 });

      res.status(200).json({

        success: true,
        data: reports

      });

    }

    catch(error) {

      res.status(500).json({

        success: false,
        message: error.message

      });

    }

  }

);

app.get(

  "/api/blacklist",

  async (req, res) => {

    try {

      const blacklist =
        await Blacklist.find()
          .sort({ createdAt: -1 });

      res.status(200).json({

        success: true,
        data: blacklist

      });

    }

    catch(error) {

      res.status(500).json({

        success: false,
        message: error.message

      });

    }

  }

);

app.get(

  "/api/stats",

  async (req, res) => {

    try {

      const reports =
        await Report.countDocuments();

      const blacklist =
        await Blacklist.countDocuments();

      res.status(200).json({

        success: true,
        reports,
        blacklist

      });

    }

    catch(error) {

      res.status(500).json({

        success: false,
        message: error.message

      });

    }

  }

);

app.get(

  "/api/stats/tips",

  (req, res) => {

    res.status(200).json({

      success: true,

      tips: [

        "Never pay money for jobs",

        "Companies never interview on Telegram",

        "Verify companies on MCA website",

        "Never share OTP or bank details",

        "Use official company websites only"

      ]

    });

  }

);
app.patch("/api/reports/:id", protect, async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.json({
      success: true,
      data: report
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

app.delete("/api/reports/:id", protect, async (req, res) => {
  try {
    const report = await Report.findByIdAndDelete(
      req.params.id
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    res.json({
      success: true,
      message: "Report deleted"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  );

});