import {Link, useParams} from "react-router-dom";
import React from "react";
import {axiosInstance} from "../utils";
import {Loader} from "../components/Loader";
import {IGameInfo, IResponseGame, IResponsePlayer} from "./Games";


export const GameLobby = () => {
  const {gameId, joinSlug} = useParams<{ gameId: string, joinSlug: string }>();
  const [gameInfo, setGameInfo] = React.useState<undefined | IGameInfo>(undefined)

  const fetchGame = async () => {
    const response = await axiosInstance.get(
      '/games/' + gameId,
      {headers: {'Authorization': 'Bearer ' + joinSlug}}
    )
    const data: IGameInfo = response.data
    setGameInfo(data)
  }

  React.useEffect(() => {
    fetchGame()
  }, [])

  return <div>
    {gameInfo? <div>
      <span>Players:</span>
      <ul className={'players'}>
        {gameInfo.data.players.map((player, i) => {
          return <li className={'player-' + i + (player.id === gameInfo.meta.you.id ? ' you' : '')}>{player.name}</li>
        })}
      </ul>
    </div> : <Loader/>}
    <Link to={`/games/${gameId}/${joinSlug}`}>Start</Link>
  </div>
}

