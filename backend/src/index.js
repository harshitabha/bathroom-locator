import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import OpenApiValidator from 'express-openapi-validator';
import cors from 'cors';

import * as bathroom from './bathroom.js';

const port = 3000;
const app = express();

// enable CORS for frontend origin
app.use(cors({
  origin: 'http://localhost:5173',
}));

const swaggerDocument = YAML.load("./docs/openapi.yaml");

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
    OpenApiValidator.middleware({
      apiSpec: './docs/openapi.yaml',
      validateRequests: true,
      validateResponses: true,
    }),
);

app.get('/bathroom', bathroom.getBathrooms);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});

export default app;