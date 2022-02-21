// Update with your config settings.

const baseConfig = {
  client: 'postgresql',
  connection: {
    host : process.env.POSTGRES_HOST || (process.env.NODE_ENV === 'production' ? 'postgres' : 'localhost'),
    port : process.env.POSTGRES_PORT || 5432,
    user : process.env.POSTGRES_USER || 'postgres',
    password : process.env.POSTGRES_PASSWORD || 'postgres',
    database : process.env.POSTGRES_DB || 'infra_test'
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './db/migrations'
  }
};

const getSslConfig = () => {
  const disableSsl = ['true', '1'].includes(process.env.POSTGRES_DISABLE_SSL);
  if (disableSsl) {
    if (!['test', 'development'].includes(process.env.NODE_ENV)) {
      console.warn('WARNING: Postgres SSL disabled. This should never happen in production.');
    }
    // Useful for testing prod builds locally on without a managed DB.
    return null;
  } else {
    return {
      require: true,
      rejectUnauthorized: false,
      ca: process.env.POSTGRES_CA_CERT,
    };
  }
}

const getProductionConfig = () => {
  return {
    ...baseConfig,
    connection: {
      ...baseConfig.connection,
      ssl: getSslConfig(),
    },
  };
};

module.exports = {
  development: baseConfig,
  production: getProductionConfig(),
};
