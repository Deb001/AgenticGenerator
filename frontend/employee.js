document.addEventListener('DOMContentLoaded', () => {
  const weekStartInput = document.getElementById('weekStart');
  const scheduleList = document.getElementById('scheduleList');
  const toast = document.getElementById('toast');

  const employeeId = 1; // stub authentication

  async function loadSchedule() {
    const weekStart = weekStartInput.value;
    if (!weekStart) return;
    try {
      const res = await fetch(`/api/employees/${employeeId}/schedule?week_start=${weekStart}`);
      const data = await res.json();
      renderSchedule(data.shifts || []);
    } catch {
      scheduleList.innerHTML = '<li class="text-red-600">Failed to load schedule.</li>';
    }
  }

  function renderSchedule(shifts) {
    scheduleList.innerHTML = '';
    shifts.forEach(s => {
      const li = document.createElement('li');
      li.className = 'p-2 border rounded bg-gray-50';
      li.textContent = `${s.date} - ${s.shift_type} (${s.start_time}\u2011${s.end_time})`;
      scheduleList.appendChild(li);
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
  }

  // Simple polling for notifications (placeholder)
  setInterval(async () => {
    try {
      const res = await fetch(`/api/notifications?employee_id=${employeeId}`);
      const notif = await res.json();
      if (notif && notif.message) showToast(notif.message);
    } catch {}
  }, 10000);

  weekStartInput.addEventListener('change', loadSchedule);
});