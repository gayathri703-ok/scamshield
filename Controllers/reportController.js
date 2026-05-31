import Report from "../models/Report.js";

export const createReport = async (req, res) => {

try {

```
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
```

} catch (error) {

```
console.log(error);

res.status(500).json({
  success: false,
  message: "Server Error"
});
```

}

};

export const getReports = async (req, res) => {

try {

```
const reports =
  await Report.find().sort({
    createdAt: -1
  });

res.json({
  success: true,
  count: reports.length,
  data: reports
});
```

} catch (error) {

```
console.log(error);

res.status(500).json({
  success: false,
  message: "Server Error"
});
```

}

};

export const updateReportStatus =
async (req, res) => {

```
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
```

};

export const deleteReport =
async (req, res) => {

```
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
```

};
