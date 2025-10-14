import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import OpenApiValidator from 'express-openapi-validator';

import * as bathroom from './bathroom.js';

const port = 3000;
const app = express();
const swaggerDocument = YAML.load("./docs/openapi.yaml");

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
    OpenApiValidator.middleware({
      apiSpec: './docs/openapi.yaml',
      validateRequests: false,
      validateResponses: false,
    }),
);

app.get('/bathroom', bathroom.getBathrooms);

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});