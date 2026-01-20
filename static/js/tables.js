// Tables page: render data from backend APIs + sortable columns

let COMPANY_TABLE_ROWS = [];
let COMPANY_CUSTOM_ROWS = [];

async function loadCompanyTableData() {
  const response = await fetch("/api/company-table");
  if (!response.ok) {
    throw new Error(`Failed to load company table data: ${response.status}`);
  }
  const data = await response.json();
  COMPANY_TABLE_ROWS = Array.isArray(data) ? data : [];
  return COMPANY_TABLE_ROWS;
}

async function loadCustomCompanyTableData() {
  const response = await fetch("/api/company-custom-table");
  if (!response.ok) {
    throw new Error(
      `Failed to load custom company table data: ${response.status}`
    );
  }
  const data = await response.json();
  COMPANY_CUSTOM_ROWS = Array.isArray(data) ? data : [];
  return COMPANY_CUSTOM_ROWS;
}

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
        <td class="text-end">${Number(r.employeeCount).toLocaleString(
          "en-US"
        )}</td>
      </tr>
    `.trim()
    )
    .join("");
}

function renderCustomRows(rows) {
  const body = document.getElementById("customCompanyTableBody");
  if (!body) return;

  body.innerHTML = rows
    .map(
      (r) => `
      <div class="custom-table__row" role="row">
        <div class="custom-table__cell" role="cell">${escapeHtml(
          r.company
        )}</div>
        <div class="custom-table__cell" role="cell">${escapeHtml(
          r.city
        )}</div>
        <div class="custom-table__cell" role="cell">${escapeHtml(
          r.address
        )}</div>
        <div class="custom-table__cell" role="cell">${escapeHtml(
          r.phone
        )}</div>
        <div class="custom-table__cell custom-table__cell--right" role="cell">${Number(
          r.employeeCount
        ).toLocaleString("en-US")}</div>
      </div>
    `.trim()
    )
    .join("");
}

function renderAll() {
  if (COMPANY_TABLE_ROWS.length) {
    renderRows(COMPANY_TABLE_ROWS);
  }
  if (COMPANY_CUSTOM_ROWS.length) {
    renderCustomRows(COMPANY_CUSTOM_ROWS);
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function setIndicatorsForTable(activeKey, direction) {
  document.querySelectorAll("th.sortable").forEach((th) => {
    const indicator = th.querySelector(".sort-indicator");
    if (!indicator) return;
    if (th.dataset.key !== activeKey) {
      indicator.textContent = "";
      th.setAttribute("aria-sort", "none");
      return;
    }
    th.setAttribute(
      "aria-sort",
      direction === "asc" ? "ascending" : "descending"
    );
    indicator.textContent = direction === "asc" ? "▲" : "▼";
  });

}

function setIndicatorsForCustom(activeKey, direction) {
  document.querySelectorAll(".sortable-div").forEach((el) => {
    const indicator = el.querySelector(".sort-indicator");
    if (!indicator) return;
    if (el.dataset.key !== activeKey) {
      indicator.textContent = "";
      el.setAttribute("aria-sort", "none");
      return;
    }
    el.setAttribute(
      "aria-sort",
      direction === "asc" ? "ascending" : "descending"
    );
    indicator.textContent = direction === "asc" ? "▲" : "▼";
  });
}

function sortAndRenderTable(state, key, type) {
  const nextDirection =
    state.key === key ? (state.direction === "asc" ? "desc" : "asc") : "asc";

  if (COMPANY_TABLE_ROWS.length) {
    COMPANY_TABLE_ROWS = [...COMPANY_TABLE_ROWS].sort((ra, rb) => {
      const cmp = compareValues(ra[key], rb[key], type);
      return nextDirection === "asc" ? cmp : -cmp;
    });
  }

  state.key = key;
  state.direction = nextDirection;

  setIndicatorsForTable(key, nextDirection);
  renderRows(COMPANY_TABLE_ROWS);
}

function sortAndRenderCustom(state, key, type) {
  const nextDirection =
    state.key === key ? (state.direction === "asc" ? "desc" : "asc") : "asc";

  if (COMPANY_CUSTOM_ROWS.length) {
    COMPANY_CUSTOM_ROWS = [...COMPANY_CUSTOM_ROWS].sort((ra, rb) => {
      const cmp = compareValues(ra[key], rb[key], type);
      return nextDirection === "asc" ? cmp : -cmp;
    });
  }

  state.key = key;
  state.direction = nextDirection;

  setIndicatorsForCustom(key, nextDirection);
  renderCustomRows(COMPANY_CUSTOM_ROWS);
}

document.addEventListener("DOMContentLoaded", () => {
  const tableState = { key: "company", direction: "asc" };
  const customState = { key: "company", direction: "asc" };

  // Click-to-sort headers (HTML table)
  document.querySelectorAll("th.sortable").forEach((th) => {
    th.addEventListener("click", () => {
      const key = th.dataset.key;
      const type = th.dataset.type || "text";
      if (!key) return;
      sortAndRenderTable(tableState, key, type);
    });
  });

  // Click-to-sort custom headers (and keyboard Enter/Space)
  document.querySelectorAll(".sortable-div").forEach((el) => {
    const activate = () => {
      const key = el.dataset.key;
      const type = el.dataset.type || "text";
      if (!key) return;
      sortAndRenderCustom(customState, key, type);
    };

    el.addEventListener("click", activate);
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });

  // Reset sort button
  const resetBtn = document.getElementById("resetSortBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      // Reset each table independently to Company ascending
      tableState.key = "";
      tableState.direction = "desc";
      customState.key = "";
      customState.direction = "desc";
      sortAndRenderTable(tableState, "company", "text");
      sortAndRenderCustom(customState, "company", "text");
    });
  }

  // Initial load: fetch data for both tables separately from backend APIs
  Promise.all([loadCompanyTableData(), loadCustomCompanyTableData()])
    .then(() => {
      if (!COMPANY_TABLE_ROWS.length && !COMPANY_CUSTOM_ROWS.length) return;
      // Default sort by company ascending
      tableState.key = "";
      tableState.direction = "desc";
      customState.key = "";
      customState.direction = "desc";
      sortAndRenderTable(tableState, "company", "text");
      sortAndRenderCustom(customState, "company", "text");
    })
    .catch((err) => {
      console.error(err);
    });
});

