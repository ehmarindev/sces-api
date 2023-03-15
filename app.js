const express = require('express');
const cors = require('cors');
const { appPort } = require('./env');
const { routes } = require('./routes');

require('./lib/mongoose');

const app = express();

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send("SCES API en construcción");
  });

routes(app);

app.use((err, req, res, next) => {
    if (err.isBoom) {
      const { output } = err;
      res.status(output.statusCode).json(output.payload);
    }
    else next(err);
  });
  
  app.use((err, req, res, next) => {
    console.error(err.message);
    res.status(500).json({
      message: err.message
      // stack: err.stack
    });
  });

app.listen(appPort, () => {
    console.log(`Listening on port ${appPort}`);
})