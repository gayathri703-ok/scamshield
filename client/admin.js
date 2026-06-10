// admin.js

const API_URL = "http://localhost:5000";

const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "login.html";
}

const reportsContainer =
  document.getElementById("reportsContainer");

const searchInput =
  document.getElementById("searchInput");

let allReports = [];

// ============================
// FETCH REPORTS
// ============================

async function fetchReports() {

  try {

    const response = await fetch(`${API_URL}/api/reports`, {
      headers: {
        authorization: token,
      },
    });

    const data = await response.json();

console.log("REPORT RESPONSE:", data);

if (!data.success) {
  console.log("API ERROR:", data.message);
  return;
}

allReports = data.data || [];

displayReports(allReports);

updateAnalytics(allReports);
  } catch (error) {
    console.log(error);
  }
}

// ============================
// DISPLAY REPORTS
// ============================

function displayReports(reports = []) {

  reportsContainer.innerHTML = "";

  if (reports.length === 0) {

    reportsContainer.innerHTML = `
      <h2>No Reports Found</h2>
    `;

    return;
  }

  reports.forEach((report) => {
console.log("SCREENSHOTS:", report.screenshots);
const screenshotsHTML = (report.screenshots || [])
  .map((file) => {

    const cleanFile = file.replace(/\\/g, "/");

    const fileUrl = cleanFile.startsWith("uploads/")
      ? `${API_URL}/${cleanFile}`
      : `${API_URL}/uploads/${cleanFile}`;

    if (cleanFile.toLowerCase().endsWith(".pdf")) {
      return `
        <a
          href="${fileUrl}"
          target="_blank"
        >
          📄 View PDF
        </a>
      `;
    }

    return `
      <img
        src="${fileUrl}"
        alt="screenshot"
        style="max-width:300px;"
      >
    `;
  })
  .join("");
  
const card = document.createElement("div");

card.className = "report-card";

    card.className = "report-card";

    card.innerHTML = `

      <h2>${report.scamType}</h2>

      <p>
        <strong>Reporter:</strong>
        ${report.reporterName}
      </p>

      <p>
        <strong>Email:</strong>
        ${report.reporterEmail}
      </p>

      <p>
        <strong>Institution:</strong>
        ${report.institution}
      </p>

      <p>
        <strong>Platform:</strong>
        ${report.platform}
      </p>

      <p>
        <strong>Scammer Contact:</strong>
        ${report.scammerContact}
      </p>

      <p>
        <strong>Description:</strong>
        ${report.description}
      </p>

      <div class="status ${report.status}">
        ${report.status.toUpperCase()}
      </div>

      <div class="screenshot-container">
        ${screenshotsHTML}
      </div>

      <div class="actions">

        <button
          class="investigate-btn"
          onclick="updateStatus('${report._id}','investigating')"
        >
          Investigating
        </button>

        <button
          class="verify-btn"
          onclick="updateStatus('${report._id}','verified')"
        >
          Verify
        </button>

        <button
          class="resolve-btn"
          onclick="updateStatus('${report._id}','resolved')"
        >
          Resolve
        </button>

        <button
          class="delete-btn"
          onclick="deleteReport('${report._id}')"
        >
          Delete
        </button>

      </div>

    `;

    reportsContainer.appendChild(card);

  });
}

// ============================
// UPDATE STATUS
// ============================

async function updateStatus(id, status) {

  try {

    await fetch(`${API_URL}/api/reports/${id}`, {

      method:"PATCH",

      headers:{
        "Content-Type":"application/json",
        authorization:token,
      },

      body:JSON.stringify({ status }),

    });

    fetchReports();

  } catch(error){
    console.log(error);
  }
}

// ============================
// DELETE REPORT
// ============================

async function deleteReport(id){

  const confirmDelete =
    confirm("Are you sure you want to delete?");

  if(!confirmDelete) return;

  try{

    await fetch(`${API_URL}/api/reports/${id}`,{

      method:"DELETE",

      headers:{
        authorization:token,
      }

    });

    fetchReports();

  } catch(error){
    console.log(error);
  }
}

// ============================
// FILTER REPORTS
// ============================

function filterReports(status){

  if(status === "all"){

    displayReports(allReports);

    return;
  }

  const filteredReports =
    allReports.filter(
      (report)=> report.status === status
    );

  displayReports(filteredReports);
}

// ============================
// SEARCH REPORTS
// ============================

searchInput.addEventListener("input", ()=>{

  const value =
    searchInput.value.toLowerCase();

  const filteredReports =
    allReports.filter((report)=>{

      return(

        report.platform
          .toLowerCase()
          .includes(value)

        ||

        report.scamType
          .toLowerCase()
          .includes(value)

        ||

        report.reporterEmail
          .toLowerCase()
          .includes(value)

      );

    });

  displayReports(filteredReports);

});

// ============================
// ANALYTICS
// ============================

function updateAnalytics(reports){

  document.getElementById("totalReports")
    .innerText = reports.length;

  document.getElementById("pendingReports")
    .innerText =
      reports.filter(
        (r)=>r.status === "pending"
      ).length;

  document.getElementById("verifiedReports")
    .innerText =
      reports.filter(
        (r)=>r.status === "verified"
      ).length;

  document.getElementById("resolvedReports")
    .innerText =
      reports.filter(
        (r)=>r.status === "resolved"
      ).length;
}

// ============================
// LOGOUT
// ============================

function logout(){

  localStorage.removeItem("token");

  window.location.href = "login.html";
}

// ============================
// START APP
// ============================

fetchReports();