import React, { useState, useEffect } from 'react';
import api from '../api/api';

/**
 * Decode a JWT and return its payload as a plain object.
 * This simple implementation does not verify the token signature.
 */
function decodeJwt(token) {
  try {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    console.error('Failed to decode JWT', e);
    return null;
  }
}

/**
 * Group an array of shift objects by their date (YYYY‑MM‑DD).
 */
function groupShiftsByDate(shifts) {
  return shifts.reduce((acc, shift) => {
    const dateKey = new Date(shift.date).toISOString().split('T')[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(shift);
    return acc;
  }, {});
}

/**
 * EmployeeSchedule – displays the logged‑in employee's assigned shifts.
 */
export default function EmployeeSchedule() {
  const [shifts, setShifts] = useState([]);
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchShifts() {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Authentication token not found');

        const payload = decodeJwt(token);
        if (!payload || !payload.employeeId) {
          throw new Error('Invalid token payload');
        }

        const employeeId = payload.employeeId;
        const data = await api.getSchedules(employeeId);
        setShifts(data);
        setGrouped(groupShiftsByDate(data));
      } catch (err) {
        console.error(err);
        setError(err.message || 'Failed to load schedules');
      } finally {
        setLoading(false);
      }
    }

    fetchShifts();
  }, []);

  if (loading) {
    return <div>Loading schedule...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  if (shifts.length === 0) {
    return <div>No shifts scheduled.</div>;
  }

  return (
    <div className="employee-schedule">
      {Object.entries(grouped)
        .sort(([a], [b]) => (a > b ? 1 : -1))
        .map(([date, dayShifts]) => (
          <section key={date} className="schedule-day">
            <h3>{new Date(date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
            <ul>
              {dayShifts
                .sort((s1, s2) => new Date(s1.startTime) - new Date(s2.startTime))
                .map(shift => (
                  <li key={shift.id} className="shift-item">
                    <strong>{shift.type || 'Shift'}</strong>:{' '}
                    {new Date(shift.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                    {new Date(shift.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </li>
                ))}
            </ul>
          </section>
        ))}
    </div>
  );
}