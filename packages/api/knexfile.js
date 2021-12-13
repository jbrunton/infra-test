// Update with your config settings.

const config = {
  client: 'postgresql',
  connection: {
    host : 'localhost',
    port : 5432,
    user : 'postgres',
    password : 'postgres',
    database : 'infra_test'
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './db/migrations'
  }
};

module.exports = {
  development: config,
};