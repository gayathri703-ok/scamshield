// login.js

const API_URL = "http://localhost:5000";

const form = document.getElementById("loginForm");
const message = document.getElementById("message");

if (!form) {
  console.error("loginForm not found");
} else {

  form.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email =
      document.getElementById("email").value;

    const password =
      document.getElementById("password").value;

    try {

      const response = await fetch(
        `${API_URL}/api/admin/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await response.json();

      console.log("LOGIN RESPONSE:", data);

      if (data.success) {

        localStorage.setItem(
          "token",
          data.token
        );

        message.style.color = "green";
        message.textContent =
          "Login successful";

        setTimeout(() => {
          window.location.href =
            "admin.html";
        }, 1000);

      } else {

        message.style.color = "red";
        message.textContent =
          data.message || "Login failed";

      }

    } catch (error) {

      console.error("LOGIN ERROR:", error);

      message.style.color = "red";
      message.textContent =
        "Server Error";

    }

  });

}