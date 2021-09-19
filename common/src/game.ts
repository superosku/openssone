import {IPiece, Piece} from "./Piece";

export interface IPlayer {
  name: string,
  id: string,
  joinSlug: string,
  lastPing: Date,
}

export interface ITurnInfo {
  playerId: string,
  characterPlaced: boolean,
  piece: IPiece | undefined
}

export interface IGameState {
  id: string,
  createdAt: Date,
  joinSlug: string,
  players: IPlayer[],
  characters: ICharacter[],
  pieceHolders: IPieceHolder[],
  turn: ITurnInfo | undefined
  status: 'created' | 'started' | 'done',
}

export interface IGameInfo {
  data: IGameState,
  meta: {
    you: IPlayer
  },
}

export interface IPieceHolder {
  piece: Piece
  playerId: string,
  x: number
  y: number
}

export interface IOctant {
  x: number
  y: number
  octa: number
}

export interface IQuadrant {
  x: number
  y: number
  road: number
}

export interface IPiecePos {
  quadrant: number | undefined
  octant: number | undefined
  middle: boolean
}

export interface ICharacter {
  x: number

  y: number
  pos: IPiecePos
  playerId: string
}
