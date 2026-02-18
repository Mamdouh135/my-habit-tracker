import express from 'express';
import cors from 'cors';
import { initDb } from './database.js';
import routes from './routes.js';
import contactRoutes from './contact.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Habit Tracker SaaS Backend Running');
});

app.use(routes);
app.use(contactRoutes);

const PORT = process.env.PORT || 4000;
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
});
