const express = require('express');
const app = express()
const port = 3001
const db = require('./db/knex');

const getCounter = async (sessionId, trx) => {
  let counters = await trx.select('*')
    .from('counters')
    .where('session_id', sessionId);

  if (counters.length === 0) {
    counters = await trx("counters")
      .insert({ session_id: sessionId, count: 0 })
      .returning("*");
  }

  return counters[0];
};

app.get('/counters/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      res.status(422).send("Missing sessionId");
      return;
    }

    const counter = await db.transaction(trx => {
      return getCounter(sessionId, trx)
    });
    
    res.json(counter);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
})

app.put('/counters/:sessionId/increment', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      res.status(422).send("Missing sessionId");
      return;
    }

    const counters = await db("counters")
      .increment('count')
      .where("session_id", sessionId)
      .returning("*");
    
    res.json(counters[0]);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
})

app.delete('/counters/:sessionId', async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    if (!sessionId) {
      res.status(422).send("Missing sessionId");
      return;
    }

    await db("counters")
      .delete()
      .where("session_id", sessionId);
    
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
