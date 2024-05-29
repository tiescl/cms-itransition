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
app.use('/', main);
app.use('/users', users);
app.use('/collections', collections);
app.get('*', checkCurrentUser);

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
