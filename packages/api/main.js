const express = require('express');
const app = express()
const port = process.env.API_PORT || 3001;
const countersRouter = require('./routers/counters');

const cors = require('cors');
app.use(cors());

app.get("/health", (_, res) => {
  res.sendStatus(200);
});

app.use("/counters", countersRouter);

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
