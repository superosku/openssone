import {IPieceHolder} from "./GameMap"

export interface IPlayer {
  name: string,
  id: string,
  joinSlug: string,
  lastPing: Date,
}

export interface IGameState {
  id: string,
  createdAt: Date,
  joinSlug: string,
  players: IPlayer[],
  pieceHolders: IPieceHolder[],
  turn: string,
  status: 'created' | 'started' | 'done'
}

export interface IGameInfo {
  data: IGameState,
  meta: {
    you: IPlayer
  },
}
