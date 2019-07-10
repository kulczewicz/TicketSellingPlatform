const dotenv = require('dotenv').config();
if (dotenv.error) {
    throw dotenv.error;
}

const Pool = require('pg').Pool
export const pg = new Pool({
    user: process.env.ROLE,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORTDB
})