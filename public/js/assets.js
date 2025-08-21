document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    console.error("No token found in localStorage");
  }
  if (role === "admin") {
    document.getElementById("action").classList.add("hidden");
  }

  // ===== Helpers =====
  const api = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `HTTP ${res.status}`);
    }
    try {
      return await res.json();
    } catch {
      return {};
    }
  };

  const byId = (id) => document.getElementById(id);

  const setFarmFieldsDisabled = (disabled) => {
    ["f_area", "f_soil", "f_irrigation"].forEach((id) => {
      const el = byId(id);
      el.disabled = disabled;
      el.classList.toggle("bg-gray-100", disabled);
    });
  };

  const clearFarmFields = () => {
    byId("f_farmer_id").value = "";
    byId("f_area").value = "";
    byId("f_soil").value = "";
    byId("f_irrigation").value = "";
  };

  const clearLivestockTable = () => {
    byId("livestockTbody").innerHTML = "";
  };

  const addLivestockRow = (animal = {}) => {
    const tbody = byId("livestockTbody");
    const rowId = "row_" + Math.random().toString(36).slice(2, 9);
    const html = `
      <tr id="${rowId}">
        <td class="border px-2 py-2">
          <input type="text" class="w-full border rounded px-2 py-1" data-key="animal_type" placeholder="e.g. Cow" value="${
            animal.animal_type || ""
          }">
        </td>
        <td class="border px-2 py-2">
          <input type="number" class="w-full border rounded px-2 py-1" data-key="quantity" placeholder="0" value="${
            animal.quantity ?? ""
          }">
        </td>
        <td class="border px-2 py-2 text-center">
          <input type="checkbox" data-key="shelter" ${toChecked(
            animal.shelter
          )}>
        </td>
        <td class="border px-2 py-2 text-center">
          <input type="checkbox" data-key="clean_water" ${toChecked(
            animal.clean_water
          )}>
        </td>
        <td class="border px-2 py-2 text-center">
          <input type="checkbox" data-key="trained" ${toChecked(
            animal.trained
          )}>
        </td>
        <td class="border px-2 py-2 text-center">
          <input type="checkbox" data-key="vaccinated" ${toChecked(
            animal.vaccinated
          )}>
        </td>
        <td class="border px-2 py-2 text-center">
          <button class="text-red-600 hover:text-red-700" data-action="remove-row"><i data-lucide="trash-2"></i></button>
        </td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", html);
    lucide.createIcons();
  };

  const toChecked = (v) => (Number(v) === 1 || v === true ? "checked" : "");

  const readLivestockFromModal = () => {
    const rows = byId("livestockTbody").querySelectorAll("tr");
    const animals = [];
    rows.forEach((tr) => {
      const inputs = tr.querySelectorAll("input");
      const obj = {
        animal_type: "",
        quantity: 0,
        shelter: 0,
        clean_water: 0,
        trained: 0,
        vaccinated: 0,
      };
      inputs.forEach((el) => {
        const key = el.getAttribute("data-key");
        if (!key) return;
        if (el.type === "checkbox") {
          obj[key] = el.checked ? 1 : 0;
        } else if (el.type === "number") {
          obj[key] = Number(el.value) || 0;
        } else {
          obj[key] = el.value.trim();
        }
      });
      // ignore empty animals
      if (obj.animal_type) animals.push(obj);
    });
    return animals;
  };

  const openModal = (title) => {
    byId("modalTitle").textContent = title;
    byId("assetModal").classList.remove("hidden");
    byId("assetModal").classList.add("flex");
  };

  const closeModal = () => {
    byId("assetModal").classList.add("hidden");
    byId("assetModal").classList.remove("flex");
  };

  // Modal state
  let modalMode = "add"; // 'add' | 'edit'
  let editingFarmerId = null;

  // ===== Load & Render Table =====
  async function loadAssets() {
    try {
      const assets = await api("http://localhost:3000/api/assets/getall");

      const tbody = byId("assetsTableBody");
      tbody.innerHTML = "";

      assets.forEach((a) => {
        const farm = a.farm_data || {};
        const animals = a.livestock || [];

        if (!farm.farmer_id && animals.length === 0) return;

        if (animals.length === 0) {
          const row = `
            <tr class="group hover:bg-gray-100 transition-all duration-200" data-farmer="${
              farm.farmer_id
            }">
              <td class="border px-3 py-2">${farm.farmer_id || "-"}</td>
              <td class="border px-3 py-2">${farm.area_acres || "-"}</td>
              <td class="border px-3 py-2">${farm.soil_type || "-"}</td>
              <td class="border px-3 py-2">${farm.irrigation_type || "-"}</td>
              <td class="border px-3 py-2" colspan="5">No livestock</td>
              <td  class="border px-3 py-2 text-center">
                ${
                  role === "field_facilitator"
                    ? actionButtons(farm.farmer_id)
                    : "-"
                }
              </td>
            </tr>
          `;
          tbody.insertAdjacentHTML("beforeend", row);
        } else {
          animals.forEach((animal, i) => {
            const row = `
              <tr class="group hover:bg-gray-100 transition-all duration-200" data-farmer="${
                farm.farmer_id
              }">
                ${
                  i === 0
                    ? `<td class="border px-3 py-2" rowspan="${
                        animals.length
                      }">${farm.farmer_id || "-"}</td>
                       <td class="border px-3 py-2" rowspan="${
                         animals.length
                       }">${farm.area_acres || "-"}</td>
                       <td class="border px-3 py-2" rowspan="${
                         animals.length
                       }">${farm.soil_type || "-"}</td>
                       <td class="border px-3 py-2" rowspan="${
                         animals.length
                       }">${farm.irrigation_type || "-"}</td>`
                    : ""
                }
                <td class="border px-3 py-2">${animal.animal_type || "-"}</td>
                <td class="border px-3 py-2">${animal.quantity ?? "-"}</td>
                <td class="border px-3 py-2 text-center">${
                  animal.shelter ? "✔️" : "❌"
                }</td>
                <td class="border px-3 py-2 text-center">${
                  animal.clean_water ? "✔️" : "❌"
                }</td>
                <td class="border px-3 py-2 text-center">${
                  animal.trained ? "✔️" : "❌"
                }</td>
                <td class="border px-3 py-2 text-center">${
                  animal.vaccinated ? "✔️" : "❌"
                }</td>
                ${
                  i === 0
                    ? `<td id="act" class="border px-3 py-2 text-center" rowspan="${
                        animals.length
                      }">
                        ${
                          role === "field_facilitator"
                            ? actionButtons(farm.farmer_id)
                            : ""
                        }
                       </td>`
                    : ""
                }
              </tr>
            `;

            tbody.insertAdjacentHTML("beforeend", row);
          });
        }
      });

      lucide.createIcons();
    } catch (err) {
      console.error(err);
      alert("Record not found");
    }
  }

  const actionButtons = (farmerId) => {
    return `
      <div class="flex items-center justify-center gap-2">
        <button class="opacity-100 text-gray-600 hover:text-blue-600" data-action="edit" data-farmer="${farmerId}" title="Edit">
          <i data-lucide="pencil"></i>
        </button>
        <button class="opacity-100 text-gray-600 hover:text-red-600" data-action="delete" data-farmer="${farmerId}" title="Delete">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    `;
  };

  // ===== Search =====
  async function searchAssetById(farmer_id) {
    try {
      const asset = await api(
        `http://localhost:3000/api/assets/get/${farmer_id}`
      );

      const tbody = byId("assetsTableBody");
      tbody.innerHTML = "";

      const farm = asset.farm_data || {};
      const animals = asset.livestock || [];

      if (animals.length === 0) {
        const row = `
          <tr class="group hover:bg-gray-100 transition-all duration-200" data-farmer="${
            farm.farmer_id
          }">
            <td class="border px-3 py-2">${farm.farmer_id || "-"}</td>
            <td class="border px-3 py-2">${farm.area_acres || "-"}</td>
            <td class="border px-3 py-2">${farm.soil_type || "-"}</td>
            <td class="border px-3 py-2">${farm.irrigation_type || "-"}</td>
            <td class="border px-3 py-2" colspan="5">No livestock</td>
            <td class="border px-3 py-2 text-center">
              ${
                role === "field_facilitator"
                  ? actionButtons(farm.farmer_id)
                  : "-"
              }
            </td>
          </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
      } else {
        animals.forEach((animal, i) => {
          const row = `
            <tr class="group hover:bg-gray-100 transition-all duration-200" data-farmer="${
              farm.farmer_id
            }">
              ${
                i === 0
                  ? `<td class="border px-3 py-2" rowspan="${animals.length}">${
                      farm.farmer_id || "-"
                    }</td>
                     <td class="border px-3 py-2" rowspan="${animals.length}">${
                      farm.area_acres || "-"
                    }</td>
                     <td class="border px-3 py-2" rowspan="${animals.length}">${
                      farm.soil_type || "-"
                    }</td>
                     <td class="border px-3 py-2" rowspan="${animals.length}">${
                      farm.irrigation_type || "-"
                    }</td>`
                  : ""
              }
              <td class="border px-3 py-2">${animal.animal_type || "-"}</td>
              <td class="border px-3 py-2">${animal.quantity ?? "-"}</td>
              <td class="border px-3 py-2 text-center">${
                animal.shelter ? "✔️" : "❌"
              }</td>
              <td class="border px-3 py-2 text-center">${
                animal.clean_water ? "✔️" : "❌"
              }</td>
              <td class="border px-3 py-2 text-center">${
                animal.trained ? "✔️" : "❌"
              }</td>
              <td class="border px-3 py-2 text-center">${
                animal.vaccinated ? "✔️" : "❌"
              }</td>
              ${
                i === 0
                  ? `<td class="border px-3 py-2 text-center" rowspan="${
                      animals.length
                    }">
                      ${
                        role === "field_facilitator"
                          ? actionButtons(farm.farmer_id)
                          : "-"
                      }
                    </td>`
                  : ""
              }
            </tr>
          `;
          tbody.insertAdjacentHTML("beforeend", row);
        });
      }

      lucide.createIcons();
    } catch (err) {
      console.error(err);
      alert("No record found");
    }
  }

  // ===== Delete =====
  async function deleteAsset(farmer_id) {
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await api(`http://localhost:3000/api/assets/delete/${farmer_id}`, {
        method: "DELETE",
      });
      alert("Asset deleted successfully");
      loadAssets();
    } catch (err) {
      console.error(err);
      alert("Error deleting asset");
    }
  }

  // ===== Modal Flow (Add / Edit) =====
  function openAddModal() {
    modalMode = "add";
    editingFarmerId = null;
    clearFarmFields();
    clearLivestockTable();
    setFarmFieldsDisabled(false);
    addLivestockRow(); // one empty row by default
    openModal("Add Assets");
    lucide.createIcons();
  }

  async function openEditModal(farmer_id) {
    modalMode = "edit";
    editingFarmerId = farmer_id;
    clearFarmFields();
    clearLivestockTable();
    openModal("Edit Assets");

    try {
      const asset = await api(
        `http://localhost:3000/api/assets/get/${farmer_id}`
      );
      const farm = asset.farm_data || {};
      const animals = asset.livestock || [];

      byId("f_farmer_id").value = farm.farmer_id;
      byId("f_area").value = farm.area_acres || "";
      byId("f_soil").value = farm.soil_type || "";
      byId("f_irrigation").value = farm.irrigation_type || "";

      // In edit mode, farm fields are editable
      setFarmFieldsDisabled(false);

      if (animals.length === 0) {
        addLivestockRow();
      } else {
        animals.forEach((a) => addLivestockRow(a));
      }
    } catch (e) {
      console.error(e);
      alert("Failed to load farmer data for edit");
      closeModal();
    }
  }

  // Auto-fill on farmer ID blur in Add mode
  byId("f_farmer_id").addEventListener("blur", async (e) => {
    if (modalMode !== "add") return;
    const val = e.target.value.trim();
    if (!val) return;
    try {
      const asset = await api(`http://localhost:3000/api/assets/get/${val}`);
      const farm = asset.farm_data;
      if (farm) {
        // Farmer exists: lock farm fields and prefill
        byId("f_area").value = farm.area_acres || "";
        byId("f_soil").value = farm.soil_type || "";
        byId("f_irrigation").value = farm.irrigation_type || "";
        setFarmFieldsDisabled(true);
        byId("farmerHint").textContent =
          "Existing farmer detected — farm details locked. You can add livestock only.";
        byId("farmerHint").classList.remove("text-gray-500");
        byId("farmerHint").classList.add("text-green-600");
      } else {
        setFarmFieldsDisabled(false);
      }
    } catch {
      // Not found → treat as new farmer
      setFarmFieldsDisabled(false);
      byId("farmerHint").textContent =
        "New farmer — please enter farm details.";
      byId("farmerHint").classList.remove("text-green-600");
      byId("farmerHint").classList.add("text-gray-500");
    }
  });

  // Save from modal (Add or Edit)
  async function saveFromModal() {
    const farmer_id = Number(byId("f_farmer_id").value);
    if (!farmer_id) {
      alert("Please enter Farmer ID");
      return;
    }

    const payload = {
      farmer_id,
      area_acres: byId("f_area").value ? String(byId("f_area").value) : null,
      soil_type: byId("f_soil").value || null,
      irrigation_type: byId("f_irrigation").value || null,
      livestock: readLivestockFromModal(),
    };

    try {
      if (modalMode === "add") {
        // Backend add will skip farm insert if farmer already exists
        await api("http://localhost:3000/api/assets/add", {
          method: "POST",
          body: JSON.stringify(payload),
        });
        alert("Record added successfully!");
      } else {
        await api(
          `http://localhost:3000/api/assets/update/${editingFarmerId}`,
          {
            method: "PUT",
            body: JSON.stringify({
              area_acres: payload.area_acres,
              soil_type: payload.soil_type,
              irrigation_type: payload.irrigation_type,
              livestock: payload.livestock,
            }),
          }
        );
        alert("Record updated successfully!");
      }
      closeModal();
      loadAssets();
    } catch (err) {
      console.error(err);
      alert("Error saving record");
    }
  }

  // ===== Add button visibility by role =====
  if (role !== "field_facilitator") {
    const addBtn = byId("addFarmerBtn");
    if (addBtn) addBtn.classList.add("hidden");
  }

  // ===== Events =====
  // Table action delegation (edit/delete)
  byId("assetsTableBody").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const farmerId = btn.getAttribute("data-farmer");
    if (action === "delete") {
      deleteAsset(farmerId);
    } else if (action === "edit") {
      openEditModal(farmerId);
    }
  });

  // Search triggers
  byId("searchFarmerBtn").addEventListener("click", () => {
    const farmer_id = byId("searchCodeInput").value.trim();
    if (farmer_id) searchAssetById(farmer_id);
  });
  byId("searchCodeInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const farmer_id = e.target.value.trim();
      if (farmer_id) searchAssetById(farmer_id);
    }
  });

  // Add modal
  byId("addFarmerBtn").addEventListener("click", () => {
    if (role !== "field_facilitator") return;
    openAddModal();
  });

  // Modal controls
  byId("addAnimalRowBtn").addEventListener("click", () => addLivestockRow());
  byId("livestockTbody").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action='remove-row']");
    if (!btn) return;
    const tr = btn.closest("tr");
    tr?.remove();
  });
  byId("saveModalBtn").addEventListener("click", saveFromModal);
  byId("cancelModalBtn").addEventListener("click", closeModal);
  byId("closeModalBtn").addEventListener("click", closeModal);

  // Expose for potential inline use (not strictly needed now)
  window.loadAssets = loadAssets;

  // Initial load
  loadAssets();
});
