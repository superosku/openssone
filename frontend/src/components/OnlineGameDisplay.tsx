import './OnlineGameDisplay.scss'
import {BaseGame} from "./BaseGame";
import React from "react";
import {ILatestPings} from "../layouts/OnlineGame";
import {GameMap, IPiecePos} from "common";
import {PlayerList} from "./PlayerList";
import {IGameInfo} from "common";
import {Piece} from "common";

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
  }: IOnlineGameDisplayProps
) => {

  return <>
    <div className={'hovering-players-container'}>
      <PlayerList latestPings={latestPings} gameInfo={gameInfo} map={map}/>
    </div>
    <BaseGame
      placeablePiece={placeablePiece}
      map={map}
      onSetPiece={onPieceSet}
      onSetCharacter={onCharacterSet}
      children={children}
    />
  </>
}
