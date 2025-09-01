/**
 * @typedef {Object} MediaState
 * @property {boolean} video - Camera state
 * @property {boolean} audio - Microphone state
 * @property {boolean} screen - Screen sharing state
 */

/**
 * @typedef {Object} Participant
 * @property {WebSocket} ws - WebSocket connection
 * @property {string} username - User's display name
 * @property {MediaState} mediaState - User's media state
 */

/**
 * @typedef {Object} Room
 * @property {Map<string, Participant>} participants - Map of participants
 * @property {string} roomId - Unique room identifier
 */

module.exports = {};
