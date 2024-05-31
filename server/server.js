import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import main from './routes/main.js';
import users from './routes/user.js';
import collections from './routes/collection.js';
import connectMongoDB from './db/connection.js';

const PORT = process.env.PORT || 5050;
const CLIENT_URL = process.env.VITE_CLIENT_URL || 'http://localhost:5173';
const app = express();
connectMongoDB();
console.log(CLIENT_URL);

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

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
