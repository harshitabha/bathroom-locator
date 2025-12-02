import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import OpenApiValidator from 'express-openapi-validator';
import cors from 'cors';

import * as bathroom from './bathroom.js';

const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL;
const app = express();

// enable CORS for frontend origin
app.use(cors({
  origin: FRONTEND_URL,
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

app.listen(PORT, () => {
  console.log(`App running on port ${PORT}.`);
  console.log(`API Testing UI is at: http://localhost:${PORT}/api/v0/docs/`);
});

export default app;
