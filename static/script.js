/**
 * Frontend script for manager and employee pages.
 * Provides functions to initialize pages, fetch data, render schedule,
 * and handle schedule generation.
 */

/** Global simulated current user identifier. */
const CURRENT_USER_ID = (function () {
  const params = new URLSearchParams(window.location.search);
  return params.get('user_id') || '1';
})();

/**
 * Utility to retrieve a query parameter value.
 * @param {string} name - Parameter name.
 * @returns {string|null} Parameter value or null if not present.
 */
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Wrapper around fetch that returns parsed JSON and handles HTTP/network errors.
 * @param {string} url - The endpoint URL.
 * @param {RequestInit} [options] - Optional fetch configuration.
 * @returns {Promise<any>} Resolves with parsed JSON data.
 */
function fetchJSON(url, options = {}) {
  return fetch(url, options)
    .then(response => {
      if (!response.ok) {
        return response.text().then(text => {
          throw new Error(`HTTP ${response.status}: ${text}`);
        });
      }
      return response.json();
    })
    .catch(error => {
      alert(`Network error: ${error.message}`);
      throw error;
    });
}

/**
 * Render a schedule table inside the element with id "schedule-container".
 * @param {Array<Object>} data - Array of schedule entries.
 */
function renderScheduleTable(data) {
  const container = document.getElementById('schedule-container');
  container.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    container.textContent = 'No schedule data available.';
    return;
  }

  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  ['Date', 'Employee', 'Shift'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(entry => {
    const tr = document.createElement('tr');
    const tdDate = document.createElement('td');
    tdDate.textContent = entry.date || '';
    const tdEmployee = document.createElement('td');
    tdEmployee.textContent = entry.employee_name || entry.employee_id || '';
    const tdShift = document.createElement('td');
    tdShift.textContent = entry.shift_name || entry.shift_id || '';
    tr.appendChild(tdDate);
    tr.appendChild(tdEmployee);
    tr.appendChild(tdShift);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  container.appendChild(table);
}

/**
 * Render a simple list of schedule entries for an employee.
 * @param {Array<Object>} data - Filtered schedule entries.
 */
function renderEmployeeSchedule(data) {
  const container = document.getElementById('schedule-container');
  container.innerHTML = '';

  if (!Array.isArray(data) || data.length === 0) {
    container.textContent = 'No scheduled shifts.';
    return;
  }

  const ul = document.createElement('ul');
  data.forEach(entry => {
    const li = document.createElement('li');
    const date = entry.date || '';
    const shift = entry.shift_name || entry.shift_id || '';
    li.textContent = `${date}: ${shift}`;
    ul.appendChild(li);
  });
  container.appendChild(ul);
}

/**
 * Initialize the manager page: load existing schedule and bind UI actions.
 */
function initManagerPage() {
  const storeId = getQueryParam('store_id');
  if (!storeId) {
    alert('Missing store_id query parameter.');
    return;
  }

  // Load any existing schedule.
  loadManagerSchedule(storeId);

  // Bind generate button.
  const generateBtn = document.getElementById('generate-btn');
  if (generateBtn) {
    generateBtn.addEventListener('click', () => handleGenerateSchedule(storeId));
  }
}

/**
 * Fetch and render the schedule for the manager view.
 * @param {string} storeId - Identifier of the store.
 */
function loadManagerSchedule(storeId) {
  fetchJSON(`/api/schedule?store_id=${encodeURIComponent(storeId)}`)
    .then(data => {
      renderScheduleTable(data);
    })
    .catch(() => {
      // Errors are already shown by fetchJSON.
    });
}

/**
 * Handle the "Generate Schedule" button click.
 * Sends a POST request to the backend and refreshes the view on success.
 * @param {string} storeId - Store identifier.
 */
function handleGenerateSchedule(storeId) {
  const startDateInput = document.getElementById('start-date');
  if (!startDateInput || !startDateInput.value) {
    alert('Please select a start date.');
    return;
  }

  const payload = {
    store_id: storeId,
    start_date: startDateInput.value
  };

  fetchJSON('/api/schedule/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  })
    .then(() => {
      alert('Schedule generated successfully.');
      loadManagerSchedule(storeId);
    })
    .catch(() => {
      // Errors are already shown by fetchJSON.
    });
}

/**
 * Initialize the employee page: fetch schedule and display only the logged‑in employee's entries.
 */
function initEmployeePage() {
  const storeId = getQueryParam('store_id');
  if (!storeId) {
    alert('Missing store_id query parameter.');
    return;
  }

  fetchJSON(`/api/schedule?store_id=${encodeURIComponent(storeId)}`)
    .then(data => {
      const personal = Array.isArray(data)
        ? data.filter(entry => String(entry.employee_id) === String(CURRENT_USER_ID))
        : [];
      renderEmployeeSchedule(personal);
    })
    .catch(() => {
      // Errors are already shown by fetchJSON.
    });
}

/**
 * Detect page type on DOMContentLoaded and invoke the appropriate initializer.
 */
document.addEventListener('DOMContentLoaded', () => {
  const bodyId = document.body.id;
  if (bodyId === 'manager-page') {
    initManagerPage();
  } else if (bodyId === 'employee-page') {
    initEmployeePage();
  }
});