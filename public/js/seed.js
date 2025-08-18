// seed.js

let role = localStorage.getItem("role"); // assume you store role in localStorage after login
let token = localStorage.getItem("token");
const tableHead = document.getElementById("preprationTableHead");
const tableBody = document.getElementById("preprationTableBody");
const addBtn = document.getElementById("addPreprationBtn");

// Render table header dynamically
function renderHeader() {
  let headerHTML = `
    <tr>
      <th class="border border-gray-300 px-2 sm:px-4 py-2">Farmer ID</th>
      <th class="border border-gray-300 px-2 sm:px-4 py-2">Variety</th>
      <th class="border border-gray-300 px-2 sm:px-4 py-2">Area (Acres)</th>
      <th class="border border-gray-300 px-2 sm:px-4 py-2">Seed per Acre</th>
      <th class="border border-gray-300 px-2 sm:px-4 py-2">Price per Kg</th>
      ${
        role === "admin"
          ? `<th class="border border-gray-300 px-2 sm:px-4 py-2">Facilitator ID</th>`
          : ""
      }
    </tr>
  `;
  tableHead.innerHTML = headerHTML;
}

// Fetch seed data
async function loadSeedData() {
  try {
    const res = await fetch("http://localhost:3000/api/seed/getallseeddata", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch seed data");
    const data = await res.json();
    renderRows(data);
  } catch (err) {
    console.error("Load error:", err);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500">Failed to load data</td></tr>`;
  }
}

// Render rows
function renderRows(data) {
  tableBody.innerHTML = "";
  data.forEach((row) => {
    let tr = document.createElement("tr");
    tr.classList.add("group");

    tr.innerHTML = `
      <td class="border border-gray-300 px-2 py-2">${row.farmer_id}</td>
      <td class="border border-gray-300 px-2 py-2">${row.variety_name}</td>
      <td class="border border-gray-300 px-2 py-2">${row.acres}</td>
      <td class="border border-gray-300 px-2 py-2">${row.seed_per_acre}</td>
      <td class="border border-gray-300 px-2 py-2 flex justify-between items-center">
        ${row.price_per_kg}
        ${
          role === "field_facilitator"
            ? `<span class="flex items-center ml-2">
              <button onclick="editRow(${row.id})" class="opacity-0 group-hover:opacity-100 text-gray hover:text-blue-600 mr-2"><i data-lucide="pencil"></i></button>
              <button onclick="deleteRow(${row.id})" class="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800"><i data-lucide="trash-2"></i></button>
            </span>`
            : ""
        }
      </td>
      ${
        role === "admin"
          ? `<td class="border border-gray-300 px-2 py-2">${
              row.facilitator_id || "-"
            }</td>`
          : ""
      }
    `;
    tableBody.appendChild(tr);
  });
  lucide.createIcons();
}

// Add new row (inline form)
function addNewRow() {
  let tr = document.createElement("tr");
  tr.innerHTML = `
    <td class="border bg-green-50 px-2 py-2"><input id="newFarmerId" class="border px-2 py-1 rounded w-full"/></td>
    <td class="border bg-green-50  px-2 py-2"><input id="newVariety" class="border px-2 py-1 rounded w-full"/></td>
    <td class="border bg-green-50 px-2 py-2"><input id="newAcres" class="border px-2 py-1 rounded w-full" type="number"/></td>
    <td class="border bg-green-50  px-2 py-2"><input id="newSeedPerAcre" class="border px-2 py-1 rounded w-full" type="number"/></td>
    <td class="border bg-green-50 px-2 py-2 flex justify-between items-center">
      <input id="newPrice" class="border px-2 py-1 rounded w-full" type="number"/>
      <button onclick="confirmAdd()" class="text-green-600 ml-2"><i data-lucide="check"></i></button>
      <button onclick="cancelAdd(this)" class="text-red-600 ml-2"><i data-lucide="x"></i></button>
    </td>
  `;
  tableBody.prepend(tr);
  lucide.createIcons();
}

function cancelAdd(btn) {
  btn.closest("tr").remove();
}

// Confirm add
async function confirmAdd() {
  const farmer_id = document.getElementById("newFarmerId").value;
  const variety_name = document.getElementById("newVariety").value;
  const acres = document.getElementById("newAcres").value;
  const seed_per_acre = document.getElementById("newSeedPerAcre").value;
  const price_per_kg = document.getElementById("newPrice").value;

  try {
    const res = await fetch("http://localhost:3000/api/seed/addseeddata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        farmer_id,
        variety_name,
        acres,
        seed_per_acre,
        price_per_kg,
      }),
    });

    if (!res.ok) throw new Error("Failed to add data");
    await loadSeedData();
  } catch (err) {
    alert("Error adding data: " + err.message);
  }
}

// Edit row
function editRow(id) {
  const tr = [...tableBody.children].find((r) =>
    r.innerHTML.includes(`editRow(${id})`)
  );
  const cells = tr.querySelectorAll("td");
  const values = [...cells].map((c) => c.innerText.trim());

  tr.innerHTML = `
    <td class="border px-2 py-2"><input value="${values[0]}" disabled class="bg-gray-100 px-2 py-1 rounded w-full"/></td>
    <td class="border px-2 py-2"><input id="editVariety" value="${values[1]}" class="border px-2 py-1 rounded w-full"/></td>
    <td class="border px-2 py-2"><input id="editAcres" value="${values[2]}" type="number" class="border px-2 py-1 rounded w-full"/></td>
    <td class="border px-2 py-2"><input id="editSeedPerAcre" value="${values[3]}" type="number" class="border px-2 py-1 rounded w-full"/></td>
    <td class="border px-2 py-2 flex justify-between items-center">
      <input id="editPrice" value="${values[4]}" type="number" class="border px-2 py-1 rounded w-full"/>
      <button onclick="confirmEdit(${id})" class="text-green-600 ml-2"><i data-lucide="check"></i></button>
      <button onclick="loadSeedData()" class="text-red-600 ml-2"><i data-lucide="x"></i></button>
    </td>
  `;
  lucide.createIcons();
}

async function confirmEdit(id) {
  const variety_name = document.getElementById("editVariety").value;
  const acres = document.getElementById("editAcres").value;
  const seed_per_acre = document.getElementById("editSeedPerAcre").value;
  const price_per_kg = document.getElementById("editPrice").value;

  try {
    const res = await fetch(
      `http://localhost:3000/api/seed/updateseeddata/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          variety_name,
          acres,
          seed_per_acre,
          price_per_kg,
        }),
      }
    );

    if (!res.ok) throw new Error("Failed to update");
    await loadSeedData();
  } catch (err) {
    alert("Error updating data: " + err.message);
  }
}

// Delete row
async function deleteRow(id) {
  if (!confirm("Are you sure you want to delete this entry?")) return;

  try {
    const res = await fetch(
      `http://localhost:3000/api/seed/deleteseeddata/${id}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("Failed to delete");
    await loadSeedData();
  } catch (err) {
    alert("Error deleting data: " + err.message);
  }
}
// Search by farmer_id
async function searchSeedByFarmer() {
  const farmerId = document.getElementById("searchFarmerInput").value.trim();
  if (!farmerId) {
    alert("Please enter Farmer ID");
    return;
  }

  try {
    const res = await fetch(
      `http://localhost:3000/api/seed/getseeddata/${farmerId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!res.ok) throw new Error("No data found for this Farmer ID");
    const data = await res.json();
    // ensure array format
    renderRows(Array.isArray(data) ? data : [data]);
  } catch (err) {
    console.error("Search error:", err);
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500">No records found</td></tr>`;
  }
}
document
  .getElementById("searchFarmerBtn")
  .addEventListener("click", searchSeedByFarmer);

// Init
renderHeader();
loadSeedData();

// Show add button only for facilitators
if (role === "field_facilitator") {
  addBtn.classList.remove("hidden");
  addBtn.addEventListener("click", addNewRow);
} else {
  addBtn.classList.add("hidden");
}
