import React from "react";
import {ILatestPings} from "../layouts/OnlineGame";
import {IGameInfo} from "../layouts/Games";
import {FaUserSlash, FaArrowRight} from 'react-icons/fa';

interface IPlayerListProps {
  latestPings: ILatestPings
  gameInfo: IGameInfo
}

export const PlayerList = ({latestPings, gameInfo}: IPlayerListProps) => {
  return <ul className={'players'}>
    {gameInfo.data.players.map((player, i) => {
      const playerOffline = (
        latestPings[player.id] === undefined ||
        ((new Date()).getTime() - latestPings[player.id].getTime()) / 1000 > 15
      )
      const isTurn = gameInfo.data.turn === player.id

      return <li
        key={player.id}
        className={
          'player-' + i +
          (player.id === gameInfo.meta.you.id ? ' you' : '') +
          (playerOffline ? ' offline' : '') +
          (isTurn ? ' turn' : '')
        }
      >
        {isTurn && <FaArrowRight/>}
        <span>{player.name}</span>
        {playerOffline && <FaUserSlash/>}
      </li>
    })}
  </ul>
}