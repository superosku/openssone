import React from "react";
import {Loader} from "../components/Loader";
import {IGameInfo, IResponseGame, IResponsePlayer} from "./Games";
import {PlayerList} from "../components/PlayerList";
import {ILatestPings} from "./OnlineGame";

interface IGameLobbyProps {
  gameInfo: IGameInfo
  socket: WebSocket
  latestPings: ILatestPings
}

export const GameLobby = (
  {
    gameInfo,
    socket,
    latestPings,
  }: IGameLobbyProps
) => {
  // const {gameId, joinSlug} = useParams<{ gameId: string, joinSlug: string }>();
  // const [gameInfo, setGameInfo] = React.useState<undefined | IGameInfo>(undefined)
  // const fetchGame = async () => {
  //   const response = await axiosInstance.get(
  //     '/games/' + gameId,
  //     {headers: {'Authorization': 'Bearer ' + joinSlug}}
  //   )
  //   const data: IGameInfo = response.data
  //   setGameInfo(data)
  // }
  //
  // React.useEffect(() => {
  //   fetchGame()
  // }, [])

  return <div>
    {gameInfo ? <div>
      <span>Players:</span>
      <PlayerList latestPings={latestPings} gameInfo={gameInfo}/>
    </div> : <Loader/>}
    <button onClick={() => {
      socket.send(JSON.stringify({
        type: 'start-game',
      }))
    }}>Start
    </button>
  </div>
}

