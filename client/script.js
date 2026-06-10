const API_URL = "http://localhost:5000";

async function submitReport() {

  try {

    const formData = new FormData();

    formData.append(
      "reporterName",
      document.getElementById("f-name")?.value || ""
    );

    formData.append(
      "reporterEmail",
      document.getElementById("f-email")?.value || ""
    );

    formData.append(
      "institution",
      document.getElementById("f-inst")?.value || ""
    );

    formData.append(
      "scammerContact",
      document.getElementById("f-contact")?.value || ""
    );

    formData.append(
      "description",
      document.getElementById("f-desc")?.value || ""
    );

    const screenshots =
      document.getElementById("screenshots");

    if (screenshots?.files) {

      for (const file of screenshots.files) {
        formData.append("screenshots", file);
      }

    }

    const response = await fetch(
      `${API_URL}/api/reports`,
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    console.log(data);

    alert(
      data.success
        ? "Report submitted successfully"
        : data.message
    );

  } catch (err) {

    console.error(err);
    alert("Server Error");

  }

}
initAnimations();

loadWarnings();

setupForm();

async function loadStats() {

  try {

    const response =
      await fetch(
        "http://localhost:5000/api/stats"
      );

    const data =
      await response.json();

    document.getElementById(
      "totalReports"
    ).innerText = data.reports;

    document.getElementById(
      "totalBlacklist"
    ).innerText = data.blacklist;

  }

  catch(error) {

    console.log(error);

  }

}

loadStats();