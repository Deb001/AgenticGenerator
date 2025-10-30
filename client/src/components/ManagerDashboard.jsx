import React, { useState, useEffect } from 'react';
import api from '../api/api';

const SHIFT_TYPES = ['Morning', 'Afternoon', 'Night'];

const ManagerDashboard = () => {
  const [date, setDate] = useState('');
  const [assignments, setAssignments] = useState({});
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch employees for the manager's store on mount
  useEffect(() => {
    const fetchEmployees = async () => {
      setFetchingEmployees(true);
      try {
        const response = await api.getEmployees(); // Expected to return an array of { id, name }
        setEmployees(response);
      } catch (err) {
        console.error('Failed to fetch employees:', err);
        setErrorMessage('Unable to load employees. Please try again later.');
      } finally {
        setFetchingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  const handleShiftChange = (shift, employeeId) => {
    setAssignments(prev => ({
      ...prev,
      [shift]: employeeId,
    }));
  };

  const validateForm = () => {
    if (!date) {
      setErrorMessage('Please select a date.');
      return false;
    }
    for (const shift of SHIFT_TYPES) {
      if (!assignments[shift]) {
        setErrorMessage(`Please assign an employee for the ${shift} shift.`);
        return false;
      }
    }
    setErrorMessage('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      date,
      assignments: SHIFT_TYPES.map(shift => ({
        shift,
        employeeId: assignments[shift],
      })),
    };

    setLoading(true);
    try {
      await api.createSchedule(payload);
      alert('Schedule created successfully.');
      // Reset form
      setDate('');
      setAssignments({});
    } catch (err) {
      console.error('Schedule creation failed:', err);
      const msg = err.response?.data?.message || 'Failed to create schedule. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-dashboard">
      <h2>Create Shift Schedule</h2>
      {errorMessage && <div className="error-message" style={{ color: 'red', marginBottom: '1rem' }}>{errorMessage}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label htmlFor="schedule-date">Date:</label><br />
          <input
            type="date"
            id="schedule-date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
          />
        </div>

        {SHIFT_TYPES.map(shift => (
          <div key={shift} style={{ marginBottom: '1rem' }}>
            <label htmlFor={`shift-${shift}`}>{shift} Shift:</label><br />
            <select
              id={`shift-${shift}`}
              value={assignments[shift] || ''}
              onChange={e => handleShiftChange(shift, e.target.value)}
              disabled={fetchingEmployees}
              required
            >
              <option value="">-- Select Employee --</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name}
                </option>
              ))}
            </select>
          </div>
        ))}

        <button type="submit" disabled={loading || fetchingEmployees}>
          {loading ? 'Submitting...' : 'Create Schedule'}
        </button>
      </form>
    </div>
  );
};

export default ManagerDashboard;