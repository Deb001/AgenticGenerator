// src/edgeFunctions/smsNotifier.js

const axios = require('axios');
const notificationQueue = require('../utils/notificationQueue');
const EmployeeRepository = require('../repositories/EmployeeRepository');

/**
 * Sends a single SMS via Twilio.
 *
 * @param {string} to - Destination phone number in E.164 format.
 * @param {string} body - Message text.
 * @returns {Promise<void>}
 */
async function sendSms(to, body) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio configuration missing in environment variables.');
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const payload = new URLSearchParams({
    To: to,
    From: fromNumber,
    Body: body,
  });

  await axios.post(url, payload.toString(), {
    auth: {
      username: accountSid,
      password: authToken,
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    timeout: 10000,
  });
}

/**
 * Bolt edge entry point.
 *
 * @param {object} event   - Event payload (unused, required by Bolt).
 * @param {object} context - Execution context (unused, required by Bolt).
 * @returns {Promise<{statusCode:number, body:string}>}
 */
async function handler(event, context) {
  const pending = notificationQueue.drain(); // Expected to return an array of payloads
  const summary = {
    total: pending.length,
    success: 0,
    failure: 0,
    details: [], // { payload, error?: string }
  };

  for (const payload of pending) {
    try {
      // Expected payload shape: { employeeId?, phone?, message }
      let phone = payload.phone;
      if (!phone && payload.employeeId) {
        const employee = await EmployeeRepository.findByPk(payload.employeeId);
        if (!employee || !employee.phone) {
          throw new Error('Phone number not found for employee.');
        }
        phone = employee.phone;
      }

      if (!phone) {
        throw new Error('Phone number missing in payload.');
      }
      if (!payload.message) {
        throw new Error('Message text missing in payload.');
      }

      await sendSms(phone, payload.message);
      summary.success += 1;
      summary.details.push({ payload });
    } catch (err) {
      summary.failure += 1;
      console.error('SMS send failure:', err);
      summary.details.push({ payload, error: err.message });
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify(summary),
  };
}

module.exports = { handler };