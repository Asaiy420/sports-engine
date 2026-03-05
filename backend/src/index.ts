import AgentAPI from 'apminsight';

AgentAPI.config();

import express, { type Request, type Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { matchRouter } from './routes/matches';
import http from 'http';
import { attachWebSocketServer } from './ws/server';
import { securityMiddleware } from '../arcjet';
import { commentaryRouter } from './routes/commentary';

const PORT = process.env.PORT!;
const HOST = process.env.HOST!;

const app = express();

const server = http.createServer(app);

app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(securityMiddleware());

app.use('/matches', matchRouter);
app.use('/matches/:id/commentary', commentaryRouter);

app.get('/', (req: Request, res: Response) => {
  res.send('Welcome to the Sports Engine API!');
});

const { broadcastMatchCreated, broadcastCommentary } =
  attachWebSocketServer(server);
app.locals.broadcastMatchCreated = broadcastMatchCreated;
app.locals.broadcastCommentary = broadcastCommentary;

server.listen(PORT, parseInt(HOST), () => {
  const baseUrl =
    HOST === '0.0.0.0' ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`The server is running on ${baseUrl}`);
  console.log(
    `Websocker Server is Running On ${baseUrl.replace('http', 'ws')}/ws`
  );
});
