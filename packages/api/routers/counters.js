const express = require('express');
const router = express.Router();
const db = require('../db/knex');

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

router.get('/:sessionId', async (req, res) => {
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

router.put('/:sessionId/increment', async (req, res) => {
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

router.delete('/:sessionId', async (req, res) => {
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

module.exports = router;
