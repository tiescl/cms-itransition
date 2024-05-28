import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import records from './routes/record.js';
import connectMongoDB from './db/connection.js';

const PORT = process.env.PORT || 5050;
const app = express();
connectMongoDB();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/');
app.use('/users', user);
app.use('/collections', records);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
