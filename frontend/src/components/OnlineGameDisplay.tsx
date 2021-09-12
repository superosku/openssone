import './OnlineGameDisplay.scss'
import {BaseGame} from "./BaseGame";
import React from "react";
import {ILatestPings} from "../layouts/OnlineGame";
import {GameMap} from "../game/GameMap";
import {IGameInfo} from "../layouts/Games";
import {Piece} from "../game/Piece";
import {PlayerList} from "./PlayerList";

interface IOnlineGameDisplayProps {
  gameInfo: IGameInfo
  map: GameMap
  latestPings: ILatestPings
  onPieceSet: (x: number, y: number, piece: Piece) => void
}

export const OnlineGameDisplay = (
  {
    map,
    gameInfo,
    latestPings,
    onPieceSet,
  }: IOnlineGameDisplayProps
) => {

  return <>
    <div className={'hovering-players-container'}>
      <PlayerList latestPings={latestPings} gameInfo={gameInfo}/>
    </div>
    <BaseGame
      map={map}
      onSetPiece={onPieceSet}
    />
  </>
}
