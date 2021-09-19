import React from "react";
import {FaUserSlash, FaArrowRight, FaQuestion} from 'react-icons/fa';
import {GameMap, IGameInfo} from "common";
import {GiMeeple} from 'react-icons/gi';

import {ILatestPings} from "../layouts/OnlineGame";

interface IPlayerListProps {
  latestPings: ILatestPings
  gameInfo: IGameInfo
  map?: GameMap
}

export const PlayerList = (
  {
    latestPings,
    gameInfo,
    map,
  }: IPlayerListProps,
): JSX.Element => {
  return <ul className={'players'}>
    {gameInfo.data.players.map((player, i) => {
      const playerStatusKnown = latestPings[player.id] !== undefined;
      const playerOffline = (
        latestPings[player.id] !== undefined &&
        ((new Date()).getTime() - latestPings[player.id].getTime()) / 1000 > 15
      );
      const isTurn = gameInfo.data.turn && gameInfo.data.turn.playerId === player.id;

      return <li
        key={player.id}
        className={
          `player-${i
          }${player.id === gameInfo.meta.you.id ? ' you' : ''
          }${playerOffline ? ' offline' : ''
          }${isTurn ? ' turn' : ''}`
        }
      >
        {isTurn && <FaArrowRight/>}
        <span>{player.name}</span>
        {playerOffline && <FaUserSlash/>}
        {!playerStatusKnown && <FaQuestion/>}
        |{player.id}
        |<GiMeeple />x{map && map.remainingCharacters(player.id)}
      </li>;
    })}
  </ul>;
};
