import {Collection, ObjectId} from "mongodb";

const {promisify} = require("util");

const {MongoClient} = require("mongodb");
const redis = require("redis");

const express = require('express');
import {Request, Response, NextFunction} from 'express'
import * as ws from 'ws';
import {RedisClient} from "redis";
import {
  IGameInfo,
  IGameState,
  IPieceHolder,
  IPlayer,
  ICharacter,
  ITurnInfo,
  createGameMap,
  filterCharacters
} from "common";
import {getNextGamePiece} from "common/dist/utils";

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

interface IMongoGameState extends IGameState {
  _id?: ObjectId
}

app.post('/games/new', async (req: Request, res: Response) => {
  const collection: Collection = await req.app.locals.db.collection('games')

  const player: IPlayer = {
    name: randomName(),
    id: makeId(5),
    joinSlug: makeId(10),
    lastPing: new Date()
  }
  const game: IMongoGameState = {
    id: '',
    createdAt: new Date(),
    joinSlug: makeId(5, 'abcdefghijklmnopqrstuvwxyz0123456789'),
    players: [player],
    turn: undefined,
    pieceHolders: [],
    characters: [],
    status: 'created',
  }
  const result = await collection.insertOne(game)
  game.id = result.insertedId.toHexString()
  const gameInfo: IGameInfo = {
    data: game,
    meta: {
      you: player
    }
  }
  res.send(JSON.stringify(gameInfo))
})

app.post('/games/join/:joinSlug', async (req: Request, res: Response) => {
  const joinSlug = req.params.joinSlug

  const collection: Collection<IMongoGameState> = await req.app.locals.db.collection('games')
  const game: IMongoGameState | null = await collection.findOne({joinSlug})

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
  const games: IMongoGameState[] = await collection.find().toArray()
  const gamesWithId = games.map(g => {
    return {...g, id: g._id}
  })
  res.send(JSON.stringify(gamesWithId))
})

app.get('/games/:gameId', async (req: Request, res: Response) => {
  const gameId = req.params.gameId

  const collection: Collection<IMongoGameState> = await req.app.locals.db.collection('games')
  const game: IMongoGameState | null = await collection.findOne({_id: new ObjectId(gameId)})

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

  const collection: Collection<IMongoGameState> = await req.app.locals.db.collection('games')
  const origGame: IMongoGameState | null = await collection.findOne({_id: new ObjectId(gameId)})

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

    const currentGame: IMongoGameState | null = await collection.findOne({_id: new ObjectId(gameId)})

    if (!currentGame) {
      return
    }

    if (data.type === 'start-game') {
      // const nextPiece = getRandomPiece()
      const nextPiece = getNextGamePiece(currentGame)
      const turnData: ITurnInfo = {
        playerId: currentGame.players[0].id,
        piece: nextPiece,
        characterPlaced: false,
      }
      await collection.findOneAndUpdate(
        {_id: currentGame._id},
        {
          $set: {
            status: 'started',
            turn: turnData
          }
        }
      )
      await publish(channelSlug, JSON.stringify({
        type: 'set-turn',
        data: turnData,
      }))
    }

    // Place new piece to mongo
    if (data.type === 'piece-placed') {
      const newPieceHolder: IPieceHolder = {...data.data, playerId: currentPlayer.id}
      const newTurnInfo: ITurnInfo = {...currentGame.turn!, piece: undefined}

      // Should characters be removed from the map?
      let characters = currentGame.characters
      const newMap = createGameMap({
        ...currentGame,
        pieceHolders: [...currentGame.pieceHolders, newPieceHolder]
      })
      const charactersToBeRemoved = newMap.charactersToBeRemovedAfterPiece(newPieceHolder.x, newPieceHolder.y)
      if (charactersToBeRemoved.length > 0) {
        await publish(channelSlug, JSON.stringify({
          type: 'remove-characters',
          data: charactersToBeRemoved,
        }))
        // Remove the characters that should be removed
        characters = filterCharacters(characters, charactersToBeRemoved)
      }

      await collection.findOneAndUpdate(
        {_id: currentGame._id},
        {
          $set: {
            pieceHolders: [...currentGame.pieceHolders, newPieceHolder],
            characters: characters,
            turn: newTurnInfo
          }
        }
      )
    }

    // Place new character
    if (data.type === 'character-placed') {
      const newCharacter: ICharacter = {...data.data, playerId: currentPlayer.id}
      const newTurnInfo: ITurnInfo = {...currentGame.turn!, characterPlaced: true}

      await collection.findOneAndUpdate(
        {_id: currentGame._id},
        {
          $set: {
            characters: [...currentGame.characters, newCharacter],
            turn: newTurnInfo
          }
        }
      )
    }

    // End turn
    if (data.type === 'end-turn') {
      const curPlayerIndex = currentGame.players.findIndex((p) => p.id === currentPlayer.id)
      const nextPlayerId = currentGame.players[(curPlayerIndex + 1) % currentGame.players.length].id
      const newTurnInfo: ITurnInfo = {
        playerId: nextPlayerId,
        piece: getNextGamePiece(currentGame),
        characterPlaced: false,
      }

      await collection.findOneAndUpdate(
        {_id: currentGame._id},
        {
          $set: {
            turn: newTurnInfo
          }
        }
      )
      await publish(channelSlug, JSON.stringify({
        type: 'set-turn',
        data: newTurnInfo
      }))
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
