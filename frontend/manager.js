document.addEventListener('DOMContentLoaded', () => {
  const storeSelect = document.getElementById('storeSelect');
  const weekStartInput = document.getElementById('weekStart');
  const runBtn = document.getElementById('runBtn');
  const gridContainer = document.getElementById('gridContainer');
  const messageBox = document.getElementById('messageBox');

  // Mock store list (fallback if API fails)
  const mockStores = [{ id: 1, name: 'Main Street Store' }];

  async function loadStores() {
    try {
      const res = await fetch('/api/stores');
      if (!res.ok) throw new Error('Network');
      const stores = await res.json();
      populateStores(stores);
    } catch {
      populateStores(mockStores);
    }
  }

  function populateStores(stores) {
    storeSelect.innerHTML = '';
    stores.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name;
      storeSelect.appendChild(opt);
    });
  }

  function renderGrid(shifts) {
    gridContainer.innerHTML = '';
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const shiftTypes = ['Morning','Afternoon','Evening'];
    // Header row
    const header = document.createElement('div');
    header.className = 'col-span-4 font-bold text-center';
    header.textContent = 'Select Store & Week, then Run Scheduler';
    gridContainer.appendChild(header);
    // Create 7x3 cells
    days.forEach(day => {
      shiftTypes.forEach(type => {
        const cell = document.createElement('div');
        cell.className = 'border rounded p-2 bg-white hover:bg-gray-100 cursor-pointer transition';
        cell.dataset.day = day;
        cell.dataset.type = type;
        cell.textContent = `${day} - ${type}`;
        cell.addEventListener('click', () => openAssignModal(cell.dataset));
        gridContainer.appendChild(cell);
      });
    });
  }

  async function runScheduler() {
    const storeId = storeSelect.value;
    const weekStart = weekStartInput.value;
    if (!storeId || !weekStart) {
      messageBox.textContent = 'Please select store and week.';
      return;
    }
    try {
      const res = await fetch('/api/scheduler/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ store_id: Number(storeId), week_start: weekStart })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Scheduler error');
      messageBox.textContent = 'Schedule generated successfully.';
      // Refresh grid after run
      await fetchSchedule();
    } catch (e) {
      messageBox.textContent = e.message;
    }
  }

  async function fetchSchedule() {
    const storeId = storeSelect.value;
    const weekStart = weekStartInput.value;
    if (!storeId || !weekStart) return;
    try {
      const res = await fetch(`/api/stores/${storeId}/schedule?week_start=${weekStart}`);
      const schedule = await res.json();
      renderGrid(schedule.shifts || []);
    } catch {
      renderGrid([]);
    }
  }

  async function openAssignModal({ day, type }) {
    const employeeId = prompt('Enter Employee ID to assign to ' + day + ' ' + type + ':');
    if (!employeeId) return;
    // Find shift ID from rendered cells (simplified mock)
    const shiftId = Math.floor(Math.random() * 1000) + 1; // placeholder
    try {
      const res = await fetch(`/api/shifts/${shiftId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shift_id: shiftId, employee_id: Number(employeeId) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Assignment error');
      alert('Assignment updated');
      await fetchSchedule();
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }

  runBtn.addEventListener('click', runScheduler);
  storeSelect.addEventListener('change', fetchSchedule);
  weekStartInput.addEventListener('change', fetchSchedule);

  loadStores();
});