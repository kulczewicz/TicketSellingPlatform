const Pool = require('pg').Pool
export const pool = new Pool({
    user: 'ticketadmin',
    host: 'localhost',
    database: 'ticketapi',
    password: 'TicketPlatform1234',
    port: 5432,
})