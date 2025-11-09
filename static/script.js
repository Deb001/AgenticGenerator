// Client‑side logic for manager dashboard and employee view

/**
 * Fetches the list of shifts from the backend and populates the appropriate table.
 * If the manager dashboard is present, it fills the #shifts-table.
 * If the employee view is present, it filters by employee_id from the URL and fills #employee-shifts-table.
 */
async function loadSchedule() {
    try {
        const response = await fetch('/api/shifts');
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to load shifts (status ${response.status})`);
        }
        const shifts = await response.json();
        const managerTableBody = document.querySelector('#shifts-table tbody');
        const employeeTableBody = document.querySelector('#employee-shifts-table tbody');
        // Clear any existing rows
        if (managerTableBody) managerTableBody.innerHTML = '';
        if (employeeTableBody) employeeTableBody.innerHTML = '';
        // Determine which view we are on
        const urlParams = new URLSearchParams(window.location.search);
        const employeeId = urlParams.get('employee_id');
        if (managerTableBody) {
            // Manager view – show all shifts
            shifts.forEach(shift => {
                const row = document.createElement('tr');
                const dateCell = document.createElement('td');
                dateCell.textContent = shift.date;
                const typeCell = document.createElement('td');
                typeCell.textContent = shift.shift_type;
                const employeeCell = document.createElement('td');
                employeeCell.textContent = shift.employee_name || 'Unassigned';
                row.appendChild(dateCell);
                row.appendChild(typeCell);
                row.appendChild(employeeCell);
                managerTableBody.appendChild(row);
            });
        } else if (employeeTableBody && employeeId) {
            // Employee view – filter by employee_id
            const filtered = shifts.filter(s => String(s.employee_id) === employeeId);
            filtered.forEach(shift => {
                const row = document.createElement('tr');
                const dateCell = document.createElement('td');
                dateCell.textContent = shift.date;
                const typeCell = document.createElement('td');
                typeCell.textContent = shift.shift_type;
                const statusCell = document.createElement('td');
                statusCell.textContent = shift.status || 'Scheduled';
                row.appendChild(dateCell);
                row.appendChild(typeCell);
                row.appendChild(statusCell);
                employeeTableBody.appendChild(row);
            });
        }
    } catch (error) {
        alert(`Error loading schedule: ${error.message}`);
    }
}

/**
 * Sends a request to generate a new schedule for the given date range.
 * After a successful generation, the schedule view is refreshed.
 *
 * @param {string} startDate - ISO formatted start date (YYYY-MM-DD)
 * @param {string} endDate   - ISO formatted end date (YYYY-MM-DD)
 */
async function generateSchedule(startDate, endDate) {
    try {
        const payload = { start_date: startDate, end_date: endDate };
        const response = await fetch('/api/schedule', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Schedule generation failed (status ${response.status})`);
        }
        // Schedule generated successfully – reload the table
        await loadSchedule();
    } catch (error) {
        alert(`Error generating schedule: ${error.message}`);
    }
}

// Bind events after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    loadSchedule();
    const form = document.getElementById('generate-form');
    if (form) {
        form.addEventListener('submit', async (event) => {
            event.preventDefault();
            const startDate = document.getElementById('start-date').value;
            const endDate = document.getElementById('end-date').value;
            if (!startDate || !endDate) {
                alert('Both start and end dates are required.');
                return;
            }
            await generateSchedule(startDate, endDate);
        });
    }
});

// Export functions for potential downstream use (e.g., testing)
export { loadSchedule, generateSchedule };