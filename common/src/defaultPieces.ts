import {Piece, PieceExtraInfo, PieceSideType} from "./Piece";


export const defaultPieces = [
  new Piece(
    [PieceSideType.empty, PieceSideType.empty, PieceSideType.empty, PieceSideType.empty,],
    undefined,
    [1, 1, 1, 1, 1, 1, 1, 1]
  ),
  new Piece(
    [PieceSideType.road, PieceSideType.empty, PieceSideType.empty, PieceSideType.empty,],
    undefined,
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0]
  ),
  new Piece(
    [PieceSideType.road, PieceSideType.road, PieceSideType.empty, PieceSideType.empty,],
    undefined,
    [1, 2, 2, 1, 1, 1, 1, 1],
    [1, 1, 0, 0]
  ),
  new Piece(
    [PieceSideType.road, PieceSideType.empty, PieceSideType.road, PieceSideType.empty,],
    undefined,
    [1, 2, 2, 2, 2, 1, 1, 1],
    [1, 0, 1, 0]
  ),
  new Piece(
    [PieceSideType.empty, PieceSideType.road, PieceSideType.road, PieceSideType.road,],
    undefined,
    [1, 1, 1, 2, 2, 3, 3, 1],
    [0, 1, 2, 3]
  ),
  new Piece(
    [PieceSideType.road, PieceSideType.road, PieceSideType.road, PieceSideType.road,],
    undefined,
    [1, 2, 2, 3, 3, 4, 4, 1],
    [1, 2, 3, 4]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.road, PieceSideType.road, PieceSideType.castle,],
    undefined,
    [1, 1, 2, 3, 3, 2, 1, 1],
    [0, 1, 1, 0]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.empty, PieceSideType.empty, PieceSideType.castle,],
    PieceExtraInfo.nonConnectedSideBySideCastle,
    [1, 1, 2, 2, 2, 2, 3, 3]
  ),
  new Piece(
    [PieceSideType.empty, PieceSideType.road, PieceSideType.castle, PieceSideType.road,],
    undefined,
    [1, 1, 1, 2, 3, 3, 2, 1],
    [0, 1, 0, 1]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.road, PieceSideType.castle, PieceSideType.empty,],
    undefined,
    [1, 1, 2, 2, 3, 3, 2, 2],
    [0, 1, 0, 0]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.empty, PieceSideType.castle, PieceSideType.empty,],
    PieceExtraInfo.oppositeCastleFull,
    [1, 1, 2, 2, 1, 1, 3, 3]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.road, PieceSideType.castle, PieceSideType.empty,],
    PieceExtraInfo.oppositeCastleFull,
    [1, 1, 2, 3, 1, 1, 4, 4],
    [0, 1, 0, 0]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.castle, PieceSideType.castle, PieceSideType.road,],
    undefined,
    [1, 1, 1, 1, 1, 1, 2, 3],
    [0, 0, 0, 1]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.castle, PieceSideType.castle, PieceSideType.empty,],
    undefined,
    [1, 1, 1, 1, 1, 1, 2, 2]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.castle, PieceSideType.castle, PieceSideType.castle,],
    undefined,
    [1, 1, 1, 1, 1, 1, 1, 1]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.road, PieceSideType.road, PieceSideType.empty,],
    PieceExtraInfo.monastery,
    [1, 1, 2, 3, 3, 2, 2, 2],
    [0, 1, 2, 0]
  ),
  new Piece(
    [PieceSideType.empty, PieceSideType.empty, PieceSideType.empty, PieceSideType.empty,],
    PieceExtraInfo.monastery,
    [1, 1, 1, 1, 1, 1, 1, 1]
  ),
  new Piece(
    [PieceSideType.road, PieceSideType.empty, PieceSideType.empty, PieceSideType.empty,],
    PieceExtraInfo.monastery,
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0]
  ),
]


export const riverPieces = [
  new Piece(
    [PieceSideType.river, PieceSideType.empty, PieceSideType.empty, PieceSideType.empty,],
    undefined,
    [1, 1, 1, 1, 1, 1, 1, 1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.empty, PieceSideType.river, PieceSideType.empty,],
    undefined,
    [1, 2, 2, 2, 2, 1, 1, 1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.river, PieceSideType.empty, PieceSideType.empty,],
    undefined,
    [1, 2, 2, 1, 1, 1, 1, 1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.empty, PieceSideType.river, PieceSideType.road,],
    PieceExtraInfo.monastery,
    [1, 2, 2, 2, 2, 3, 3, 1],
    [0, 0, 0, 1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.empty, PieceSideType.river, PieceSideType.road,],
    undefined,
    [1, 2, 2, 2, 2, 3, 3, 1],
    [0, 0, 0, 1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.river, PieceSideType.road, PieceSideType.road,],
    undefined,
    [1, 2, 2, 1, 1, 3, 3, 1],
    [0, 0, 1, 1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.castle, PieceSideType.river, PieceSideType.road,],
    undefined,
    [1, 2, 3, 3, 5, 4, 4, 1],
    [0, 0, 0, 1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.river, PieceSideType.castle, PieceSideType.castle,],
    undefined,
    [1, 2, 2, 1, 3, 3, 3, 3]
  ),
]

export const allPieces: Piece[] = [...defaultPieces, ...riverPieces]

export const allRotatedPieces = allPieces.reduce((a: Piece[], piece) => {
  return [
    ...a,
    piece,
    piece.getRotated(1),
    piece.getRotated(2),
    piece.getRotated(3),
  ]
}, [])

export function getRandomPiece() {
  return allPieces[Math.floor(Math.random() * allPieces.length)]
}
