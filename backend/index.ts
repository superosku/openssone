import {Collection, ObjectId} from "mongodb";

const {promisify} = require("util");

const {MongoClient} = require("mongodb");
const redis = require("redis");

const express = require('express');
import {Request, Response, NextFunction} from 'express'
import * as ws from 'ws';
import {RedisClient} from "redis";

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

app.get('/', (req: Request, res: Response) => {
  res.send('Hello GET');
})

interface IPlayer {
  name: string,
  id: string,
  joinSlug: string,
  lastPing: Date,
}

interface IPiece {
  sideTypes: [number, number, number, number],
  extraInfo: number,
  sideConnections: [number, number, number, number, number, number, number, number],
  roadConnections: [number, number, number, number],
}

interface IPieceHolder {
  piece: IPiece,
  playerId: string,
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
  status: 'created' | 'started' | 'done'
}

app.post('/games/new', async (req: Request, res: Response) => {
  const collection: Collection = await req.app.locals.db.collection('games')

  const player: IPlayer = {
    name: randomName(),
    id: makeId(5),
    joinSlug: makeId(10),
    lastPing: new Date()
  }

  const game: IGame = {
    createdAt: new Date(),
    joinSlug: makeId(5, 'abcdefghijklmnopqrstuvwxyz0123456789'),
    players: [player],
    turn: player.id,
    pieceHolders: [],
    status: 'created',
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

  if (game.status !== 'created') {
    res.sendStatus(401)
    return
  }

  const newPlayer: IPlayer = {
    name: randomName(),
    id: makeId(5),
    joinSlug: makeId(10),
    lastPing: new Date()
  }

  const updateResult = await collection.findOneAndUpdate(
    {_id: game._id},
    {$set: {players: [...game.players, newPlayer]}}
  )

  res.send({
    data: updateResult.value,
    meta: {you: newPlayer},
  })

  const publishRedisClient: RedisClient = redis.createClient();
  const publish = promisify(publishRedisClient.publish).bind(publishRedisClient)
  const channelSlug = 'game-event:' + game._id
  await publish(channelSlug, JSON.stringify({type: 'player-joins'}))
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

  const joinSlug = req.headers.authorization && req.headers.authorization.split(' ')[1]
  const currentPlayer = game.players.filter(p => p.joinSlug === joinSlug)[0]

  if (!currentPlayer) {
    res.sendStatus(401)
    return
  }

  res.send(JSON.stringify({
    data: game,
    meta: {you: currentPlayer}
  }))
})

app.ws('/messages/:gameId', async (ws: ws, req: Request) => {
  const gameId = req.params.gameId
  const channelSlug = 'game-event:' + gameId

  const collection: Collection<IGame> = await req.app.locals.db.collection('games')
  const origGame: IGame | null = await collection.findOne({_id: new ObjectId(gameId)})

  if (!origGame) {
    ws.close(404)
    return
  }

  const h = (req.headers['sec-websocket-protocol'] || '') as string
  const joinSlug = h.split(' ')[1]
  const currentPlayer = origGame.players.filter(p => p.joinSlug === joinSlug)[0]

  if (!currentPlayer) {
    ws.close(401)
    return
  }

  // Send all redis messages to the client
  const redisClient: RedisClient = redis.createClient();
  redisClient.on("message", async (channel, message) => {
    console.log("Received data:", channel, message)
    ws.send(message);
    console.log("Sent to websocket to", currentPlayer.id)
  })
  redisClient.subscribe(channelSlug)

  // On received messages, publish to redis client
  const publishRedisClient: RedisClient = redis.createClient();
  const publish = promisify(publishRedisClient.publish).bind(publishRedisClient)
  ws.on('message', async (msg) => {
    const data = JSON.parse(msg as string)
    console.log("Web socket received data:", channelSlug, msg)

    const currentGame: IGame | null = await collection.findOne({_id: new ObjectId(gameId)})

    if (!currentGame) {
      return
    }

    if (data.type === 'start-game') {
      await collection.findOneAndUpdate(
        {_id: currentGame._id},
        {
          $set: {
            status: 'started'
          }
        }
      )
    }

    // Place new piece to mongo
    if (data.type === 'new-piece') {
      const newPieceHolder: IPieceHolder = {...data.data, playerId: currentPlayer.id}
      console.log('newPieceHolder', newPieceHolder)
      const curPlayerIndex = origGame.players.findIndex((p) => p.id === currentPlayer.id)
      const nextPlayerId = origGame.players[(curPlayerIndex + 1) % origGame.players.length].id

      await collection.findOneAndUpdate(
        {_id: currentGame._id},
        {
          $set: {
            turn: nextPlayerId,
            pieceHolders: [...currentGame.pieceHolders, newPieceHolder]
          }
        }
      )
      await publish(channelSlug, JSON.stringify({type: 'set-turn', data: {playerId: nextPlayerId}}))
    }

    // Publish to redis
    await publish(
      channelSlug,
      JSON.stringify({
        ...data,
        playerId: currentPlayer.id
      })
    )
  });

  ws.on('close', (code: number, reason: string) => {
    console.log('Websocket close', code, reason)
    redisClient.unsubscribe(channelSlug)
    redisClient.quit()
  })

  console.log('REDIS SUBSCRIBING TO', channelSlug)
});

const server = app.listen(8888, () => {
  const host = server.address().address
  const port = server.address().port

  console.log("Example app listening at http://%s:%s", host, port)
})
