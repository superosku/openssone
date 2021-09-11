import React from "react";
import './OnlineGame.scss'

import {useParams} from "react-router-dom";
import {axiosInstance} from "../utils";
import {IGameInfo, IResponsePieceHolder} from "./Games";
import {GameMap} from "../game/GameMap";
import {Piece} from "../game/Piece";
import {BaseGame} from "../components/BaseGame";
import {Loader} from "../components/Loader";


interface IDebugMessage {
  type: string,
  playerId: string,
  date: Date
}

export const OnlineGame = () => {
  const {gameId, joinSlug} = useParams<{ gameId: string, joinSlug: string }>();
  const [map, setMap] = React.useState<GameMap>(new GameMap())
  const [loading, setLoading] = React.useState(true)
  const [gameInfo, setGameInfo] = React.useState<undefined | IGameInfo>(undefined)
  const [debugMessages, setDebugMessages] = React.useState<IDebugMessage[]>([])

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
    setLoading(false)
    return socket
  }

  React.useEffect(() => {
    let socket: undefined | WebSocket = undefined
    let intervalId: undefined | number = undefined
    initialize().then((s) => {
      socket = s
      intervalId = window.setInterval(() => {
        console.log('interval')
        if (socket) {
          console.log('interval sending')
          socket.send(JSON.stringify({
            type: 'ping'
          }))
        }
      }, 10000)
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

  return <div className={'online-game main-limited'}>
    {loading && <Loader full/>}
    {(!loading && map && gameInfo) && <>
      <div className={'players-container'}>
        <ul className={'players'}>
          {gameInfo.data.players.map((player, i) => {
            return <li
              key={player.id}
              className={'player-' + i + (player.id === gameInfo.meta.you.id ? ' you' : '')}
            >{player.name}</li>
          })}
        </ul>
      </div>
      {debugMessages.length > 0 && <div className={'debug-messages'}>
        <ul>
          {debugMessages.map((msg) => {
            return <li
              key={msg.playerId + msg.type + msg.date.toISOString()}
            >{msg.playerId} - {msg.type}</li>
          })}
        </ul>
      </div>}
      <BaseGame
        map={map}
        onSetPiece={async (x, y, piece) => {
          setLoading(true)
          const response = await axiosInstance.post(
            '/games/' + gameId + '/pieces',
            {x, y, piece: piece.asJson()},
            {headers: {'Authorization': 'Bearer ' + joinSlug}}
          )
        }}
      />
    </>}
  </div>
}
