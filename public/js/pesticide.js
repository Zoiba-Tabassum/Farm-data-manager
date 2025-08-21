// pesticide.js
const tableBody = document.getElementById("preprationTableBody");
const addBtn = document.getElementById("addPreprationBtn");
const searchBtn = document.getElementById("searchFarmerBtn");
const searchInput = document.getElementById("searchFarmerInput");
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

if (role === "field_facilitator") {
  document.getElementById("faciltatorId").classList.add("hidden");
}

// ===== Load Pesticide Data =====
async function loadPesticideData(farmerId = null) {
  try {
    const url = farmerId
      ? `http://localhost:3000/api/pesticide/getpesticideusage/${farmerId}`
      : `http://localhost:3000/api/pesticide/getallpesticideusage`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      alert("No data found");
      loadWaterData();
    }

    const data = await res.json();
    renderRows(Array.isArray(data) ? data : [data]);
  } catch (err) {
    console.error(err);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500 py-3">Failed to load data</td></tr>`;
  }
}

// ===== Render Table Rows =====
function renderRows(rows) {
  tableBody.innerHTML = "";

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-50 group";

    tr.innerHTML = `
      <td class="border px-2 py-2">${row.farmer_id}</td>
      <td class="border px-2 py-2">${row.name}</td>
      <td class="border px-2 py-2">${row.quantity_per_ltr}</td>
      <td class="border px-2 py-2 relative">${row.spray_date?.split("T")[0]}
     
        ${
          role === "field_facilitator"
            ? `
              <div class="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-2">
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
         role === "admin"
           ? `<td class="border px-2 py-2">${row.facilitator_id || "-"}</td>`
           : ""
       }
    `;

    tableBody.appendChild(tr);
  });

  lucide.createIcons();
}

// ===== Add Row =====
addBtn.addEventListener("click", () => {
  const tr = document.createElement("tr");
  tr.className = "bg-green-50";

  tr.innerHTML = `
    <td class="border px-2 py-2"><input id="farmerIdInput" class="border px-2 py-1 rounded w-full"/></td>
    <td class="border px-2 py-2"><input id="pesticideNameInput" class="border px-2 py-1 rounded w-full"/></td>
    <td class="border px-2 py-2"><input id="quantityInput" type="number" class="border px-2 py-1 rounded w-full"/></td>
    <td class="border px-2 py-2"><input type="date" id="dateInput" class="border px-2 py-1 rounded w-full"/></td>
    ${role === "admin" ? `<td class="border px-2 py-2">-</td>` : ""}
    <td class="border px-2 py-2 text-center flex gap-2 justify-center">
      <button class="text-green-600 hover:text-green-800" onclick="saveNewRow(this)">
        <i data-lucide="check"></i>
      </button>
      <button class="text-gray-600 hover:text-gray-800" onclick="this.closest('tr').remove()">
        <i data-lucide="x"></i>
      </button>
    </td>
  `;

  tableBody.prepend(tr);
  lucide.createIcons();
});

// ===== Save New Row =====
async function saveNewRow(btn) {
  const tr = btn.closest("tr");

  const payload = {
    farmer_id: tr.querySelector("#farmerIdInput").value,
    name: tr.querySelector("#pesticideNameInput").value,
    quantity_per_ltr: tr.querySelector("#quantityInput").value,
    spray_date: tr.querySelector("#dateInput").value,
  };

  try {
    const res = await fetch(
      "http://localhost:3000/api/pesticide/addpesticideusage",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error("Failed to add pesticide data");

    loadPesticideData();
  } catch (err) {
    alert("Error adding pesticide data");
    console.error(err);
  }
}

// ===== Edit Row =====
async function editRow(id) {
  const tr = [...tableBody.children].find((row) =>
    row
      .querySelector("button[onclick^='editRow']")
      ?.onclick.toString()
      .includes(`editRow(${id})`)
  );

  const tds = tr.querySelectorAll("td");
  const values = Array.from(tds).map((td) => td.innerText);

  tr.innerHTML = `
    <td class="border px-2 py-2">${values[0]}</td>
    <td class="border px-2 py-2"><input value="${
      values[1]
    }" id="editName" class="border px-2 py-1 rounded w-full"/></td>
    <td class="border px-2 py-2"><input value="${
      values[2]
    }" id="editQuantity" type="number" class="border px-2 py-1 rounded w-full"/></td>
    <td class="border px-2 py-2"><input type="date" value="${
      values[3]
    }" id="editDate" class="border px-2 py-1 rounded w-full"/></td>
    ${role === "admin" ? `<td class="border px-2 py-2">${values[4]}</td>` : ""}
    <td class="border px-2 py-2 flex gap-2 justify-center">
      <button class="text-green-600 hover:text-green-800" onclick="saveEditRow(${id}, this)">
        <i data-lucide="check"></i>
      </button>
      <button class="text-gray-600 hover:text-gray-800" onclick="loadPesticideData()">
        <i data-lucide="x"></i>
      </button>
    </td>
  `;
  lucide.createIcons();
}

// ===== Save Edit Row =====
async function saveEditRow(id, btn) {
  const tr = btn.closest("tr");

  const payload = {
    name: tr.querySelector("#editName").value,
    quantity_per_ltr: tr.querySelector("#editQuantity").value,
    spray_date: tr.querySelector("#editDate").value,
  };

  try {
    const res = await fetch(
      `http://localhost:3000/api/pesticide/updatepesticideusage/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) throw new Error("Failed to update pesticide data");

    loadPesticideData();
  } catch (err) {
    alert("Error updating pesticide data");
    console.error(err);
  }
}

// ===== Delete Row =====
async function deleteRow(id) {
  if (!confirm("Are you sure you want to delete this record?")) return;

  try {
    const res = await fetch(
      `http://localhost:3000/api/pesticide/deletepesticideusage/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) throw new Error("Failed to delete pesticide data");

    loadPesticideData();
  } catch (err) {
    alert("Error deleting pesticide data");
    console.error(err);
  }
}

// ===== Search =====
searchBtn.addEventListener("click", () => {
  const farmerId = searchInput.value.trim();
  if (farmerId) {
    loadPesticideData(farmerId);
  } else {
    loadPesticideData();
  }
});

// ===== Init =====
loadPesticideData();
