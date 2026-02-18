import express from 'express';
import cors from 'cors';
import { initDb } from './database.js';
import routes from './routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Habit Tracker SaaS Backend Running');
});

app.use(routes);

const PORT = process.env.PORT || 4000;
initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
});
