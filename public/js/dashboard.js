document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // ===== ADMIN CARDS =====
  const adminFacilitatorCount = document.getElementById(
    "adminFacilitatorCount"
  );
  const adminFarmerCount = document.getElementById("adminFarmerCount");
  const adminCottonRevenue = document.getElementById("admincottonrevenue");
  const adminManagedArea = document.getElementById("adminmanagedarea");

  // ===== FACILITATOR CARDS =====
  const facilitatorFarmerCount = document.getElementById(
    "facilitatorfarmercount"
  );
  const facilitatorManagedArea = document.getElementById(
    "facilitatormanagedarea"
  );
  const facilitatorIrrigationQuantity = document.getElementById(
    "facilitatorirrigation"
  );
  const facilitatorIrrigationEvents = document.getElementById(
    "facilitatorirrigationevents"
  );

  const roleDisplay = document.getElementById("roleDisplay");

  const adminCards = document.getElementById("adminCards");
  const facilitatorCards = document.getElementById("facilitatorCards");

  const adminCharts = document.getElementById("adminCharts");
  const facilitatorCharts = document.getElementById("facilitatorCharts");

  if (!token || !role) {
    window.location.href = "index.html";
    return;
  }

  if (role === "admin") {
    roleDisplay.textContent = "ADMIN";
    adminCards.classList.remove("hidden");
    facilitatorCards.classList.add("hidden");
    adminCharts.classList.remove("hidden");
    facilitatorCharts.classList.add("hidden");

    loadAdminDashboard(token, {
      adminFacilitatorCount,
      adminFarmerCount,
      adminCottonRevenue,
      adminManagedArea,
    });
  } else {
    roleDisplay.textContent = "F-FACILITATOR";
    facilitatorCards.classList.remove("hidden");
    adminCards.classList.add("hidden");
    facilitatorCharts.classList.remove("hidden");
    adminCharts.classList.add("hidden");

    loadFacilitatorDashboard(token, {
      facilitatorFarmerCount,
      facilitatorManagedArea,
      facilitatorIrrigationQuantity,
      facilitatorIrrigationEvents,
    });
  }

  window.logout = () => {
    localStorage.clear();
    window.location.href = "index.html";
  };

  window.toggleSidebar = () => {
    document.getElementById("sidebar").classList.toggle("hidden");
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: "#2c6642", font: { size: 12 } },
    },
  },
  scales: {
    x: { ticks: { color: "#5c5c5c" }, grid: { color: "rgba(0,0,0,0.05)" } },
    y: { ticks: { color: "#5c5c5c" }, grid: { color: "rgba(0,0,0,0.05)" } },
  },
};

// ===== ADMIN DASHBOARD =====
async function loadAdminDashboard(token, elements) {
  try {
    const headers = { Authorization: `Bearer ${token}` };

    const analyticsRes = await fetch(
      "http://localhost:3000/api/users/analytics/admin",
      { headers }
    );

    if (!analyticsRes.ok) {
      throw new Error("Failed to fetch admin analytics");
    }
    const analytics = await analyticsRes.json();
    console.log("Admin Dashboard Data:", analytics);

    // Cards
    elements.adminFacilitatorCount.textContent =
      analytics?.data?.totalFacilitators ?? 0;
    elements.adminFarmerCount.textContent = analytics?.data?.totalFarmers ?? 0;
    elements.adminCottonRevenue.textContent =
      analytics?.data?.totalCottonRevenue ?? 0;
    elements.adminManagedArea.textContent =
      analytics?.data?.totalManagedArea ?? 0;

    // Charts
    if (analytics?.data) {
      renderAdminCharts(analytics);
    }
  } catch (err) {
    console.error("Error loading admin dashboard:", err);
    alert("Failed to load dashboard data. Please try again later.");
  }
}

// ===== FACILITATOR DASHBOARD =====
async function loadFacilitatorDashboard(token, elements) {
  try {
    const headers = { Authorization: `Bearer ${token}` };
    const res = await fetch(
      "http://localhost:3000/api/users/analytics/facilitator",
      { headers }
    );

    if (!res.ok) throw new Error("Failed to fetch facilitator analytics");

    const analytics = await res.json();
    console.log("Facilitator Dashboard Data:", analytics);

    // Cards
    elements.facilitatorFarmerCount.textContent =
      analytics?.data?.totalFarmers ?? 0;
    elements.facilitatorManagedArea.textContent =
      analytics?.data?.totalManagedArea ?? 0;
    elements.facilitatorIrrigationQuantity.textContent =
      analytics?.data?.totalIrrigationQuantity ?? 0;
    elements.facilitatorIrrigationEvents.textContent =
      analytics?.data?.irrigationEventCount ?? 0;

    // Charts
    if (analytics?.data) {
      renderFacilitatorCharts(analytics);
    }
  } catch (err) {
    console.error("Error loading facilitator dashboard:", err);
  }
}

// ===== ADMIN CHARTS =====
function renderAdminCharts(data) {
  const {
    farmersPerFacilitator = [],
    areaPerFacilitator = [],
    cottonRevenueVsCost = [],
  } = data.data;

  new Chart(document.getElementById("farmersBarChart"), {
    type: "bar",
    data: {
      labels: farmersPerFacilitator.map((item) => item.facilitator),
      datasets: [
        {
          label: "Farmers",
          data: farmersPerFacilitator.map((item) => item.count),
          backgroundColor: "#34d399",
        },
      ],
    },
    options: chartOptions,
  });

  new Chart(document.getElementById("areaBarChart"), {
    type: "bar",
    data: {
      labels: areaPerFacilitator.map((item) => item.facilitator),
      datasets: [
        {
          label: "Area (acres)",
          data: areaPerFacilitator.map((item) => item.total_area),
          backgroundColor: "#166534",
        },
      ],
    },
    options: chartOptions,
  });

  new Chart(document.getElementById("cottonLineChart"), {
    type: "line",
    data: {
      labels: cottonRevenueVsCost.map((item) => item.farmer),
      datasets: [
        {
          label: "Revenue",
          data: cottonRevenueVsCost.map((item) => item.total_earning),
          borderColor: "#34d399",
          fill: false,
        },
        {
          label: "Cost",
          data: cottonRevenueVsCost.map((item) => item.total_cost),
          borderColor: "#f87171",
          fill: false,
        },
      ],
    },
    options: chartOptions,
  });
}

// ===== FACILITATOR CHARTS =====
function renderFacilitatorCharts(data) {
  const {
    areaPerFarmer = [],
    livestockDistribution = [],
    irrigationActivities = [],
  } = data.data;

  new Chart(document.getElementById("areaPerFarmerBar"), {
    type: "bar",
    data: {
      labels: areaPerFarmer.map((item) => item.farmer),
      datasets: [
        {
          label: "Area (acres)",
          data: areaPerFarmer.map((item) => item.area),
          backgroundColor: "#3f9627",
        },
      ],
    },
    options: chartOptions,
  });

  new Chart(document.getElementById("livestockBarChart"), {
    type: "pie",
    data: {
      labels: livestockDistribution.map((item) => item.animal_type),
      datasets: [
        {
          label: "Quantity",
          data: livestockDistribution.map((item) => item.total_quantity),
          backgroundColor: [
            "#34d399", // green
            "#60a5fa", // blue
            "#fbbf24", // yellow
            "#f87171", // red
            "#a78bfa", // purple
            "#f472b6", // pink
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right", // legend on right side
          labels: { boxWidth: 15 },
        },
      },
      layout: {
        padding: 20, // keeps chart centered
      },
    },
  });

  new Chart(document.getElementById("irrigationLineChart"), {
    type: "line",
    data: {
      labels: irrigationActivities.map((item) => item.month),
      datasets: [
        {
          label: "Irrigation Quantity (per acre)",
          data: irrigationActivities.map((item) => item.total_quantity),
          borderColor: "#3b82f6",
          fill: false,
        },
      ],
    },
    options: chartOptions,
  });
}
