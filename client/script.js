// script.js

const API = "http://localhost:5000";

// ============================
// SELECT ELEMENTS
// ============================

const reportForm =
  document.getElementById("reportForm");

const message =
  document.getElementById("message");

// ============================
// FORM SUBMIT
// ============================

reportForm.addEventListener(
  "submit",
  async (e) => {

    e.preventDefault();

    // ============================
    // CREATE FORMDATA
    // ============================

    const formData = new FormData();

    // ============================
    // GET INPUT VALUES
    // ============================

    const reporterName =
      document.getElementById(
        "reporterName"
      ).value;

    const reporterEmail =
      document.getElementById(
        "reporterEmail"
      ).value;

    const institution =
      document.getElementById(
        "institution"
      ).value;

    const scamType =
      document.getElementById(
        "scamType"
      ).value;

    const platform =
      document.getElementById(
        "platform"
      ).value;

    const scammerContact =
      document.getElementById(
        "scammerContact"
      ).value;

    const description =
      document.getElementById(
        "description"
      ).value;

    // ============================
    // APPEND TEXT DATA
    // ============================

    formData.append(
      "reporterName",
      reporterName
    );

    formData.append(
      "reporterEmail",
      reporterEmail
    );

    formData.append(
      "institution",
      institution
    );

    formData.append(
      "scamType",
      scamType
    );

    formData.append(
      "platform",
      platform
    );

    formData.append(
      "scammerContact",
      scammerContact
    );

    formData.append(
      "description",
      description
    );

    // ============================
    // FILE UPLOAD
    // ============================

    const screenshotInput =
      document.getElementById(
        "screenshots"
      );

    const files =
      screenshotInput.files;

    // APPEND ALL FILES

    for (
      let i = 0;
      i < files.length;
      i++
    ) {

      formData.append(
        "screenshots",
        files[i]
      );

    }

    // ============================
    // DEBUG LOG
    // ============================

    for (
      let pair of formData.entries()
    ) {

      console.log(
        pair[0],
        pair[1]
      );

    }

    // ============================
    // SEND TO BACKEND
    // ============================

    try {

      const response =
        await fetch(

          `${API}/api/reports`,

          {
            method: "POST",
            body: formData,
          }

        );

      const data =
        await response.json();

      // ============================
      // SUCCESS
      // ============================

      if (data.success) {

        message.style.color =
          "green";

        message.innerText =
          "Report submitted successfully";

        reportForm.reset();

      }

      // ============================
      // ERROR FROM BACKEND
      // ============================

      else {

        message.style.color =
          "red";

        message.innerText =
          data.message;

      }

    }

    // ============================
    // SERVER ERROR
    // ============================

    catch (error) {

      console.log(error);

      message.style.color =
        "red";

      message.innerText =
        "Server Error";

    }

  }
);