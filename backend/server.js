import express from 'express';
import cors from 'cors';
import { initDatabase } from './src/db.js';
import routes from './src/routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Init
initDatabase().then(() => {
  app.listen(PORT, () => console.log(`🏊 API running on :${PORT}`));
});
