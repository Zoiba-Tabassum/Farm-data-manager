// cotton.js
document.addEventListener("DOMContentLoaded", () => {
  const API_BASE = "http://localhost:3000/api/cotton";

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const tableBody = document.getElementById("cottonTableBody");
  const searchInput = document.getElementById("searchFarmerInput");
  const searchBtn = document.getElementById("searchFarmerBtn");
  const addBtn = document.getElementById("addBtn");

  if (!token) {
    alert("You must be logged in!");
    return;
  }

  // Hide facilitator column for non-admins
  if (role !== "admin") {
    const facHeader = document.getElementById("faciltatorId");
    if (facHeader) facHeader.classList.add("hidden");
  }

  // Hide Add button for non-facilitators
  if (role !== "field_facilitator" && addBtn) {
    addBtn.style.display = "none";
  }

  // ---- API helper ----
  async function apiFetch(url, options = {}) {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      let msg = "Request failed";
      try {
        msg = (await res.json()).message || msg;
      } catch (_) {
        try {
          msg = await res.text();
        } catch (_) {}
      }
      throw new Error(msg);
    }
    return res.json();
  }

  // ---- Render table ----
  function renderTable(rows) {
    if (!tableBody) return;
    tableBody.innerHTML = "";

    if (!rows || rows.length === 0) {
      tableBody.innerHTML =
        '<tr><td colspan="8" class="text-center text-gray-500 py-4">No records found</td></tr>';
      return;
    }

    rows.forEach((row) => {
      const tr = document.createElement("tr");
      tr.className = "group hover:bg-gray-50 transition";

      tr.innerHTML = `
        <td class="border border-gray-300 px-2 py-1">${row.farmer_id}</td>
        <td class="border border-gray-300 px-2 py-1">${row.average}</td>
        <td class="border border-gray-300 px-2 py-1">${row.total}</td>
        <td class="border border-gray-300 px-2 py-1">${row.rate}</td>
        <td class="border border-gray-300 px-2 py-1">${row.total_earning}</td>
        <td class="border border-gray-300 px-2 py-1">${row.total_cost}</td>
        <td class="border border-gray-300 px-2 py-1">
          <div class="flex items-center justify-between">
            <span>${row.buyer_name ?? "-"}</span>
            ${
              role === "field_facilitator"
                ? `<div class="flex items-center ml-2">
                    <button
                      class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray hover:text-blue-600"
                      onclick='editPreparation(this.closest("tr"), ${JSON.stringify(
                        row
                      ).replace(/'/g, "\\'")})'
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
        ${
          role === "admin"
            ? `<td class="border border-gray-300 px-2 py-1">${
                row.facilitator_id ?? "-"
              }</td>`
            : ""
        }
      `;

      tableBody.appendChild(tr);
    });

    if (window.lucide) lucide.createIcons();
  }

  // ---- Load all ----
  async function loadPreparations() {
    try {
      const data = await apiFetch(`${API_BASE}/getallcottonpicking`);
      renderTable(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load error:", err);
      tableBody.innerHTML =
        '<tr><td colspan="8" class="text-center text-gray-500 py-4">No records found</td></tr>';
    }
  }

  // ---- Search by farmer_id ----
  searchBtn?.addEventListener("click", async () => {
    const farmerId = searchInput.value.trim();
    if (!farmerId) return loadPreparations();

    try {
      const data = await apiFetch(
        `${API_BASE}/getcottonpickingdata/${farmerId}`
      );
      renderTable(Array.isArray(data) ? data : [data]);
    } catch (err) {
      console.error("Search error:", err);
      tableBody.innerHTML =
        '<tr><td colspan="8" class="text-center text-gray-500 py-4">No records found</td></tr>';
    }
  });

  // ---- Inline Edit ----
  function editPreparation(tr, row) {
    tr.innerHTML = `
      <td class="border border-gray-300 px-2 py-1">${row.farmer_id}</td>
      <td class="border border-gray-300 px-2 py-1">
        <input type="text" id="editAverage" value="${
          row.average ?? ""
        }" class="w-full border px-1 py-0.5 rounded">
      </td>
      <td class="border border-gray-300 px-2 py-1">
        <input type="number" id="editTotal" value="${
          row.total ?? ""
        }" class="w-full border px-1 py-0.5 rounded">
      </td>
      <td class="border border-gray-300 px-2 py-1">
        <input type="text" id="editRate" value="${
          row.rate ?? ""
        }" class="w-full border px-1 py-0.5 rounded">
      </td>
      <td class="border border-gray-300 px-2 py-1">
        <input type="text" id="editEarning" value="${
          row.total_earning ?? ""
        }" class="w-full border px-1 py-0.5 rounded">
      </td>
      <td class="border border-gray-300 px-2 py-1">
        <input type="text" id="editCost" value="${
          row.total_cost ?? ""
        }" class="w-full border px-1 py-0.5 rounded">
      </td>
      <td class="border border-gray-300 px-2 py-1">
        <div class="flex items-center justify-between">
          <input type="text" id="editBuyer" value="${
            row.buyer_name ?? ""
          }" class="w-full border px-1 py-0.5 rounded">
          <div class="flex items-center ml-2">
            <button
              class="text-green-600 hover:text-green-800 ml-1"
              onclick="saveEditPreparation(${row.id}, this)"
              title="Save"
            >
              <i data-lucide="check"></i>
            </button>
            <button
              class="text-red-600 hover:text-red-800 ml-2"
              onclick="cancelEditPreparation()"
              title="Cancel"
            >
              <i data-lucide="x"></i>
            </button>
          </div>
        </div>
      </td>
      ${
        role === "admin"
          ? `<td class="border border-gray-300 px-2 py-1">${
              row.facilitator_id ?? "-"
            }</td>`
          : ""
      }
    `;
    if (window.lucide) lucide.createIcons();
  }

  async function saveEditPreparation(id, btn) {
    const tr = btn.closest("tr");
    const average = tr.querySelector("#editAverage").value.trim();
    const total = tr.querySelector("#editTotal").value.trim();
    const rate = tr.querySelector("#editRate").value.trim();
    const total_earning = tr.querySelector("#editEarning").value.trim();
    const total_cost = tr.querySelector("#editCost").value.trim();
    const buyer_name = tr.querySelector("#editBuyer").value.trim();

    if (
      !average ||
      !total ||
      !rate ||
      !total_earning ||
      !total_cost ||
      !buyer_name
    ) {
      return alert("All fields required!");
    }

    try {
      await apiFetch(`${API_BASE}/updatecottonpickingdata/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          average,
          total: parseFloat(total),
          rate,
          total_earning,
          total_cost,
          buyer_name,
        }),
      });
      loadPreparations();
    } catch (err) {
      alert("Failed to update record");
      console.error(err);
    }
  }

  function cancelEditPreparation() {
    loadPreparations();
  }

  // ---- Delete ----
  async function deletePreparation(id) {
    if (!confirm("Delete this record?")) return;

    try {
      await apiFetch(`${API_BASE}/deletecottonpickingdata/${id}`, {
        method: "DELETE",
      });
      loadPreparations();
    } catch (err) {
      alert("Failed to delete record");
      console.error(err);
    }
  }

  // ---- Add new row (inline) ----
  addBtn?.addEventListener("click", () => {
    const tr = document.createElement("tr");
    tr.className = "bg-green-50";

    tr.innerHTML = `
      <td class="border border-gray-300 px-2 py-1">
        <input type="text" id="newFarmerId" class="w-full border px-1 py-0.5 rounded" placeholder="Farmer ID">
      </td>
      <td class="border border-gray-300 px-2 py-1">
        <input type="text" id="newAverage" class="w-full border px-1 py-0.5 rounded" placeholder="Average">
      </td>
      <td class="border border-gray-300 px-2 py-1">
        <input type="number" id="newTotal" class="w-full border px-1 py-0.5 rounded" placeholder="Total">
      </td>
      <td class="border border-gray-300 px-2 py-1">
        <input type="text" id="newRate" class="w-full border px-1 py-0.5 rounded" placeholder="Rate">
      </td>
      <td class="border border-gray-300 px-2 py-1">
        <input type="text" id="newEarning" class="w-full border px-1 py-0.5 rounded" placeholder="Total Earning">
      </td>
      <td class="border border-gray-300 px-2 py-1">
        <input type="text" id="newCost" class="w-full border px-1 py-0.5 rounded" placeholder="Total Cost">
      </td>
      <td class="border border-gray-300 px-2 py-1">
        <div class="flex items-center justify-between">
          <input type="text" id="newBuyer" class="w-full border px-1 py-0.5 rounded" placeholder="Buyer">
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
      ${
        role === "admin"
          ? `<td class="border border-gray-300 px-2 py-1">-</td>`
          : ""
      }
    `;

    tableBody.prepend(tr);
    if (window.lucide) lucide.createIcons();
  });

  async function saveNewPreparation(btn) {
    const tr = btn.closest("tr");
    const farmer_id = tr.querySelector("#newFarmerId").value.trim();
    const average = tr.querySelector("#newAverage").value.trim();
    const total = tr.querySelector("#newTotal").value.trim();
    const rate = tr.querySelector("#newRate").value.trim();
    const total_earning = tr.querySelector("#newEarning").value.trim();
    const total_cost = tr.querySelector("#newCost").value.trim();
    const buyer_name = tr.querySelector("#newBuyer").value.trim();

    if (
      !farmer_id ||
      !average ||
      !total ||
      !rate ||
      !total_earning ||
      !total_cost ||
      !buyer_name
    ) {
      return alert("All fields required!");
    }

    try {
      await apiFetch(`${API_BASE}/addcottonpickingdata`, {
        method: "POST",
        body: JSON.stringify({
          farmer_id,
          average,
          total: parseFloat(total),
          rate,
          total_earning,
          total_cost,
          buyer_name,
        }),
      });
      loadPreparations();
    } catch (err) {
      alert("Failed to add record");
      console.error(err);
    }
  }

  function cancelNewPreparation(btn) {
    btn.closest("tr").remove();
  }

  // ---- Expose globals for inline handlers ----
  window.editPreparation = editPreparation;
  window.saveEditPreparation = saveEditPreparation;
  window.cancelEditPreparation = cancelEditPreparation;
  window.deletePreparation = deletePreparation;
  window.saveNewPreparation = saveNewPreparation;
  window.cancelNewPreparation = cancelNewPreparation;

  // ---- Initial load ----
  loadPreparations();
});
