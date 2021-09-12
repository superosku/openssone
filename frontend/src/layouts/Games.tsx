import {axiosInstance} from "../utils";
import React from "react";
import {useHistory} from "react-router-dom";
import {Loader} from "../components/Loader";

export interface IResponsePlayer {
  id: string
  joinSlug: string
  name: string
}

interface IResponsePiece {
  extraInfo: number
  roadConnections: [number, number, number, number]
  sideConnections: [number, number, number, number, number, number, number, number]
  sideTypes: [number, number, number, number]
}

export interface IResponsePieceHolder {
  piece: IResponsePiece
  x: number
  y: number
}

export interface IResponseGame {
  createdAt: string
  joinSlug: string
  pieceHolders: IResponsePieceHolder[]
  players: IResponsePlayer[]
  turn: string
  _id: string
  status: 'created' | 'started' | 'done'
}

export interface IGameInfo {
  data: IResponseGame,
  meta: {
    you: IResponsePlayer
  },
}


export const Games = () => {
  const [games, setGames] = React.useState<IResponseGame[]>([])
  const [loading, setLoading] = React.useState(true)
  const history = useHistory();

  const loadGames = async () => {
    const response = await axiosInstance.get('/games')
    setGames(response.data)
    setLoading(false)
  }

  React.useEffect(() => {
    loadGames()
  }, [])

  return <div>
    <ul>
      {games.map((game) => {
        return <li key={game._id}>
          {game._id} -
          {game.createdAt} -
          {game.joinSlug}
          <button
            onClick={async () => {
              const response = await axiosInstance.post('/games/join/' + game.joinSlug)
              const gameId = response.data.data._id
              const joinSlug = response.data.meta.you.joinSlug
              history.push(`/games/${gameId}/${joinSlug}`)
            }}>Join
          </button>
        </li>
      })}
    </ul>
    {loading ? <Loader/> :
      <div>
        <button onClick={loadGames}>
          Refresh
        </button>
        <button
          onClick={async () => {
            setLoading(true)
            const response = await axiosInstance.post('/games/new')
            const gameId = response.data.data._id
            const joinSlug = response.data.meta.you.joinSlug
            history.push(`/games/${gameId}/${joinSlug}`)
            // await loadGames()
            // setLoading(false)
          }}
        >newGame
        </button>
      </div>
    }
  </div>
}
