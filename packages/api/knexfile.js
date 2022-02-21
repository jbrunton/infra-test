// Update with your config settings.

const baseConfig = {
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

const getProductionConfig = () => {
  return process.env.POSTGRES_CONNECTION_STRING
    ? {
      ...baseConfig,
      connection: process.env.POSTGRES_CONNECTION_STRING,
    } : {
      ...baseConfig,
      connection: {
        ...baseConfig.connection,
        host: 'postgres'
      },
    };
};

module.exports = {
  development: baseConfig,
  production: getProductionConfig(),
};
