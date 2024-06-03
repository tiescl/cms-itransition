import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import cron from 'node-cron';
import 'dotenv/config';
import main from './routes/main.js';
import users from './routes/user.js';
import collections from './routes/collection.js';
import connectMongoDB from './db/connection.js';

const PORT = process.env.PORT || 5050;
const CLIENT_URL = process.env.VITE_CLIENT_URL || 'http://localhost:5173';
const app = express();
connectMongoDB();
console.log(`Client url: ${CLIENT_URL}`);

app.use(
  cors({
    origin: CLIENT_URL,
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);
app.use(express.json());
app.use('/api', main);
app.use('/api/users', users);
app.use('/api/collections', collections);
cron.schedule('*/5 * * * *', () => {
  fetch('https://cms-itransition.onrender.com/api/warmup')
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error(`Server responded with status: ${response.status}`);
      }
    })
    .then((data) => console.log(data))
    .catch((error) => console.error('Warm-up request failed:', error.message));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
