document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const dropdownBtn = document.getElementById("roleDropdownBtn");
  const dropdownMenu = document.getElementById("roleDropdownMenu");
  const selectedRole = document.getElementById("selectedRole");
  const tableBody = document.getElementById("usersTableBody"); // tbody id in HTML
  const searchInput = document.getElementById("searchCodeInput");
  const searchBtn = document.getElementById("searchFarmerBtn");
  const addBtn = document.getElementById("addBtn"); // button "ADD NEW USER"
  const signupContainer = document.getElementById("signup");
  const signupForm = document.getElementById("signupForm");

  //------------------------
  // SHOW SIGNUP FORM
  //------------------------
  addBtn.addEventListener("click", () => {
    signupContainer.classList.remove("hidden");
    signupContainer.scrollIntoView({ behavior: "smooth" });
  });

  //------------------------
  // DROPDOWN HANDLER
  //------------------------
  dropdownBtn.addEventListener("click", () => {
    dropdownMenu.classList.toggle("hidden");
  });

  dropdownMenu.querySelectorAll("div").forEach((option) => {
    option.addEventListener("click", () => {
      selectedRole.textContent = option.textContent;
      dropdownMenu.classList.add("hidden");
      dropdownBtn.setAttribute("data-value", option.getAttribute("data-value"));
    });
  });

  document.addEventListener("click", (e) => {
    if (!dropdownBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
      dropdownMenu.classList.add("hidden");
    }
  });

  //------------------------
  // SUBMIT SIGNUP FORM
  //------------------------
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
      name: signupForm.querySelector("input[placeholder='Full Name']").value,
      user_name: signupForm.querySelector("input[placeholder='User_name']")
        .value,
      phone: signupForm.querySelector("input[placeholder='Phone']").value,
      role: dropdownBtn.getAttribute("data-value"),
      village: signupForm.querySelector("input[placeholder='Village']").value,
      tehsil: signupForm.querySelector("input[placeholder='Tehsil']").value,
      password: signupForm.querySelector("input[placeholder='Password']").value,
    };

    try {
      const res = await fetch("http://localhost:3000/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ " + data.message);
        signupForm.reset();
        selectedRole.textContent = "Select Role";
        dropdownBtn.setAttribute("data-value", "");
        signupContainer.classList.add("hidden"); // hide after success
      } else {
        alert("❌ " + (data.error || "Something went wrong"));
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("❌ Failed to connect to server.");
    }
    loadUsers();
  });
  //------------------------
  // RENDER ROW
  //------------------------
  function renderRow(user, index) {
    const row = document.createElement("tr");
    row.className = "group border-b hover:bg-gray-100 transition duration-150";

    row.innerHTML = `
      <td class="px-4 py-2 text-center">${user.id}</td>
      <td class="px-4 py-2">${user.name}</td>
      <td class="px-4 py-2">${user.phone}</td>
      <td class="px-4 py-2">${user.user_name}</td>
     <td class="px-4 py-2">
  ${user.role === "admin" ? "Admin" : "Field Facilitator"}
</td>
      <td class="px-4 py-2">${user.village || "-"}</td>
      <td class="px-4 py-2 flex items-center justify-between">
        <span>${user.tehsil || "-"}</span>
        <button 
          class="delete-btn hidden group-hover:inline-block text-red-600 hover:text-red-800 ml-2" 
          data-username="${user.user_name}">
          <i data-lucide="trash-2"></i>
        </button>
      </td>
    `;

    return row;
  }

  //------------------------
  // FETCH ALL USERS
  //------------------------
  async function loadUsers() {
    try {
      const res = await fetch("http://localhost:3000/api/users/get", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        alert("❌ " + (data.message || "Failed to load users"));
        return;
      }

      tableBody.innerHTML = "";
      data.data.forEach((user, index) => {
        tableBody.appendChild(renderRow(user, index));
      });

      lucide.createIcons();
      attachDeleteHandlers();
    } catch (err) {
      console.error("Error loading users:", err);
      alert("❌ Server error while fetching users.");
    }
  }

  //------------------------
  // FETCH SINGLE USER BY USERNAME
  //------------------------
  async function searchUser(username) {
    if (!username) {
      loadUsers(); // fallback to all users
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/users/getuser/${username}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert("❌ " + (data.message || "User not found"));
        return;
      }

      // clear table & show only searched user
      tableBody.innerHTML = "";
      tableBody.appendChild(renderRow(data.data, 0));

      lucide.createIcons();
      attachDeleteHandlers();
    } catch (err) {
      console.error("Error searching user:", err);
      alert("❌ Server error while searching user.");
    }
  }

  //------------------------
  // DELETE HANDLER
  //------------------------
  function attachDeleteHandlers() {
    document.querySelectorAll(".delete-btn").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        const username = btn.getAttribute("data-username");
        if (!confirm(`Are you sure you want to delete "${username}"?`)) return;

        try {
          const res = await fetch(
            `http://localhost:3000/api/users/delete/${username}`,
            {
              method: "DELETE",
              headers: {
                Authorization: "Bearer " + token,
              },
            }
          );

          const data = await res.json();
          if (res.ok) {
            alert("✅ " + data.message);
            btn.closest("tr").remove();
          } else {
            alert("❌ " + (data.message || "Failed to delete user"));
          }
        } catch (err) {
          console.error("Error deleting user:", err);
          alert("❌ Server error while deleting user.");
        }
      });
    });
  }

  searchBtn.addEventListener("click", () => {
    const username = searchInput.value.trim();
    searchUser(username);
  });

  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const username = searchInput.value.trim();
      searchUser(username);
    }
  });

  // Call on load
  loadUsers();
});
