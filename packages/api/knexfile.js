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
  return process.env.POSTGRES_URL
    ? {
      ...baseConfig,
      connection: {
        connectionString: process.env.POSTGRES_URL,
        ssl: {
          ca: process.env.POSTGRES_CA_CERT,
        },
      }
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
