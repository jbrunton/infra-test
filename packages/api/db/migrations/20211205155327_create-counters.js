
exports.up = async (knex) => {
  await knex.schema.createTable('counters', (table) => {
    table.increments('id');
    table.string('session_id').notNullable();
    table.integer('count').notNullable();
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('counters');
};
