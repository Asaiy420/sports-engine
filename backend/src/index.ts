import express from 'express';
import 'dotenv/config';
import { matchRouter } from './routes/matches';

const app = express();
const PORT = process.env.PORT!;

app.use(express.json());

app.use('/matches', matchRouter);

app.listen(PORT, () => {
  console.log(`The server is running on PORT: ${PORT}`);
});
