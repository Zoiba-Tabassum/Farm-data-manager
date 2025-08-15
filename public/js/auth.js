document
  .getElementById("loginForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const user_name = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const messageEl = document.getElementById("loginMessage");

    messageEl.textContent = "";
    messageEl.className = "mt-4 text-sm font-medium";

    try {
      const response = await fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_name, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.user.role);

        messageEl.textContent = "Login successful!🥳🎉 ";
        messageEl.classList.add("text-green-400");

        // Redirect to dashboard.html
        window.location.href = "dashboard.html";
      } else {
        messageEl.textContent = data.error || "Login failed";
        messageEl.classList.add("text-red-400");
      }
    } catch (error) {
      messageEl.textContent = "Server error. Please try again later.";
      messageEl.classList.add("text-red-400");
      console.error("Login error:", error);
    }
  });
