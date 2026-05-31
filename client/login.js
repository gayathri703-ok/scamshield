const API = "http://localhost:5000";

const loginForm =
  document.getElementById("loginForm");

const message =
  document.getElementById("message");

loginForm.addEventListener("submit", async (e)=>{

  e.preventDefault();

  const email =
    document.getElementById("email").value;

  const password =
    document.getElementById("password").value;

  try{

    const response = await fetch(
      `${API}/api/admin/login`,
      {
        method:"POST",

        headers:{
          "Content-Type":"application/json",
        },

        body:JSON.stringify({
          email,
          password,
        }),
      }
    );

    const data = await response.json();

    if(data.success){

      localStorage.setItem(
        "token",
        data.token
      );

      window.location.href = "admin.html";

    } else {

      message.innerText = data.message;
    }

  } catch(error){

    message.innerText = "Server Error";

    console.log(error);
  }

});