import pool from "./pool.js";

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} username
 * @property {string} passwordHash
 * @property {boolean} isMember
 * @property {boolean} isAdmin
 */

/**
 * Maps a raw snake_case `users` row into a camelCase User object.
 * @param {Object} [row]
 * @returns {User|undefined}
 */
function toUser(row) {
    if (!row) return undefined;
    const { first_name, last_name, password_hash, is_member, is_admin, ...rest } = row;
    return {
        ...rest,
        firstName: first_name,
        lastName: last_name,
        passwordHash: password_hash,
        isMember: is_member,
        isAdmin: is_admin,
    };
}

// Not sure I'll ever need to retrieve all users, but I feel better having a full getter
async function getUsers() {
    /**
     * @type {import('pg').QueryResult<User>}
     */
    const { rows } = await pool.query("SELECT * FROM users;");
    return rows.map(toUser);
}

/**
 *
 * @param {number} id - ID of User to retrieve
 * @returns Promise<User> - The user in question if present
 */
async function getUser(id) {
    /**
     * @type {import('pg').QueryResult<User>}
     */
    const { rows } = await pool.query("SELECT * FROM users WHERE id = $1;", [id]);
    return toUser(rows[0]);
}

/**
 *
 * @param {string} username - User's username
 * @returns Promise<User> - User in question
 */
async function getUserByUsername(username) {
    /**
     * @type {import('pg').QueryResult<User>}
     */
    const { rows } = await pool.query("SELECT * FROM users WHERE username = $1;", [username]);
    return toUser(rows[0]);
}

/**
 *
 * @param {string} firstName
 * @param {string} lastName
 * @param {string} username
 * @param {string} passwordHash
 */
async function addUser(firstName, lastName, username, passwordHash) {
    await pool.query(`
        INSERT INTO users
        (first_name, last_name, username, password_hash, is_member)
        VALUES
        ($1, $2, $3, $4, $5);
        `, [firstName, lastName, username, passwordHash, false])
}

/**
 * 
 * @param {number} id
 * @param {Object} [flags]
 * @param {boolean} [flags.isMember]
 * @param {boolean} [flags.isAdmin]
 */
async function upgradeUser(id, { isMember = false, isAdmin = false } = {}) {
    await pool.query(`
        UPDATE users
        SET is_member = is_member OR $2, is_admin = is_admin OR $3
        WHERE id = $1;
        `, [id, isMember, isAdmin]);
}

export default {
    getUsers,
    getUser,
    getUserByUsername,
    addUser,
    upgradeUser,
};