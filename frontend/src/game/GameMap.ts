import {Piece} from "./Piece";
import {allRotatedPieces} from "./defaultPieces";

interface IPieceHolder {
  piece: Piece
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

export interface ICharacter {
  x: number
  y: number
  iPiecePos: IPiecePos
  team: number
}

export interface IPiecePos {
  quadrant: number | undefined
  octant: number | undefined
  middle: boolean
}

export class GameMap {
  pieceHolder: { [key: string]: IPieceHolder }
  characterHolder: { [key: string]: ICharacter }

  constructor() {
    this.pieceHolder = {}
    this.characterHolder = {}
  }

  clone() {
    let newMap = new GameMap()
    newMap.pieceHolder = Object.keys(this.pieceHolder).reduce((
      a: { [key: string]: IPieceHolder },
      key
    ) => {
      a[key] = {...this.pieceHolder[key]}
      return a
    }, {})
    newMap.characterHolder = Object.keys(this.characterHolder).reduce((
      a: { [key: string]: ICharacter },
      key
    ) => {
      a[key] = {...this.characterHolder[key]}
      return a
    }, {})
    return newMap
  }

  setPiece(x: number, y: number, piece: Piece) {
    this.pieceHolder[`${x}|${y}`] = {x, y, piece}
  }

  setCharacter(x: number, y: number, iPiecePos: IPiecePos, team: number) {
    const key = (`${x}|${y}|${iPiecePos.middle}|${iPiecePos.quadrant}|${iPiecePos.octant}`)
    this.characterHolder[key] = {x, y, iPiecePos, team}
  }

  randomize(width: number, height: number) {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        for (let i = 0; i < 1000; i++) {
          const randomPiece = allRotatedPieces[Math.floor(Math.random() * allRotatedPieces.length)]
          if (this.pieceOkHere(x, y, randomPiece)) {
            this.setPiece(x, y, randomPiece)
            break
          }
        }
      }
    }
  }

  getAt(x: number, y: number) {
    return this.pieceHolder[`${x}|${y}`]
  }

  isEmpty() {
    return Object.keys(this.pieceHolder).length === 0
  }

  pieceOkHere(x: number, y: number, piece: Piece) {
    const isFirstPiece = this.isEmpty()

    if (this.getAt(x, y) && !isFirstPiece) {
      return false
    }

    const left = this.getAt(x - 1, y)
    const right = this.getAt(x + 1, y)
    const top = this.getAt(x, y - 1)
    const bottom = this.getAt(x, y + 1)

    if (!left && !right && !top && !bottom && !isFirstPiece) {
      return false
    }

    if (left && left.piece.getRight() !== piece.getLeft()) {
      return false
    }
    if (right && right.piece.getLeft() !== piece.getRight()) {
      return false
    }
    if (bottom && bottom.piece.getTop() !== piece.getBottom()) {
      return false
    }
    if (top && top.piece.getBottom() !== piece.getTop()) {
      return false
    }

    return true
  }

  getRange() {
    if (this.isEmpty()) {
      return {x: {min: 0, max: 0}, y: {min: 0, max: 0}}
    }
    return {
      x: {
        min: Math.min(...Object.values(this.pieceHolder).map(p => p.x)),
        max: Math.max(...Object.values(this.pieceHolder).map(p => p.x)),
      },
      y: {
        min: Math.min(...Object.values(this.pieceHolder).map(p => p.y)),
        max: Math.max(...Object.values(this.pieceHolder).map(p => p.y)),
      }
    }
  }

  getCastlePoints(firstX: number, firstY: number, octant: number) {
    const first: IOctant = {
      x: firstX,
      y: firstY,
      octa: octant,
    }

    let visited: IOctant[] = [first];

    const pushToVisited = (octa: IOctant) => {
      if (!visited.some((existing) => {
        return existing.x === octa.x && existing.y === octa.y && existing.octa === octa.octa
      })) {
        visited.push(octa)
      }
    }

    for (let index = 0; index < visited.length; index++) {
      let current = visited[index]
      if (!current) {
        break;
      }

      const thisPiece = this.getAt(current.x, current.y).piece
      const octaIndex = thisPiece.sideConnections[current.octa]

      for (let i = 0; i < 8; i++) {
        if (thisPiece.sideConnections[i] === octaIndex) {
          const newOctant: IOctant = {
            x: current.x,
            y: current.y,
            octa: i,
          }
          pushToVisited(newOctant)
        }
      }

      const octaToOpposite: { [key: number]: number } = {0: 5, 1: 4, 2: 7, 3: 6, 4: 1, 5: 0, 6: 3, 7: 2}
      const newOcta = octaToOpposite[current.octa]

      if ((Math.floor(current.octa / 2) === 0) && (this.getAt(current.x, current.y + 1))) {
        pushToVisited({x: current.x, y: current.y + 1, octa: newOcta})
      }
      if ((Math.floor(current.octa / 2) === 1) && (this.getAt(current.x - 1, current.y))) {
        pushToVisited({x: current.x - 1, y: current.y, octa: newOcta})
      }
      if ((Math.floor(current.octa / 2) === 2) && (this.getAt(current.x, current.y - 1))) {
        pushToVisited({x: current.x, y: current.y - 1, octa: newOcta})
      }
      if ((Math.floor(current.octa / 2) === 3) && (this.getAt(current.x + 1, current.y))) {
        pushToVisited({x: current.x + 1, y: current.y, octa: newOcta})
      }
    }

    return visited
  }

  getRoadPoints(firstX: number, firstY: number, firstRoad: number) {
    const first: IQuadrant = {
      x: firstX,
      y: firstY,
      road: firstRoad,
    }

    let visited: IQuadrant[] = [first];

    const pushToVisited = (thisRoad: IQuadrant) => {
      if (!visited.some((existing) => {
        return existing.x === thisRoad.x && existing.y === thisRoad.y && existing.road === thisRoad.road
      })) {
        visited.push(thisRoad)
      }
    }

    for (let index = 0; index < visited.length; index++) {
      let current = visited[index]
      if (!current) {
        break
      }
      const thisPiece = this.getAt(current.x, current.y).piece
      const roadIndex = thisPiece.roadConnections[current.road]

      if (roadIndex === 0) {
        return []
      }

      for (let i = 0; i < thisPiece.roadConnections.length; i++) {
        if (thisPiece.roadConnections[i] === roadIndex) {
          const newRoad: IQuadrant = {
            x: current.x,
            y: current.y,
            road: i,
          }
          pushToVisited(newRoad)
        }
      }
      const roadOpposites: { [key: number]: number } = {0: 2, 1: 3, 2: 0, 3: 1}
      const newRoad = roadOpposites[current.road]

      if ((current.road === 0) && (this.getAt(current.x, current.y + 1))) {
        pushToVisited({x: current.x, y: current.y + 1, road: newRoad})
      }
      if ((current.road === 1) && (this.getAt(current.x - 1, current.y))) {
        pushToVisited({x: current.x - 1, y: current.y, road: newRoad})
      }
      if ((current.road === 2) && (this.getAt(current.x, current.y - 1))) {
        pushToVisited({x: current.x, y: current.y - 1, road: newRoad})
      }
      if ((current.road === 3) && (this.getAt(current.x + 1, current.y))) {
        pushToVisited({x: current.x + 1, y: current.y, road: newRoad})
      }
    }
    return visited
  }



  getAllCharacters() {
    let allCharacters: ICharacter[] = [];

    for (let key in this.characterHolder) {
      allCharacters.push(this.characterHolder[key])
    }
    return allCharacters
  }

}
