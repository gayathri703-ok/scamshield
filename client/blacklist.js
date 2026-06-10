const container =
document.getElementById("blacklistContainer");

const searchInput =
document.getElementById("searchInput");

let allReports = [];

async function loadBlacklist() {

  try {

    const response =
      await fetch(
        "http://localhost:5000/api/reports/verified"
      );

    const data =
      await response.json();

    allReports = data.data || [];

    displayReports(allReports);

  }

  catch(error) {

    console.log(error);

  }

}

function displayReports(reports) {

  container.innerHTML = "";

  if(reports.length === 0) {

    container.innerHTML =
      "<h2>No verified reports found</h2>";

    return;
  }

  reports.forEach(report => {

    container.innerHTML += `

      <div class="card">

        <h3>${report.scamType}</h3>

        <p>
          <strong>Platform:</strong>
          ${report.platform}
        </p>

        <p>
          <strong>Contact:</strong>
          ${report.scammerContact}
        </p>

        <p>
          ${report.description}
        </p>

      </div>

    `;

  });

}

searchInput.addEventListener(
  "input",
  () => {

    const value =
      searchInput.value.toLowerCase();

    const filtered =
      allReports.filter(report =>

        report.scamType
          .toLowerCase()
          .includes(value)

        ||

        report.platform
          .toLowerCase()
          .includes(value)

        ||

        report.scammerContact
          .toLowerCase()
          .includes(value)

      );

    displayReports(filtered);

  }
);

loadBlacklist();