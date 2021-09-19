import './OnlineGameDisplay.scss';
import React from "react";
import {GameMap, IPiecePos, IGameInfo, Piece} from "common";

import {ILatestPings} from "../layouts/OnlineGame";

import {PlayerList} from "./PlayerList";
import {BaseGame} from "./BaseGame";

interface IOnlineGameDisplayProps {
  gameInfo: IGameInfo
  map: GameMap
  latestPings: ILatestPings
  onPieceSet: (x: number, y: number, piece: Piece) => void
  onCharacterSet: (x: number, y: number, pos: IPiecePos) => void
  placeablePiece: Piece | undefined
  children: JSX.Element
}

export const OnlineGameDisplay = (
  {
    map,
    gameInfo,
    latestPings,
    onPieceSet,
    onCharacterSet,
    placeablePiece,
    children,
  }: IOnlineGameDisplayProps,
): JSX.Element => {

  return <>
    <div className={'hovering-players-container'}>
      <PlayerList latestPings={latestPings} gameInfo={gameInfo} map={map}/>
    </div>
    <BaseGame
      placeablePiece={placeablePiece}
      map={map}
      onSetPiece={onPieceSet}
      onSetCharacter={onCharacterSet}
    >{children}</BaseGame>
  </>;
};
