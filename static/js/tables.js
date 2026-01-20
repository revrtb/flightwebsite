// Tables page: render static data + sortable columns

const COMPANY_ROWS = [
  {
    company: "AeroNova Systems",
    city: "Seattle",
    address: "1208 Pine St, Seattle, WA 98101",
    phone: "+1 (206) 555-0142",
    employeeCount: 245,
  },
  {
    company: "BlueSky Logistics",
    city: "Dallas",
    address: "4550 Elm St, Dallas, TX 75202",
    phone: "+1 (214) 555-0198",
    employeeCount: 610,
  },
  {
    company: "CloudWing Aviation",
    city: "Miami",
    address: "88 Biscayne Blvd, Miami, FL 33132",
    phone: "+1 (305) 555-0116",
    employeeCount: 132,
  },
  {
    company: "JetBridge Partners",
    city: "Chicago",
    address: "14 W Jackson Blvd, Chicago, IL 60604",
    phone: "+1 (312) 555-0171",
    employeeCount: 980,
  },
  {
    company: "NorthStar Travel Group",
    city: "New York",
    address: "350 5th Ave, New York, NY 10118",
    phone: "+1 (212) 555-0133",
    employeeCount: 420,
  },
  {
    company: "SkyRoute Consulting",
    city: "Los Angeles",
    address: "200 N Spring St, Los Angeles, CA 90012",
    phone: "+1 (213) 555-0155",
    employeeCount: 75,
  },
];

function compareValues(a, b, type) {
  if (type === "number") {
    return Number(a) - Number(b);
  }
  return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

function renderRows(rows) {
  const tbody = document.getElementById("companyTableBody");
  if (!tbody) return;

  tbody.innerHTML = rows
    .map(
      (r) => `
      <tr>
        <td>${escapeHtml(r.company)}</td>
        <td>${escapeHtml(r.city)}</td>
        <td>${escapeHtml(r.address)}</td>
        <td>${escapeHtml(r.phone)}</td>
        <td class="text-end">${Number(r.employeeCount).toLocaleString("en-US")}</td>
      </tr>
    `.trim()
    )
    .join("");
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setIndicators(activeKey, direction) {
  document.querySelectorAll("th.sortable").forEach((th) => {
    const indicator = th.querySelector(".sort-indicator");
    if (!indicator) return;
    if (th.dataset.key !== activeKey) {
      indicator.textContent = "";
      th.setAttribute("aria-sort", "none");
      return;
    }
    th.setAttribute("aria-sort", direction === "asc" ? "ascending" : "descending");
    indicator.textContent = direction === "asc" ? "▲" : "▼";
  });
}

function sortAndRender(state, key, type) {
  const nextDirection =
    state.key === key ? (state.direction === "asc" ? "desc" : "asc") : "asc";

  const sorted = [...COMPANY_ROWS].sort((ra, rb) => {
    const cmp = compareValues(ra[key], rb[key], type);
    return nextDirection === "asc" ? cmp : -cmp;
  });

  state.key = key;
  state.direction = nextDirection;

  setIndicators(key, nextDirection);
  renderRows(sorted);
}

document.addEventListener("DOMContentLoaded", () => {
  const state = { key: "company", direction: "asc" };

  // Default: sorted by Company name (ascending)
  const defaultSorted = [...COMPANY_ROWS].sort((a, b) =>
    compareValues(a.company, b.company, "text")
  );
  setIndicators("company", "asc");
  renderRows(defaultSorted);

  // Click-to-sort headers
  document.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      const type = th.dataset.type || "text";
      if (!key) return;
      sortAndRender(state, key, type);
    });
  });

  // Reset sort button
  const resetBtn = document.getElementById("resetSortBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      state.key = "company";
      state.direction = "asc";
      const sorted = [...COMPANY_ROWS].sort((a, b) =>
        compareValues(a.company, b.company, "text")
      );
      setIndicators("company", "asc");
      renderRows(sorted);
    });
  }
});

