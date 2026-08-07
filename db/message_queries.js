import pool from "./pool.js";

/**
 * @typedef {Object} Message
 * @property {number} id
 * @property {string} title
 * @property {Date} timeStamp
 * @property {string} post
 * @property {number} userId
 */

/**
 * Maps a raw snake_case `messages` row into a camelCase Message object.
 * Rows joined with `users` for author names will also carry
 * `authorFirstName`/`authorLastName`.
 * @param {Object} [row]
 * @returns {Message|undefined}
 */
function toMessage(row) {
    if (!row) return undefined;
    const { time_stamp, user_id, first_name, last_name, ...rest } = row;
    const message = {
        ...rest,
        timeStamp: time_stamp,
        userId: user_id,
    };
    if (first_name !== undefined || last_name !== undefined) {
        message.authorFirstName = first_name;
        message.authorLastName = last_name;
    }
    return message;
}

/**
 * Retrieves all messages, without any author information.
 * @returns Promise<Message[]>
 */
async function getMessages() {
    /**
     * @type {import('pg').QueryResult}
     */
    const { rows } = await pool.query("SELECT * FROM messages;");
    return rows.map(toMessage);
}

/**
 * Retrieves all messages along with the posting user's first and last name.
 * Only call this for viewers who are confirmed members.
 * @returns Promise<Message[]>
 */
async function getMessagesWithAuthors() {
    /**
     * @type {import('pg').QueryResult}
     */
    const { rows } = await pool.query(`
        SELECT messages.*, users.first_name, users.last_name
        FROM messages
        JOIN users ON messages.user_id = users.id;
        `);
    return rows.map(toMessage);
}

/**
 *
 * @param {string} title
 * @param {string} post
 * @param {number} userId
 */
async function addMessage(title, post, userId) {
    await pool.query(`
        INSERT INTO messages
        (title, time_stamp, post, user_id)
        VALUES
        ($1, NOW(), $2, $3);
        `, [title, post, userId])
}

export default {
    getMessages,
    getMessagesWithAuthors,
    addMessage,
};
