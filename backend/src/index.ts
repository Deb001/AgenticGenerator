import dotenv from 'dotenv';
import app from './app';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

dotenv.config();

const PORT = process.env.PORT || 5000;

const swaggerDocument = YAML.load(path.join(__dirname, '..', 'swagger.yaml'));

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});