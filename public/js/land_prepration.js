// land_prepration.js

const API_BASE = "http://localhost:3000/api/preparation"; // adjust if needed
const token = localStorage.getItem("token");
const role = localStorage.getItem("role");

const tableHead = document.getElementById("preprationTableHead");
const tableBody = document.getElementById("preprationTableBody");
const searchInput = document.getElementById("searchCodeInput");
const searchBtn = document.getElementById("searchFarmerBtn");
const addBtn = document.getElementById("addPreprationBtn");

// Hide Add button for admins
if (role !== "field_facilitator") {
  addBtn.style.display = "none";
}

// 🔹 API helper
async function apiFetch(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// 🔹 Render table header dynamically
function renderHeader() {
  let headerHTML = `
    <tr>
      <th class="border border-gray-300 px-2 py-1">Farmer ID</th>
      <th class="border border-gray-300 px-2 py-1">Factor</th>
      <th class="border border-gray-300 px-2 py-1">Cost per Acre</th>
  `;

  if (role === "admin") {
    headerHTML += `<th class="border border-gray-300 px-2 py-1">Facilitator ID</th>`;
  }

  tableHead.innerHTML = headerHTML;
}

// 🔹 Render table body
function renderTable(rows) {
  const tableBody = document.getElementById("preprationTableBody");
  if (!tableBody) {
    console.error("Table body element not found!");
    return;
  }

  tableBody.innerHTML = "";
  rows.forEach((row) => {
    const tr = document.createElement("tr");
    tr.className = "group hover:bg-gray-50 transition";

    tr.innerHTML = `
        <td class="border border-gray-300 px-2 py-1">${row.farmer_id}</td>
        <td class="border border-gray-300 px-2 py-1">${row.factor}</td>
        <td class="border border-gray-300 px-2 py-1">
          <div class="flex items-center justify-between">
            <span>${row.cost_per_acre}</span>
            ${
              role === "field_facilitator"
                ? `<div class="flex items-center ml-2">
                    <button 
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray hover:text-blue-600"
                      onclick="editPreparation(${row.id}, '${row.factor}', ${row.cost_per_acre})"
                      title="Edit"
                    >
                      <i data-lucide="pencil"></i>
                    </button>
                    <button 
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-red-600 hover:text-red-800 ml-2"
                      onclick="deletePreparation(${row.id})"
                      title="Delete"
                    >
                      <i data-lucide="trash-2"></i>
                    </button>
                  </div>`
                : ""
            }
          </div>
        </td>
      `;

    tableBody.appendChild(tr);
  });

  lucide.createIcons();
}

// 🔹 Load all records
async function loadPreparations() {
  try {
    const data = await apiFetch(`${API_BASE}/getallpreparations`);
    renderHeader();
    renderTable(data);
  } catch (err) {
    console.error("Load error:", err);
    tableBody.innerHTML =
      '<tr><td colspan="4" class="text-center text-gray-500 py-4">No records found</td></tr>';
  }
}

// 🔹 Search by farmer_id
searchBtn.addEventListener("click", async () => {
  const farmerId = searchInput.value.trim();
  if (!farmerId) return loadPreparations();

  try {
    const data = await apiFetch(`${API_BASE}/getpreparation/${farmerId}`);
    renderHeader();
    renderTable(data);
  } catch (err) {
    console.error("Search error:", err);
    tableBody.innerHTML =
      '<tr><td colspan="4" class="text-center text-gray-500 py-4">No records found</td></tr>';
  }
});

// 🔹 Edit record (facilitator only)
async function editPreparation(id, currentFactor, currentCost) {
  const factor = prompt("Edit Factor:", currentFactor);
  const cost = prompt("Edit Cost per Acre:", currentCost);

  if (!factor || !cost) return;

  try {
    await apiFetch(`${API_BASE}/updatepreparation/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        factor,
        cost_per_acre: parseFloat(cost),
      }),
    });
    loadPreparations();
  } catch (err) {
    alert("Failed to update record");
    console.error(err);
  }
}

// 🔹 Delete record (facilitator only)
async function deletePreparation(id) {
  if (!confirm("Delete this record?")) return;

  try {
    await apiFetch(`${API_BASE}/deletepreparation/${id}`, {
      method: "DELETE",
    });
    loadPreparations();
  } catch (err) {
    alert("Failed to delete record");
    console.error(err);
  }
}
// 🔹 Add new record (facilitator only)
// 🔹 Add new record row (facilitator only)
addBtn.addEventListener("click", () => {
  const tr = document.createElement("tr");
  tr.className = "bg-green-50";

  tr.innerHTML = `
    <td class="border border-gray-300 px-2 py-1">
      <input type="text" id="newFarmerId" class="w-full border px-1 py-0.5 rounded" placeholder="Farmer ID">
    </td>
    <td class="border border-gray-300 px-2 py-1">
      <input type="text" id="newFactor" class="w-full border px-1 py-0.5 rounded" placeholder="Factor">
    </td>
    <td class="border border-gray-300 px-2 py-1">
      <div class="flex items-center justify-between">
        <input type="number" id="newCost" class="w-full border px-1 py-0.5 rounded" placeholder="Cost">
        <div class="flex items-center ml-2">
          <button 
            class="text-green-600 hover:text-green-800 ml-1"
            onclick="saveNewPreparation(this)"
            title="Save"
          >
            <i data-lucide="check"></i>
          </button>
          <button 
            class="text-red-600 hover:text-red-800 ml-2"
            onclick="cancelNewPreparation(this)"
            title="Cancel"
          >
            <i data-lucide="x"></i>
          </button>
        </div>
      </div>
    </td>
    ${role === "admin" ? `<td></td>` : ""}
  `;

  // Insert at top of body
  tableBody.prepend(tr);
  lucide.createIcons();
});

// 🔹 Save new preparation
async function saveNewPreparation(btn) {
  const farmer_id = document.getElementById("newFarmerId").value.trim();
  const factor = document.getElementById("newFactor").value.trim();
  const cost = document.getElementById("newCost").value.trim();

  if (!farmer_id || !factor || !cost) {
    return alert("All fields required!");
  }

  try {
    await apiFetch(`${API_BASE}/addpreparation`, {
      method: "POST",
      body: JSON.stringify({
        farmer_id,
        factor,
        cost_per_acre: parseFloat(cost),
      }),
    });
    loadPreparations();
  } catch (err) {
    alert("Failed to add record");
    console.error(err);
  }
}

// 🔹 Cancel add row
function cancelNewPreparation(btn) {
  const row = btn.closest("tr");
  row.remove();
}

// Expose to global
window.editPreparation = editPreparation;
window.deletePreparation = deletePreparation;
window.saveNewPreparation = saveNewPreparation;
window.cancelNewPreparation = cancelNewPreparation;

// 🔹 Init
loadPreparations();
