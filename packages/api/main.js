const express = require('express');
const app = express()
const port = 3001
const countersRouter = require('./controllers/counters');

app.use("/counters", countersRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
