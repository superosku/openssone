import React from "react";
import './OnlineGame.scss'

import {useParams} from "react-router-dom";
import {axiosInstance} from "../utils";
import {IGameInfo, IResponsePieceHolder} from "./Games";
import {GameMap} from "../game/GameMap";
import {Piece} from "../game/Piece";
import {Loader} from "../components/Loader";
import {GameLobby} from "./GameLobby";
import {OnlineGameDisplay} from "../components/OnlineGameDisplay";


interface IDebugMessage {
  type: string,
  playerId: string,
  date: Date
}

export interface ILatestPings {
  [key: string]: Date
}

export const OnlineGame = () => {
  const {gameId, joinSlug} = useParams<{ gameId: string, joinSlug: string }>();
  const [map, setMap] = React.useState<GameMap>(new GameMap())
  const [loading, setLoading] = React.useState(true)
  const [gameInfo, setGameInfo] = React.useState<undefined | IGameInfo>(undefined)
  const [debugMessages, setDebugMessages] = React.useState<IDebugMessage[]>([])
  const [latestPings, setLatestPings] = React.useState<ILatestPings>({})
  const [socket, setSocket] = React.useState<undefined | WebSocket>(undefined)

  const fetchGame = async () => {
    const response = await axiosInstance.get(
      '/games/' + gameId, {
        headers: {'Authorization': 'Bearer ' + joinSlug}
      }
    )
    const data: IGameInfo = response.data
    setGameInfo(data)
    const responseGame = data.data

    let newMap = new GameMap()
    for (let i = 0; i < responseGame.pieceHolders.length; i++) {
      const pieceHolder = responseGame.pieceHolders[i]
      newMap.setPiece(
        pieceHolder.x,
        pieceHolder.y,
        new Piece(
          pieceHolder.piece.sideTypes,
          pieceHolder.piece.extraInfo,
          pieceHolder.piece.sideConnections,
          pieceHolder.piece.roadConnections,
        )
      )
    }
    setMap(newMap)
  }

  const openSocket = () => {
    const socket = new WebSocket(
      'ws://localhost:8888/messages/' + gameId,
      ['access_token', joinSlug]
    );
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)

      setDebugMessages((cur) => [
        ...cur,
        {
          type: message.type,
          playerId: message.playerId,
          date: new Date(),
        }
      ])
      window.setTimeout(() => {
          setDebugMessages((cur) =>
            cur.slice(1))
        }, 10000
      )

      if (message.type === 'player-joins') {
        console.log('player joined')
        fetchGame()
      }
      if (message.type === 'start-game') {
        setGameInfo(cur => {
          if (!cur) {
            return cur
          }
          return {...cur, data: {...cur.data, status: 'started'}}
        })
      }
      if (message.type === 'ping') {
        setLatestPings((cur) => {
          let n = {...cur}
          n[message.playerId] = new Date()
          console.log('ping times', n)
          return n
        })
      }
      if (message.type === 'set-turn') {
        setGameInfo(cur => {
          if (!cur) {
            return cur
          }
          console.log('setting turn to ', message.data.playerId)
          return {...cur, data: {...cur.data, turn: message.data.playerId}}
        })
      }
      if (message.type === 'new-piece') {
        setMap(currentMap => {
          let newMap = currentMap.clone()
          const pieceHolder: IResponsePieceHolder = message.data
          newMap.setPiece(
            pieceHolder.x,
            pieceHolder.y,
            new Piece(
              pieceHolder.piece.sideTypes,
              pieceHolder.piece.extraInfo,
              pieceHolder.piece.sideConnections,
              pieceHolder.piece.roadConnections,
            )
          )
          return newMap
        })
        setLoading(false)
      }
    });

    return socket
  }

  const initialize = async () => {
    await fetchGame()
    const socket = await openSocket()

    // Wait until socket is opened
    await new Promise((resolve) => {
      if (socket.readyState !== WebSocket.OPEN) {
        socket.onopen = (ev) => { // Set on open handler
          resolve(undefined)
        }
      } else {
        resolve(undefined) // Resolve if state is already open
      }
    })

    setLoading(false)
    setSocket(socket)
    return socket
  }

  React.useEffect(() => {
    let socket: undefined | WebSocket = undefined
    let intervalId: undefined | number = undefined
    initialize().then((s) => {
      socket = s
      intervalId = window.setInterval(() => {
        s.send(JSON.stringify({type: 'ping'}))
      }, 10000)
      s.send(JSON.stringify({type: 'ping'}))
    })
    return () => {
      if (socket) {
        socket.close()
      }
      if (intervalId) {
        window.clearInterval(intervalId)
      }
    }
  }, [])

  if (!gameInfo || !socket) {
    return <Loader full/>
  }

  return <div className={'online-game main-limited'}>
    {loading && <Loader full />}
    {gameInfo.data.status === 'created' && <GameLobby
      gameInfo={gameInfo}
      socket={socket}
      latestPings={latestPings}
    />}
    {gameInfo.data.status === 'started' && <OnlineGameDisplay
      gameInfo={gameInfo}
      map={map}
      latestPings={latestPings}
      onPieceSet={async (x, y, piece) => {
        setLoading(true)
        if (socket) {
          socket.send(JSON.stringify({
            type: 'new-piece',
            data: {
              x, y, piece: piece.asJson()
            }
          }))
        }
      }}
    />}
    {gameInfo.data.status === 'done' && <h1>Game is done</h1>}
    {
      debugMessages.length > 0 && <div className={'debug-messages'}>
        <ul>
          {debugMessages.map((msg) => {
            return <li
              key={msg.playerId + msg.type + msg.date.toISOString()}
            >{msg.playerId} - {msg.type}</li>
          })}
        </ul>
      </div>
    }
  </div>
}
