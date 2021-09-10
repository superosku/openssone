import {Collection, ObjectId} from "mongodb";
const { promisify } = require("util");

const {MongoClient} = require("mongodb");
const redis = require("redis");

const express = require('express');
import {Request, Response, NextFunction} from 'express'
import * as ws from 'ws';
import {RedisClient} from "redis";
// const cors = require('cors')

const app = express();
const expressWs = require('express-ws')(app);
app.use(require('cors')())
app.use(require('body-parser').json())

const mongoUri = 'mongodb://localhost'

// https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
const makeId = (
  length: number,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
) => {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const randomName = () => {
  const a1 = ['good', 'fast', 'great', 'big', 'smart']
  const a2 = ['duck', 'geese', 'elephant', 'car', 'house']
  const s = (
    a1[Math.floor(Math.random() * a1.length)] + '-' +
    a2[Math.floor(Math.random() * a2.length)] + '-' +
    makeId(2, '0123456789')
  )
  return s
}

// DB middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const mongoClient = new MongoClient(mongoUri)
  await mongoClient.connect()
  const db = mongoClient.db('testdb')
  req.app.locals.db = db

  res.on('finish', async () => {
    await mongoClient.close()
  })
  next()
})

// redis middleware
app.use(async (req: Request, res: Response, next: NextFunction) => {
  const redisClient = redis.createClient();
  req.app.locals.redisClient = redisClient

  res.on('finish', async () => {
    // await mongoClient.close()
  })
  next()
})

app.get('/', (req: Request, res: Response) => {
  res.send('Hello GET');
})

interface IPlayer {
  name: string,
  id: string,
  joinSlug: string,
}

interface IPiece {
  sideTypes: [number, number, number, number],
  extraInfo: number,
  sideConnections: [number, number, number, number, number, number, number, number],
  roadConnections: [number, number, number, number],
}

interface IPieceHolder {
  piece: IPiece,
  x: number,
  y: number,
}

interface IGame {
  _id?: ObjectId,
  createdAt: Date,
  joinSlug: string,
  players: IPlayer[],
  pieceHolders: IPieceHolder[],
  turn: string,
}

app.post('/games/new', async (req: Request, res: Response) => {
  const collection: Collection = await req.app.locals.db.collection('games')

  const player: IPlayer = {
    name: randomName(),
    id: makeId(5),
    joinSlug: makeId(10),
  }

  const game: IGame = {
    createdAt: new Date(),
    joinSlug: makeId(5, 'abcdefghijklmnopqrstuvwxyz0123456789'),
    players: [player],
    turn: player.id,
    pieceHolders: [],
  }
  const result = await collection.insertOne(game)
  game._id = result.insertedId
  res.send(JSON.stringify({
    data: game,
    meta: {
      you: player
    }
  }))
})

app.post('/games/join/:joinSlug', async (req: Request, res: Response) => {
  const joinSlug = req.params.joinSlug

  const collection: Collection<IGame> = await req.app.locals.db.collection('games')
  const game: IGame | null = await collection.findOne({joinSlug})

  if (!game) {
    res.sendStatus(404);
    return
  }

  const newPlayer: IPlayer = {
    name: randomName(),
    id: makeId(5),
    joinSlug: makeId(10),
  }

  const updateResult = await collection.findOneAndUpdate(
    {_id: game._id},
    { $set: {players: [...game.players, newPlayer]}}
  )

  res.send({
    data: JSON.stringify(updateResult),
    meta: {you: newPlayer},
  })
})

app.get('/games', async (req: Request, res: Response) => {
  const collection = await req.app.locals.db.collection('games')
  const games = await collection.find().toArray()
  res.send(JSON.stringify(games))
})

app.get('/games/:gameId', async (req: Request, res: Response) => {
  const gameId = req.params.gameId

  const collection: Collection<IGame> = await req.app.locals.db.collection('games')
  const game: IGame | null = await collection.findOne({_id: new ObjectId(gameId)})

  if (!game) {
    res.sendStatus(404);
    return
  }

  res.send(JSON.stringify(game))
})

app.post('/games/:gameId/pieces', async (req: Request, res: Response) => {
  const gameId = req.params.gameId

  const collection: Collection<IGame> = await req.app.locals.db.collection('games')
  const game: IGame | null = await collection.findOne({_id: new ObjectId(gameId)})

  if (!game) {
    res.sendStatus(404);
    return
  }

  const newPieceHolder: IPieceHolder = req.body
  const updateResult = await collection.findOneAndUpdate(
    {_id: game._id},
    { $set: {pieceHolders: [...game.pieceHolders, newPieceHolder]}}
  )

  const redisClient: RedisClient = req.app.locals.redisClient
  const publish = promisify(redisClient.publish).bind(redisClient)
  console.log('Publishing')
  const response = await publish("game-event", JSON.stringify({a: 'something'}))
  console.log('Published', response)

  res.send(JSON.stringify(updateResult))
})

app.ws('/messages', (ws: ws, req: Request) => {
  const redisClient: RedisClient = req.app.locals.redisClient

  ws.send('Initial message');

  redisClient.on("message", (channel, message) => {
    console.log("Received data:", channel, message)
    ws.send(message);
    console.log("Sent to websocket")
  })

  redisClient.subscribe('game-event')

  // ws.on('message', (msg) => {
  //   ws.send(msg);
  // });
});

// app.get('/echo', (req: Request, res: Response) => {
//   res.end()
// })
// app.ws('/echo', (ws: ws, req: Request) => {
//   ws.on('message', (msg) => {
//     ws.send(msg);
//   });
// });

const server = app.listen(8888, () => {
  const host = server.address().address
  const port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})


// const hostname = '127.0.0.1';
// const port = 3000;
//
// const server = http.createServer(
//   async (req: typeof IncomingMessage, res: typeof ServerResponse) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end('Hello World');
//
//     try {
//       await mongoClient.connect();
//       const mongoDb = mongoClient.db('tempdb');
//       const gamesCollection = mongoDb.collection('games');
//
//       // Query for a movie that has the title 'Back to the Future'
//       const game = await gamesCollection.findOne({});
//
//       console.log('movie', game);
//     } finally {
//       await mongoClient.close();
//     }
//
//   });
//
// server.listen(port, hostname, () => {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });
//
