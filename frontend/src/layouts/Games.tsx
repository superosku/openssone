import {axiosInstance} from "../utils";
import React from "react";
import {useHistory} from "react-router-dom";
import {Loader} from "../components/Loader";
import {IGameInfo, IGameState} from "common";

export const Games = () => {
  const [games, setGames] = React.useState<IGameState[]>([])
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
        return <li key={game.id}>
          {game.id} -
          {game.createdAt} -
          {game.joinSlug}
          {game.status === 'created' &&
          <button
            onClick={async () => {
              const response = await axiosInstance.post('/games/join/' + game.joinSlug)
              const gameId = response.data.data._id
              const joinSlug = response.data.meta.you.joinSlug
              history.push(`/games/${gameId}/${joinSlug}`)
            }}>Join
          </button>
          }
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
            const responseGame: IGameInfo = response.data
            const gameId = responseGame.data.id
            const joinSlug = responseGame.meta.you.joinSlug
            history.push(`/games/${gameId}/${joinSlug}`)
          }}
        >newGame
        </button>
      </div>
    }
  </div>
}
