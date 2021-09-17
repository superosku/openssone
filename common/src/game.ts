import {ICharacter, IPieceHolder} from "./GameMap"
import {IPiece} from "./Piece";

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
