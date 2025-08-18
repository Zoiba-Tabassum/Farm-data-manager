document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    console.error("No token found in localStorage");
  }
  if (role === "admin") {
    document.getElementById("addFarmerBtn").classList.add("hidden");
  }

  async function loadFarmers() {
    try {
      const res = await fetch(
        "http://localhost:3000/api/farmer/getallfarmers",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to fetch farmers");
      const farmers = await res.json();

      if (role === "field_facilitator") {
        document.getElementById("faciltatorId").classList.add("hidden");
      }

      const tbody = document.getElementById("farmersTableBody");
      tbody.innerHTML = "";

      // Insert existing farmers
      farmers.forEach((f) => {
        const row = `
  <tr class="group hover:bg-gray-100 transition-all duration-200" data-code="${
    f.code
  }">
    <td class="border border-gray-300 px-4 py-2">${f.id}</td>
    <td class="border border-gray-300 px-4 py-2">${f.name}</td>
    <td class="border border-gray-300 px-4 py-2">${f.cnic}</td>
    <td class="border border-gray-300 px-4 py-2">${f.phone || "-"}</td>
    <td class="border border-gray-300 px-4 py-2">${f.village || "-"}</td>
    <td class="border border-gray-300 px-4 py-2">${f.tehsil || "-"}</td>
    ${
      role === "admin"
        ? `<td class="border border-gray-300 px-4 py-2">${f.facilitator_id}</td>`
        : ""
    }
    <td class="border border-gray-300 px-4 py-2 flex items-center justify-between">
      <span>${f.code}</span>
      ${
        role === "field_facilitator"
          ? `<div class="flex items-center">
              <button 
                class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray hover:text-blue-600"
                onclick="editFarmerRow('${f.code}')"
                title="Edit Farmer"
              >
                <i data-lucide="pencil"></i>
              </button>
              <button 
                class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray hover:text-red-600 ml-2"
                onclick="deleteFarmer('${f.code}')"
                title="Delete Farmer"
              >
                <i data-lucide="trash-2"></i>
              </button>
            </div>`
          : ""
      }
    </td>
  </tr>
`;

        tbody.insertAdjacentHTML("beforeend", row);
      });

      lucide.createIcons();
    } catch (err) {
      console.error(err);
      document.getElementById(
        "farmersTableBody"
      ).innerHTML = `<tr><td colspan="8" class="text-center text-red-500 py-4">Error loading farmers</td></tr>`;
    }
  }

  async function deleteFarmer(code) {
    if (!confirm("Are you sure you want to delete this farmer?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/farmer/deletefarmer/${code}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete farmer");

      alert("Farmer deleted successfully!");
      loadFarmers();
    } catch (err) {
      console.error(err);
      alert("Error deleting farmer");
    }
  }
  function editFarmerRow(code) {
    const row = document.querySelector(
      `#farmersTableBody tr[data-code="${code}"]`
    );
    if (!row) return;

    const cells = row.querySelectorAll("td");
    const id = cells[0].innerText;
    const name = cells[1].innerText;
    const cnic = cells[2].innerText;
    const phone = cells[3].innerText;
    const village = cells[4].innerText;
    const tehsil = cells[5].innerText;

    row.innerHTML = `
    <td class="border border-gray-300 px-4 py-2">${id}</td>
    <td class="border border-gray-300 px-4 py-2"><input type="text" value="${name}" class="w-full border rounded px-2 py-1"/></td>
    <td class="border border-gray-300 px-4 py-2"><input type="text" value="${cnic}" class="w-full border rounded px-2 py-1"/></td>
    <td class="border border-gray-300 px-4 py-2"><input type="text" value="${phone}" class="w-full border rounded px-2 py-1"/></td>
    <td class="border border-gray-300 px-4 py-2"><input type="text" value="${village}" class="w-full border rounded px-2 py-1"/></td>
    <td class="border border-gray-300 px-4 py-2"><input type="text" value="${tehsil}" class="w-full border rounded px-2 py-1"/></td>
    <td class="border border-gray-300 px-4 py-2 flex gap-2">
      <button onclick="saveFarmer('${code}', this)" class="text-green-600 hover:text-green-800" title="Save"><i data-lucide="check"></i></button>
      <button onclick="loadFarmers()" class="text-gray-600 hover:text-gray-800" title="Cancel"><i data-lucide="x"></i></button>
    </td>
  `;
    lucide.createIcons();
  }

  async function addFarmer(newFarmer) {
    if (!newFarmer.name || !newFarmer.cnic || !newFarmer.code) {
      alert("Name, CNIC, and Code are required fields.");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/api/farmer/addfarmer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + token,
        },
        body: JSON.stringify(newFarmer),
      });

      if (!res.ok) throw new Error("Failed to add farmer");

      alert("Farmer added successfully!");
      loadFarmers();
    } catch (err) {
      console.error(err);
      alert("Error adding farmer");
    }
  }
  async function searchFarmerByCode(code) {
    try {
      const res = await fetch(
        `http://localhost:3000/api/farmer/getfarmer/${code}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
        }
      );

      if (!res.ok) throw new Error("Farmer not found");
      const result = await res.json();
      const farmers = result.data || result; // depends on your backend response

      const tbody = document.getElementById("farmersTableBody");
      tbody.innerHTML = "";

      (Array.isArray(farmers) ? farmers : [farmers]).forEach((f) => {
        const row = `
        <tr class="group hover:bg-gray-100 transition-all duration-200" data-code="${
          f.code
        }">
          <td class="border border-gray-300 px-4 py-2">${f.id}</td>
          <td class="border border-gray-300 px-4 py-2">${f.name}</td>
          <td class="border border-gray-300 px-4 py-2">${f.cnic}</td>
          <td class="border border-gray-300 px-4 py-2">${f.phone || "-"}</td>
          <td class="border border-gray-300 px-4 py-2">${f.village || "-"}</td>
          <td class="border border-gray-300 px-4 py-2">${f.tehsil || "-"}</td>
          ${
            role === "admin"
              ? `<td class="border border-gray-300 px-4 py-2">${f.facilitator_id}</td>`
              : ""
          }
          <td class="border border-gray-300 px-4 py-2 flex items-center justify-between">
            <span>${f.code}</span>
            ${
              role === "field_facilitator"
                ? `<div class="flex items-center">
              <button 
                class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray hover:text-blue-600"
                onclick="editFarmerRow('${f.code}')"
                title="Edit Farmer"
              >
                <i data-lucide="pencil"></i>
              </button>
                <button 
                    class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 hover:text-red-800 ml-2"
                    onclick="deleteFarmer('${f.code}')"
                    title="Delete Farmer"
                  >
                    <i data-lucide="trash-2"></i>
                  </button>
                  </div>`
                : ""
            }
          </td>
        </tr>
      `;
        tbody.insertAdjacentHTML("beforeend", row);
      });

      lucide.createIcons();
    } catch (err) {
      console.error(err);
      alert("Farmer not found with this code");
    }
  }
  async function saveFarmer(code, btn) {
    const row = btn.closest("tr");
    const inputs = row.querySelectorAll("input");

    const updatedData = {
      name: inputs[0].value.trim(),
      cnic: inputs[1].value.trim(),
      phone: inputs[2].value.trim(),
      village: inputs[3].value.trim(),
      tehsil: inputs[4].value.trim(),
    };

    try {
      const res = await fetch(
        `http://localhost:3000/api/farmer/updatefarmer/${code}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + token,
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!res.ok) throw new Error("Failed to update farmer");
      alert("Farmer updated successfully!");
      loadFarmers();
    } catch (err) {
      console.error(err);
      alert("Error updating farmer");
    }
  }

  document.getElementById("searchFarmerBtn").addEventListener("click", () => {
    const code = document.getElementById("searchCodeInput").value.trim();
    if (code) searchFarmerByCode(code);
  });

  document
    .getElementById("searchCodeInput")
    .addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        const code = e.target.value.trim();
        if (code) searchFarmerByCode(code);
      }
    });

  // Add button handler
  document.getElementById("addFarmerBtn").addEventListener("click", () => {
    const tbody = document.getElementById("farmersTableBody");

    const inputRow = `
      <tr class="bg-green-50">
        <td class="border px-2 py-1">New</td>
        <td class="border px-2 py-1"><input type="text" id="newName" class="w-full border rounded px-1"></td>
        <td class="border px-2 py-1"><input type="text" id="newCnic" class="w-full border rounded px-1"></td>
        <td class="border px-2 py-1"><input type="text" id="newPhone" class="w-full border rounded px-1"></td>
        <td class="border px-2 py-1"><input type="text" id="newVillage" class="w-full border rounded px-1"></td>
        <td class="border px-2 py-1"><input type="text" id="newTehsil" class="w-full border rounded px-1"></td>
        ${role === "admin" ? `<td class="border px-2 py-1">Auto</td>` : ""}
        <td class="border px-2 py-1 flex items-center gap-2">
          <input type="text" id="newCode" class="w-full border rounded px-1" placeholder="Code">
          <button 
            class="text-green-600 hover:text-green-800"
            id="confirmAddBtn"
            title="Save Farmer"
          >
            <i data-lucide="check"></i>
          </button>
        </td>
      </tr>
    `;
    tbody.insertAdjacentHTML("afterbegin", inputRow);
    lucide.createIcons();

    // Confirm add button event
    document.getElementById("confirmAddBtn").addEventListener("click", () => {
      const newFarmer = {
        name: document.getElementById("newName").value,
        cnic: document.getElementById("newCnic").value,
        phone: document.getElementById("newPhone").value,
        village: document.getElementById("newVillage").value,
        tehsil: document.getElementById("newTehsil").value,
        code: document.getElementById("newCode").value,
      };
      addFarmer(newFarmer);
    });
  });

  // expose globally for inline onclick
  window.deleteFarmer = deleteFarmer;
  window.editFarmerRow = editFarmerRow;
  window.saveFarmer = saveFarmer;
  window.loadFarmers = loadFarmers;
  loadFarmers();
});
