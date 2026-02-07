// Tables page: render data from backend APIs + sortable columns

let COMPANY_TABLE_ROWS = [];
let COMPANY_CUSTOM_ROWS = [];
let DELETED_ROWS_TABLE = new Set();
let DELETED_ROWS_CUSTOM = new Set();

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
      (r, index) => {
        const rowId = `table-row-${index}`;
        if (DELETED_ROWS_TABLE.has(rowId)) return '';
        const safeRowId = rowId.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        const safeData = JSON.stringify(r).replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        return `
      <tr data-row-id="${safeRowId}" data-row-data='${safeData}' class="table-row-clickable" style="cursor: pointer;">
        <td class="text-center" onclick="event.stopPropagation();">
          <input type="checkbox" class="form-check-input row-checkbox" data-row-id="${safeRowId}">
        </td>
        <td>${escapeHtml(r.company)}</td>
        <td>${escapeHtml(r.city)}</td>
        <td>${escapeHtml(r.address)}</td>
        <td>${escapeHtml(r.phone)}</td>
        <td class="text-end ${Number(r.employeeCount) > 400 ? 'text-success fw-bold' : ''}">${Number(r.employeeCount).toLocaleString("en-US")}</td>
        <td class="text-center" onclick="event.stopPropagation();">
          <button class="btn btn-sm btn-danger" onclick="deleteRow('${safeRowId}', 'table')" title="Delete row">
            <i class="fas fa-trash"></i>
          </button>
          <select class="form-select form-select-sm d-inline-block ms-2" style="width: auto;" onchange="handleActionSelect(this.value, '${safeRowId}'); event.stopPropagation();">
            <option value="">Action</option>
            <option value="edit">Edit</option>
            <option value="details">Details</option>
          </select>
        </td>
      </tr>
    `.trim();
      }
    )
    .filter(row => row !== '')
    .join("");
  
  // Add click event listeners to rows
  tbody.querySelectorAll('tr.table-row-clickable').forEach(row => {
    row.addEventListener('click', function(e) {
      // Don't trigger if clicking on interactive elements
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || 
          e.target.closest('button') || e.target.closest('select') || e.target.closest('input')) {
        return;
      }
      const rowData = JSON.parse(this.dataset.rowData);
      showRowDetails(rowData);
    });
  });
  
  // Update select all checkbox state
  updateSelectAllState('table');
}

function renderCustomRows(rows) {
  const body = document.getElementById("customCompanyTableBody");
  if (!body) return;

  body.innerHTML = rows
    .map(
      (r, index) => {
        const rowId = `custom-row-${index}`;
        if (DELETED_ROWS_CUSTOM.has(rowId)) return '';
        const safeRowId = rowId.replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        const safeData = JSON.stringify(r).replace(/"/g, '&quot;').replace(/'/g, '&#039;');
        return `
      <div class="custom-table__row custom-row-clickable" role="row" data-row-id="${safeRowId}" data-row-data='${safeData}' style="cursor: pointer;">
        <div class="custom-table__cell text-center" role="cell" onclick="event.stopPropagation();">
          <input type="checkbox" class="form-check-input row-checkbox-custom" data-row-id="${safeRowId}">
        </div>
        <div class="custom-table__cell" role="cell">${escapeHtml(r.company)}</div>
        <div class="custom-table__cell" role="cell">${escapeHtml(r.city)}</div>
        <div class="custom-table__cell" role="cell">${escapeHtml(r.address)}</div>
        <div class="custom-table__cell" role="cell">${escapeHtml(r.phone)}</div>
        <div class="custom-table__cell custom-table__cell--right ${Number(r.employeeCount) > 400 ? 'text-success fw-bold' : ''}" role="cell">${Number(r.employeeCount).toLocaleString("en-US")}</div>
        <div class="custom-table__cell text-center" role="cell" onclick="event.stopPropagation();">
          <button class="btn btn-sm btn-danger" onclick="deleteRow('${safeRowId}', 'custom')" title="Delete row">
            <i class="fas fa-trash"></i>
          </button>
          <select class="form-select form-select-sm d-inline-block ms-2" style="width: auto;" onchange="handleActionSelect(this.value, '${safeRowId}'); event.stopPropagation();">
            <option value="">Action</option>
            <option value="edit">Edit</option>
            <option value="details">Details</option>
          </select>
        </div>
      </div>
    `.trim();
      }
    )
    .filter(row => row !== '')
    .join("");
  
  // Add click event listeners to rows
  body.querySelectorAll('.custom-row-clickable').forEach(row => {
    row.addEventListener('click', function(e) {
      // Don't trigger if clicking on interactive elements
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT' || 
          e.target.closest('button') || e.target.closest('select') || e.target.closest('input')) {
        return;
      }
      const rowData = JSON.parse(this.dataset.rowData);
      showRowDetails(rowData);
    });
  });
  
  // Update select all checkbox state
  updateSelectAllState('custom');
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

// Apply filters to table rows
function applyFilters(tableType) {
  const prefix = tableType === 'table' ? '' : 'Custom';
  const filterCompany = document.getElementById(`filterCompany${prefix}`).value.toLowerCase();
  const filterCity = document.getElementById(`filterCity${prefix}`).value.toLowerCase();
  const filterAddress = document.getElementById(`filterAddress${prefix}`).value.toLowerCase();
  const filterPhone = document.getElementById(`filterPhone${prefix}`).value.toLowerCase();
  const filterEmployeeCount = document.getElementById(`filterEmployeeCount${prefix}`).value.toLowerCase();
  
  if (tableType === 'table') {
    const rows = document.querySelectorAll('#companyTableBody tr');
    rows.forEach(row => {
      if (row.style.display === 'none' && DELETED_ROWS_TABLE.has(row.dataset.rowId)) {
        return; // Skip deleted rows
      }
      
      const cells = row.querySelectorAll('td');
      if (cells.length < 6) return;
      
      const company = (cells[1]?.textContent || '').toLowerCase();
      const city = (cells[2]?.textContent || '').toLowerCase();
      const address = (cells[3]?.textContent || '').toLowerCase();
      const phone = (cells[4]?.textContent || '').toLowerCase();
      const employeeCount = (cells[5]?.textContent || '').toLowerCase();
      
      const matches =
        (!filterCompany || company.includes(filterCompany)) &&
        (!filterCity || city.includes(filterCity)) &&
        (!filterAddress || address.includes(filterAddress)) &&
        (!filterPhone || phone.includes(filterPhone)) &&
        (!filterEmployeeCount || employeeCount.includes(filterEmployeeCount));
      
      row.style.display = matches ? '' : 'none';
    });
    updateSelectAllState('table');
  } else {
    const rows = document.querySelectorAll('#customCompanyTableBody .custom-table__row');
    rows.forEach(row => {
      if (row.style.display === 'none' && DELETED_ROWS_CUSTOM.has(row.dataset.rowId)) {
        return; // Skip deleted rows
      }
      
      const cells = row.querySelectorAll('.custom-table__cell');
      if (cells.length < 7) return;
      
      const company = (cells[1]?.textContent || '').toLowerCase();
      const city = (cells[2]?.textContent || '').toLowerCase();
      const address = (cells[3]?.textContent || '').toLowerCase();
      const phone = (cells[4]?.textContent || '').toLowerCase();
      const employeeCount = (cells[5]?.textContent || '').toLowerCase();
      
      const matches =
        (!filterCompany || company.includes(filterCompany)) &&
        (!filterCity || city.includes(filterCity)) &&
        (!filterAddress || address.includes(filterAddress)) &&
        (!filterPhone || phone.includes(filterPhone)) &&
        (!filterEmployeeCount || employeeCount.includes(filterEmployeeCount));
      
      row.style.display = matches ? '' : 'none';
    });
    updateSelectAllState('custom');
  }
}

// Clear all filters
function clearFilters(tableType) {
  const prefix = tableType === 'table' ? '' : 'Custom';
  document.getElementById(`filterCompany${prefix}`).value = '';
  document.getElementById(`filterCity${prefix}`).value = '';
  document.getElementById(`filterAddress${prefix}`).value = '';
  document.getElementById(`filterPhone${prefix}`).value = '';
  document.getElementById(`filterEmployeeCount${prefix}`).value = '';
  applyFilters(tableType);
}

// Show row details in modal
function showRowDetails(rowData) {
  const modal = new bootstrap.Modal(document.getElementById('rowDetailsModal'));
  const content = document.getElementById('rowDetailsContent');
  
  const detailsHtml = `
    <div class="row-details">
      <div class="mb-3">
        <strong><i class="fas fa-building me-2 text-primary"></i>Company:</strong>
        <p class="mb-0 mt-1">${escapeHtml(rowData.company)}</p>
      </div>
      <div class="mb-3">
        <strong><i class="fas fa-map-marker-alt me-2 text-primary"></i>City:</strong>
        <p class="mb-0 mt-1">${escapeHtml(rowData.city)}</p>
      </div>
      <div class="mb-3">
        <strong><i class="fas fa-map-pin me-2 text-primary"></i>Address:</strong>
        <p class="mb-0 mt-1">${escapeHtml(rowData.address)}</p>
      </div>
      <div class="mb-3">
        <strong><i class="fas fa-phone me-2 text-primary"></i>Phone:</strong>
        <p class="mb-0 mt-1">${escapeHtml(rowData.phone)}</p>
      </div>
      <div class="mb-3">
        <strong><i class="fas fa-users me-2 text-primary"></i>Employee Count:</strong>
        <p class="mb-0 mt-1">${Number(rowData.employeeCount || rowData.employee_count).toLocaleString("en-US")}</p>
      </div>
    </div>
  `;
  
  content.innerHTML = detailsHtml;
  modal.show();
}

// Handle action select dropdown
function handleActionSelect(action, rowId) {
  if (!action) return;
  console.log(`Action "${action}" selected for row ${rowId}`);
  // You can add custom logic here for edit/details actions
  alert(`Action: ${action} for row ${rowId}`);
}

// Delete row function
function deleteRow(rowId, tableType) {
  if (tableType === 'table') {
    DELETED_ROWS_TABLE.add(rowId);
    const row = document.querySelector(`tr[data-row-id="${rowId}"]`);
    if (row) {
      row.style.display = 'none';
    }
    updateSelectAllState('table');
  } else if (tableType === 'custom') {
    DELETED_ROWS_CUSTOM.add(rowId);
    const row = document.querySelector(`div[data-row-id="${rowId}"]`);
    if (row) {
      row.style.display = 'none';
    }
    updateSelectAllState('custom');
  }
}

// Update select all checkbox state
function updateSelectAllState(tableType) {
  const prefix = tableType === 'table' ? 'table-row' : 'custom-row';
  const checkboxClass = tableType === 'table' ? '.row-checkbox' : '.row-checkbox-custom';
  const selectAllId = tableType === 'table' ? 'selectAllTable' : 'selectAllCustom';
  
  const visibleCheckboxes = Array.from(document.querySelectorAll(checkboxClass))
    .filter(cb => {
      const rowId = cb.dataset.rowId;
      const row = document.querySelector(`[data-row-id="${rowId}"]`);
      return row && row.style.display !== 'none' && rowId.startsWith(prefix);
    });
  
  if (visibleCheckboxes.length === 0) {
    const selectAll = document.getElementById(selectAllId);
    if (selectAll) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    }
    return;
  }
  
  const checkedCount = visibleCheckboxes.filter(cb => cb.checked).length;
  const selectAll = document.getElementById(selectAllId);
  
  if (selectAll) {
    if (checkedCount === 0) {
      selectAll.checked = false;
      selectAll.indeterminate = false;
    } else if (checkedCount === visibleCheckboxes.length) {
      selectAll.checked = true;
      selectAll.indeterminate = false;
    } else {
      selectAll.checked = false;
      selectAll.indeterminate = true;
    }
  }
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

  // Select all checkbox handlers
  const selectAllTable = document.getElementById("selectAllTable");
  if (selectAllTable) {
    selectAllTable.addEventListener("change", function() {
      const isChecked = this.checked;
      document.querySelectorAll('.row-checkbox').forEach(cb => {
        const rowId = cb.dataset.rowId;
        const row = document.querySelector(`tr[data-row-id="${rowId}"]`);
        if (row && row.style.display !== 'none') {
          cb.checked = isChecked;
        }
      });
    });
  }

  const selectAllCustom = document.getElementById("selectAllCustom");
  if (selectAllCustom) {
    selectAllCustom.addEventListener("change", function() {
      const isChecked = this.checked;
      document.querySelectorAll('.row-checkbox-custom').forEach(cb => {
        const rowId = cb.dataset.rowId;
        const row = document.querySelector(`div[data-row-id="${rowId}"]`);
        if (row && row.style.display !== 'none') {
          cb.checked = isChecked;
        }
      });
    });
  }

  // Individual row checkbox handlers
  document.addEventListener('change', function(e) {
    if (e.target.classList.contains('row-checkbox')) {
      updateSelectAllState('table');
    } else if (e.target.classList.contains('row-checkbox-custom')) {
      updateSelectAllState('custom');
    }
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
      // Clear deleted rows on reset
      DELETED_ROWS_TABLE.clear();
      DELETED_ROWS_CUSTOM.clear();
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

