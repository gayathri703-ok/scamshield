const API_URL = "http://localhost:5000";

async function loadStats(){

try{

const res =
await fetch(`${API_URL}/api/stats`);

const data =
await res.json();

document.getElementById(
"totalReports"
).innerText = data.reports;

document.getElementById(
"totalBlacklist"
).innerText = data.blacklist;

}catch(error){

console.log(error);

}

}

async function loadReports(){

try{

const token =
localStorage.getItem("token");

const res =
await fetch(`${API_URL}/api/reports`,{

headers:{
authorization: token
}

});

const data =
await res.json();

const table =
document.getElementById("reportsTable");

table.innerHTML = "";

data.data.forEach(report=>{

table.innerHTML += `
<tr>

<td>${report.reporterName}</td>

<td>${report.scamType}</td>

<td>${report.platform}</td>

<td>${report.status}</td>

<td>

<button
class="verify"
onclick="verifyReport('${report._id}')">
Verify
</button>

<button
class="delete"
onclick="deleteReport('${report._id}')">
Delete
</button>

</td>

</tr>
`;

});

}catch(error){

console.log(error);

}

}

async function verifyReport(id){

const token =
localStorage.getItem("token");

await fetch(
`${API_URL}/api/reports/${id}`,
{
method:"PATCH",
headers:{
"Content-Type":"application/json",
authorization: token
},
body:JSON.stringify({
status:"verified"
})
}
);

loadReports();
loadStats();

}

async function deleteReport(id){

const token =
localStorage.getItem("token");

await fetch(
`${API_URL}/api/reports/${id}`,
{
method:"DELETE",
headers:{
authorization: token
}
}
);

loadReports();
loadStats();

}

loadStats();
loadReports();