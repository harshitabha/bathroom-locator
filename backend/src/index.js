import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const port = 3000;
const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: false}));
const swaggerDocument = YAML.load("./docs/openapi.yaml");


app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, () => {
  console.log(`App running on port ${port}.`)
});