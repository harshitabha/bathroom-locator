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

const swaggerDocument = YAML.load('./api/openapi.yaml');

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use('/api/v0/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(
    OpenApiValidator.middleware({
      apiSpec: './api/openapi.yaml',
      validateRequests: true,
      validateResponses: true,
    }),
);

app.get('/bathroom', bathroom.getBathroomsInBounds);

app.post('/bathroom', bathroom.createBathroom);
app.put('/bathroom', bathroom.updateBathroom);

app.get('/bathroom/updates', bathroom.getUpdates);

app.get('/user/likes', bathroom.getUserLikes);
app.post('/user/likes', bathroom.likeBathroom);
app.delete('/user/likes', bathroom.unlikeBathroom);

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
  console.log('API Testing UI is at: http://localhost:3000/api/v0/docs/');
});

export default app;
