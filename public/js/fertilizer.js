document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("preprationTableBody"); // Fixed ID
  const searchInput = document.getElementById("searchFarmerInput");
  const searchBtn = document.getElementById("searchFarmerBtn");
  const addBtn = document.getElementById("addBtn"); // Now matches HTML

  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (userRole === "admin") addBtn.classList.add("hidden");
  if (userRole === "field_facilitator")
    document.getElementById("faciltatorId").classList.add("hidden");

  if (!token) {
    console.error("No token found in localStorage");
    return;
  }

  // Load all fertilizer data
  async function loadFertilizerData() {
    try {
      const res = await fetch(
        "http://localhost:3000/api/fertilizer/getallfertilizerdata",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch fertilizer data");
      }

      const data = await res.json();
      renderTable(data);
    } catch (error) {
      console.log(error);
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-3">Failed to load fertilizer data</td></tr>`;
    }
  }

  // Render table rows
  function renderTable(data) {
    tableBody.innerHTML = "";

    if (!data || data.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="6" class="text-center py-3 text-gray-500">No records found</td></tr>';
      return;
    }

    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.classList.add("group"); // for hover effect

      tr.innerHTML = `
        <td class="border border-gray-300 px-2 sm:px-4 py-2">${
          row.farmer_id
        }</td>
        <td class="border border-gray-300 px-2 sm:px-4 py-2">${
          row.type === "natural" ? "Organic" : "Synthetic"
        }</td>
        <td class="border border-gray-300 px-2 sm:px-4 py-2">${row.name}</td>
        <td class="border border-gray-300 px-2 sm:px-4 py-2">${
          row.quantity
        }</td>
        <td class="border border-gray-300 px-2 sm:px-4 py-2 relative">
          ${row.cost_per_acre}
          ${
            userRole === "field_facilitator"
              ? `
                <div class="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-2 bg-white px-1">
                  <button class="text-blue-600 hover:text-blue-800" onclick="editRow(${row.id})">
                    <i data-lucide="pencil"></i>
                  </button>
                  <button class="text-red-600 hover:text-red-800" onclick="deleteRow(${row.id})">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              `
              : ""
          }
        </td>
        ${
          userRole === "admin"
            ? `<td class="border px-2 py-2">${row.facilitator_id || "-"}</td>`
            : ""
        }
      `;

      tableBody.appendChild(tr);
    });

    lucide.createIcons();
  }

  // Add new row
  addBtn.addEventListener("click", () => {
    const tr = document.createElement("tr");
    tr.classList.add("bg-yellow-50");

    tr.innerHTML = `
      <td class="border px-2 py-1"><input type="text" class="border px-2 py-1 w-full" placeholder="Farmer ID"></td>
      <td class="border px-2 py-1">
        <select class="border px-2 py-1 w-full">
          <option value="Natural">Organic</option>
          <option value="Synthetic">Synthetic</option>
        </select>
      </td>
      <td class="border px-2 py-1"><input type="text" class="border px-2 py-1 w-full" placeholder="Name"></td>
      <td class="border px-2 py-1"><input type="number" class="border px-2 py-1 w-full" placeholder="Quantity"></td>
      <td class="border px-2 py-1 relative">
        <input type="number" class="border px-2 py-1 w-full" placeholder="Cost">
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 bg-white px-1">
          <button class="text-green-600 hover:text-green-800" onclick="saveNewRow(this)">
            <i data-lucide="check"></i>
          </button>
          <button class="text-red-600 hover:text-red-800" onclick="cancelNewRow(this)">
            <i data-lucide="x"></i>
          </button>
        </div>
      </td>
      ${userRole === "admin" ? `<td class="border px-2 py-1">-</td>` : ""}
    `;

    tableBody.prepend(tr);
    lucide.createIcons();
  });

  // Save new row
  window.saveNewRow = async function (btn) {
    const tr = btn.closest("tr");
    const inputs = tr.querySelectorAll("input, select");
    const [farmerId, type, name, quantity, cost] = [...inputs].map(
      (i) => i.value
    );

    try {
      const res = await fetch(
        "http://localhost:3000/api/fertilizer/addfertilizerusage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            farmer_id: farmerId,
            type,
            name,
            quantity: quantity,
            cost_per_acre: cost,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to add fertilizer");

      loadFertilizerData();
    } catch (err) {
      console.error(err);
      alert("Error adding fertilizer data");
    }
  };

  // Cancel add row
  window.cancelNewRow = function (btn) {
    btn.closest("tr").remove();
  };

  // Edit row
  window.editRow = function (id) {
    const tr = [...tableBody.querySelectorAll("tr")].find((row) =>
      row.innerHTML.includes(`editRow(${id})`)
    );

    const cells = tr.querySelectorAll("td");
    const farmerId = cells[0].textContent.trim();
    const type = cells[1].textContent.trim();
    const name = cells[2].textContent.trim();
    const quantity = cells[3].textContent.trim();
    const cost = cells[4].textContent.trim();

    tr.innerHTML = `
      <td class="border px-2 py-1">${farmerId}</td>
      <td class="border px-2 py-1">
        <select class="border px-2 py-1 w-full">
          <option value="Natural" ${
            type === "Natural" ? "selected" : ""
          }>Organic</option>
          <option value="Synthetic" ${
            type === "Synthetic" ? "selected" : ""
          }>Synthetic</option>
        </select>
      </td>
      <td class="border px-2 py-1"><input type="text" value="${name}" class="border px-2 py-1 w-full"></td>
      <td class="border px-2 py-1"><input type="number" value="${quantity}" class="border px-2 py-1 w-full"></td>
      <td class="border px-2 py-1 relative">
        <input type="number" value="${cost}" class="border px-2 py-1 w-full">
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2 bg-white px-1">
          <button class="text-green-600 hover:text-green-800" onclick="saveEditRow(${id}, this)">
            <i data-lucide="check"></i>
          </button>
          <button class="text-red-600 hover:text-red-800" onclick="cancelEditRow(${id})">
            <i data-lucide="x"></i>
          </button>
        </div>
      </td>
      ${userRole === "admin" ? `<td class="border px-2 py-1">-</td>` : ""}
    `;

    lucide.createIcons();
  };

  // Save edit
  window.saveEditRow = async function (id, btn) {
    const tr = btn.closest("tr");
    const inputs = tr.querySelectorAll("input, select");
    const [type, name, quantity, cost] = [...inputs].map((i) => i.value);

    try {
      const res = await fetch(
        `http://localhost:3000/api/fertilizer/updatefertilizerdata/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            type,
            name,
            quantity: quantity,
            cost_per_acre: cost,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to update fertilizer");

      loadFertilizerData();
    } catch (err) {
      console.error(err);
      alert("Error updating fertilizer data");
    }
  };

  // Cancel edit
  window.cancelEditRow = function () {
    loadFertilizerData();
  };

  // Delete row
  window.deleteRow = async function (id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/fertilizer/deletefertilizerdata/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Failed to delete fertilizer");

      loadFertilizerData();
    } catch (err) {
      console.error(err);
      alert("Error deleting fertilizer data");
    }
  };

  // Search by farmer_id
  searchBtn.addEventListener("click", () => {
    const filter = searchInput.value.trim().toLowerCase();
    if (!filter) {
      loadFertilizerData();
      return;
    }

    const rows = tableBody.querySelectorAll("tr");
    rows.forEach((row) => {
      const farmerIdCell = row.querySelector("td:first-child");
      if (farmerIdCell) {
        const farmerId = farmerIdCell.textContent.trim().toLowerCase();
        row.style.display = farmerId.includes(filter) ? "" : "none";
      }
    });
  });

  // Initial load
  loadFertilizerData();
});
