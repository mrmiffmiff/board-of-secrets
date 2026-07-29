import pool from "./pool.js";

/**
 * @typedef {Object} User
 * @property {number} id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} username
 * @property {string} password_hash
 * @property {boolean} is_member
 */

// Not sure I'll ever need to retrieve all users, but I feel better having a full getter
async function getUsers() {
    /**
     * @type {import('pg').QueryResult<User>}
     */
    const { rows } = await pool.query("SELECT * FROM users;");
    return rows;
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
    return rows[0];
}

/**
 * 
 * @param {string} first_name 
 * @param {string} last_name 
 * @param {string} username 
 * @param {string} password_hash 
 */
async function addUser(first_name, last_name, username, password_hash) {
    await pool.query(`
        INSERT INTO users
        (first_name, last_name, username, password_hash, is_member)
        VALUES
        ($1, $2, $3, $4, $5);
        `, [first_name, last_name, username, password_hash, false])
}

export default {
    getUsers,
    getUser,
    addUser
};