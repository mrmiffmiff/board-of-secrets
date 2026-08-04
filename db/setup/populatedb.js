#! /usr/bin/env node

import { Client } from "pg";
import { argv } from "node:process";
import { readFileSync } from "node:fs";

const CREATE_SQL = readFileSync(import.meta.dirname + '/create.sql', 'utf8');

const host = argv[2] || process.env.PGHOST;
const database = argv[3] || process.env.PGDATABASE;
const role = argv[4] || process.env.PGUSER;
const pass = argv[5] || process.env.PGPASSWORD;


async function main() {
    console.log(`seeding to ${host}...`);
    const client = new Client({
        host: host,
        database: database,
        user: role,
        password: pass,
    });
    try {
        await client.connect();
        await client.query(CREATE_SQL);
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
    console.log("done");
}

await main();