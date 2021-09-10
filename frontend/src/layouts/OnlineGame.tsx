import React from "react";

import {
  useParams
} from "react-router-dom";
import {axiosInstance} from "../utils";
import {IResponseGame, IResponsePieceHolder} from "./Games";
import {GameMap} from "../game/GameMap";
import {Piece} from "../game/Piece";
import {BaseGame} from "../components/BaseGame";
import {Loader} from "../components/Loader";


export const OnlineGame = () => {
  const {gameId, joinSlug} = useParams<{ gameId: string, joinSlug: string }>();
  const [map, setMap] = React.useState<GameMap>(new GameMap())
  const [loading, setLoading] = React.useState(true)

  const fetchGame = async () => {
    const response = await axiosInstance.get('/games/' + gameId)
    const data: IResponseGame = response.data

    let newMap = new GameMap()
    for (let i = 0; i < data.pieceHolders.length; i++) {
      const pieceHolder = data.pieceHolders[i]
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
    const socket = new WebSocket('ws://localhost:8888/messages/' + gameId);
    socket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)

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
  }

  const initialize = async () => {
    await fetchGame()
    await openSocket()
    setLoading(false)
  }

  React.useEffect(() => {
    initialize()
  }, [])

  return <>
    {loading && <Loader full />}
    {map ? <>
      <BaseGame
        map={map}
        onSetPiece={async (x, y, piece) => {
          setLoading(true)
          const response = await axiosInstance.post(
            '/games/' + gameId + '/pieces',
            {
              x,
              y,
              piece: piece.asJson()
            }
          )
        }}
      />
    </> : <div>Loading</div>}
  </>
}
