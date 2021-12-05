const { response } = require('express');
const express = require('express');
const knex = require('./db/knex');
const app = express()
const port = 3001

const db = require('./db/knex');

app.get('/counters/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      res.status(422).send("Missing sessionId");
      return;
    }
    const [counter] = await db.transaction(async trx => {
      const counters = await trx.select('*')
        .from('counters')
        .where('session_id', sessionId);

      if (counters.length === 0) {
        return knex.transacting(trx)
          .insert({ session_id: sessionId, count: 0 })
          .returning("*");
      }

      return counters;
    });
    
    res.json(counter);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
