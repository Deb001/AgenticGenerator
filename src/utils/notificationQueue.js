/**
 * In‑memory notification queue.
 * Stores payloads of shape { employeeId: string, message: string }.
 * Provides enqueue and drain operations.
 */

const _queue = [];

/**
 * Validates that the payload has the required shape.
 * @param {any} payload
 * @throws {TypeError} If payload is invalid.
 */
function _validatePayload(payload) {
  if (typeof payload !== 'object' || payload === null) {
    throw new TypeError('Payload must be a non‑null object');
  }
  if (typeof payload.employeeId !== 'string' || payload.employeeId.trim() === '') {
    throw new TypeError('Payload must contain a non‑empty string `employeeId`');
  }
  if (typeof payload.message !== 'string' || payload.message.trim() === '') {
    throw new TypeError('Payload must contain a non‑empty string `message`');
  }
}

/**
 * Adds a notification payload to the queue.
 * @param {{ employeeId: string, message: string }} payload
 */
function enqueue(payload) {
  _validatePayload(payload);
  _queue.push({ employeeId: payload.employeeId, message: payload.message });
}

/**
 * Retrieves all queued notifications and clears the queue.
 * @returns {Array<{ employeeId: string, message: string }>}
 */
function drain() {
  const pending = _queue.slice(); // shallow copy
  _queue.length = 0; // reset
  return pending;
}

module.exports = {
  enqueue,
  drain,
};