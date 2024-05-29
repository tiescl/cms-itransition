import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import main from './routes/main.js';
import users from './routes/user.js';
import collections from './routes/collection.js';
import connectMongoDB from './db/connection.js';
import checkCurrentUser from './routes/middleware/checkCurrentUser.js';

const PORT = process.env.PORT || 5050;
const app = express();
connectMongoDB();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api', main);
app.use('/api/users', users);
app.use('/api/collections', collections);
app.get('/api/*', checkCurrentUser);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
