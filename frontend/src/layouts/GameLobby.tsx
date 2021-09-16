import React from "react";
import {Loader} from "../components/Loader";
import {PlayerList} from "../components/PlayerList";
import {ILatestPings} from "./OnlineGame";
import {IGameInfo} from "common";

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

