var pg = require('pg');
require('dotenv').config();

var dbConnectionString = process.env.DATABASE_CONN || 'postgresql://postgres:postgres@localhost:5432/apparel_hub_db';

var pool = new pg.Pool({
  connectionString: dbConnectionString,
  max: 15,
  idleTimeoutMillis: 20000
});

module.exports = pool;
