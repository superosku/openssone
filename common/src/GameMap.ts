import {Piece, PieceSideType} from "./Piece";
import {allRotatedPieces} from "./defaultPieces";
import {IGameState, IPieceHolder, IPiecePos, IPlayer, ICharacter, IOctant, IQuadrant} from "./game";

const maxCharacters = 5;
const octaToOpposite: { [key: number]: number } = {0: 5, 1: 4, 2: 7, 3: 6, 4: 1, 5: 0, 6: 3, 7: 2};

export class GameMap {
  pieceHolder: { [key: string]: IPieceHolder };
  characterHolder: { [key: string]: ICharacter };
  players: IPlayer[];

  constructor() {
    this.pieceHolder = {};
    this.characterHolder = {};
    this.players = [];
  }

  getPlayerIndex(playerId: string) :number {
    return this.players
      .findIndex((player) => player.id === playerId);
  }

  remainingCharacters(playerId: string) : number {
    return (
      maxCharacters -
      Object
        .values(this.characterHolder)
        .filter((character) => character.playerId === playerId)
        .length
    );
  }

  canPlaceCharacter(playerId: string, pos: IPiecePos) :boolean {
    // TODO: Check if existing characters block this placement
    // eg. enemy characters in the same castle/road/field/monastery or
    // own character in the exactly same position
    // Also character should not be placeable on finished castle/road/field/monastery
    console.log(playerId, pos);
    return true;
  }

  castleIsReady(points: IOctant[]) : boolean {
    // Castle is ready when all of the points have a matching point
    // For an example x:0, y:0, octa:0 must have matching point such as
    // x:0, y:1, octa:5
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const side = Math.floor(point.octa / 2);
      let pointHasMatch = false;
      for (let j = 0; j < points.length; j++) {
        const otherPoint = points[j];
        const sideMatches = octaToOpposite[point.octa] === otherPoint.octa;
        if (!sideMatches) {
          continue;
        }
        if (side === 0 && point.x === otherPoint.x && point.y + 1 === otherPoint.y) {
          pointHasMatch = true;
          break;
        }
        if (side === 1 && point.x - 1 === otherPoint.x && point.y === otherPoint.y) {
          pointHasMatch = true;
          break;
        }
        if (side === 2 && point.x === otherPoint.x && point.y - 1 === otherPoint.y) {
          pointHasMatch = true;
          break;
        }
        if (side === 3 && point.x + 1 === otherPoint.x && point.y === otherPoint.y) {
          pointHasMatch = true;
          break;
        }
      }
      if (!pointHasMatch) {
        return false;
      }
    }

    return true;
  }

  charactersToBeRemovedAfterPiece(x: number, y: number) : ICharacter[] {
    const pieceHolder = this.getAt(x, y);
    if (!pieceHolder) {
      return [];
    }
    const characters: ICharacter[] = [];

    // Castle
    for (let i = 0; i < 8; i++) {
      const side = Math.floor(i / 2);
      if (pieceHolder.piece.sideTypes[side] === PieceSideType.castle) {
        const castlePoints = this.getCastlePoints(x, y, i);
        if (this.castleIsReady(castlePoints)) {
          // console.log('castle is ready')
          const castleCharacters = this.getAllCharacters().filter((character) => {
            return castlePoints.some((cp) => {
              return (
                cp.octa === character.pos.octant &&
                cp.x === character.x &&
                cp.y === character.y
              );
            });
          });
          for (let kk = 0; kk < castleCharacters.length; kk++) {
            const castleCharacter = castleCharacters[kk];
            if (characters.findIndex((character) => {
              return (
                castleCharacter.x === character.x &&
                castleCharacter.y === character.y &&
                castleCharacter.pos.octant === character.pos.octant
              );
            }) === -1) {
              characters.push(castleCharacter);
            }
          }
        }
      }
    }

    // Road
    // TODO

    // Monastery
    // TODO

    return characters;
  }

  clone() : GameMap {
    const newMap = new GameMap();
    newMap.pieceHolder = Object.keys(this.pieceHolder).reduce((
      acc: { [key: string]: IPieceHolder },
      key,
    ) => {
      acc[key] = {...this.pieceHolder[key]};
      return acc;
    }, {});
    newMap.characterHolder = Object.keys(this.characterHolder).reduce((
      acc: { [key: string]: ICharacter },
      key,
    ) => {
      acc[key] = {...this.characterHolder[key]};
      return acc;
    }, {});
    return newMap;
  }

  setPiece(x: number, y: number, piece: Piece) : void {
    this.pieceHolder[`${x}|${y}`] = {x, y, piece, playerId: ''};
  }

  setCharacter(x: number, y: number, pos: IPiecePos, playerId: string) : void {
    const key = (`${x}|${y}|${pos.middle}|${pos.quadrant}|${pos.octant}`);
    this.characterHolder[key] = {x, y, pos, playerId};
  }

  randomize(width: number, height: number) : void {
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        for (let i = 0; i < 1000; i++) {
          const randomPiece = allRotatedPieces[Math.floor(Math.random() * allRotatedPieces.length)];
          if (this.pieceOkHere(x, y, randomPiece)) {
            this.setPiece(x, y, randomPiece);
            break;
          }
        }
      }
    }
  }

  getAt(x: number, y: number) :IPieceHolder| undefined {
    return this.pieceHolder[`${x}|${y}`];
  }

  isEmpty() :boolean {
    return Object.keys(this.pieceHolder).length === 0;
  }

  pieceOkHere(x: number, y: number, piece: Piece) :boolean {
    const isFirstPiece = this.isEmpty();

    if (this.getAt(x, y) && !isFirstPiece) {
      return false;
    }

    const left = this.getAt(x - 1, y);
    const right = this.getAt(x + 1, y);
    const top = this.getAt(x, y - 1);
    const bottom = this.getAt(x, y + 1);

    if (!left && !right && !top && !bottom && !isFirstPiece) {
      return false;
    }
    if (left && left.piece.getRight() !== piece.getLeft()) {
      return false;
    }
    if (right && right.piece.getLeft() !== piece.getRight()) {
      return false;
    }
    if (bottom && bottom.piece.getTop() !== piece.getBottom()) {
      return false;
    }
    if (top && top.piece.getBottom() !== piece.getTop()) {
      return false;
    }

    // River pieces cant form u turn. That is solved so that the empty
    // river part must be on bottom or left
    if (piece.sideTypes.some((sideType) => sideType === PieceSideType.river)) {
      const riverSideCount = piece.sideTypes.reduce(
        (acc, st) => acc + (st === PieceSideType.river ? 1 : 0), 0,
      );

      // Must touch previous river
      if (
        (bottom && piece.sideTypes[0] !== PieceSideType.river) ||
        (left && piece.sideTypes[1] !== PieceSideType.river) ||
        (top && piece.sideTypes[2] !== PieceSideType.river) ||
        (right && piece.sideTypes[3] !== PieceSideType.river)
      ) {
        return false;
      }
      // Bottom or right is empty (to avoid u turns)
      if (!bottom && piece.sideTypes[0] === PieceSideType.river) {
        return true;
      } else if (!right && piece.sideTypes[3] === PieceSideType.river) {
        return true;
      }
      if (riverSideCount === 1 && (left !== undefined || top !== undefined)) {
        // Last river piece must still be placeable
        return true;
      }
      return false;
    }

    return true;
  }

  getRange() : {x:{min:number, max:number}, y:{min:number, max:number}} {
    if (this.isEmpty()) {
      return {x: {min: 0, max: 0}, y: {min: 0, max: 0}};
    }
    return {
      x: {
        min: Math.min(...Object.values(this.pieceHolder).map((ph) => ph.x)),
        max: Math.max(...Object.values(this.pieceHolder).map((ph) => ph.x)),
      },
      y: {
        min: Math.min(...Object.values(this.pieceHolder).map((ph) => ph.y)),
        max: Math.max(...Object.values(this.pieceHolder).map((ph) => ph.y)),
      },
    };
  }

  getCastlePoints(firstX: number, firstY: number, octant: number) : IOctant[] {
    const first: IOctant = {
      x: firstX,
      y: firstY,
      octa: octant,
    };

    const visited: IOctant[] = [first];

    const pushToVisited = (octa: IOctant) => {
      if (!visited.some((existing) => {
        return existing.x === octa.x && existing.y === octa.y && existing.octa === octa.octa;
      })) {
        visited.push(octa);
      }
    };

    for (let index = 0; index < visited.length; index++) {
      const current = visited[index];
      if (!current) {
        break;
      }

      const pieceHolder = this.getAt(current.x, current.y);
      if (!pieceHolder) {
        continue;
      }
      const thisPiece = pieceHolder.piece;
      const octaIndex = thisPiece.sideConnections[current.octa];

      for (let i = 0; i < 8; i++) {
        if (thisPiece.sideConnections[i] === octaIndex) {
          const newOctant: IOctant = {
            x: current.x,
            y: current.y,
            octa: i,
          };
          pushToVisited(newOctant);
        }
      }

      const newOcta = octaToOpposite[current.octa];

      if ((Math.floor(current.octa / 2) === 0) && (this.getAt(current.x, current.y + 1))) {
        pushToVisited({x: current.x, y: current.y + 1, octa: newOcta});
      }
      if ((Math.floor(current.octa / 2) === 1) && (this.getAt(current.x - 1, current.y))) {
        pushToVisited({x: current.x - 1, y: current.y, octa: newOcta});
      }
      if ((Math.floor(current.octa / 2) === 2) && (this.getAt(current.x, current.y - 1))) {
        pushToVisited({x: current.x, y: current.y - 1, octa: newOcta});
      }
      if ((Math.floor(current.octa / 2) === 3) && (this.getAt(current.x + 1, current.y))) {
        pushToVisited({x: current.x + 1, y: current.y, octa: newOcta});
      }
    }

    return visited;
  }

  getRoadPoints(firstX: number, firstY: number, firstRoad: number):IQuadrant[] {
    const first: IQuadrant = {
      x: firstX,
      y: firstY,
      road: firstRoad,
    };

    const visited: IQuadrant[] = [first];

    const pushToVisited = (thisRoad: IQuadrant) => {
      if (!visited.some((existing) => {
        return existing.x === thisRoad.x && existing.y === thisRoad.y && existing.road === thisRoad.road;
      })) {
        visited.push(thisRoad);
      }
    };

    for (let index = 0; index < visited.length; index++) {
      const current = visited[index];
      if (!current) {
        break;
      }
      const thisPiece = this.getAt(current.x, current.y).piece;
      const roadIndex = thisPiece.roadConnections[current.road];

      if (roadIndex === 0) {
        return [];
      }

      for (let i = 0; i < thisPiece.roadConnections.length; i++) {
        if (thisPiece.roadConnections[i] === roadIndex) {
          const newRoad: IQuadrant = {
            x: current.x,
            y: current.y,
            road: i,
          };
          pushToVisited(newRoad);
        }
      }
      const roadOpposites: { [key: number]: number } = {0: 2, 1: 3, 2: 0, 3: 1};
      const newRoad = roadOpposites[current.road];

      if ((current.road === 0) && (this.getAt(current.x, current.y + 1))) {
        pushToVisited({x: current.x, y: current.y + 1, road: newRoad});
      }
      if ((current.road === 1) && (this.getAt(current.x - 1, current.y))) {
        pushToVisited({x: current.x - 1, y: current.y, road: newRoad});
      }
      if ((current.road === 2) && (this.getAt(current.x, current.y - 1))) {
        pushToVisited({x: current.x, y: current.y - 1, road: newRoad});
      }
      if ((current.road === 3) && (this.getAt(current.x + 1, current.y))) {
        pushToVisited({x: current.x + 1, y: current.y, road: newRoad});
      }
    }
    return visited;
  }

  getAllCharacters() :ICharacter[] {
    return Object.values(this.characterHolder);
  }
}

export const createGameMap = (gameState: IGameState): GameMap => {
  const newMap = new GameMap();
  for (let i = 0; i < gameState.pieceHolders.length; i++) {
    const pieceHolder = gameState.pieceHolders[i];
    newMap.setPiece(
      pieceHolder.x,
      pieceHolder.y,
      new Piece(
        pieceHolder.piece.sideTypes,
        pieceHolder.piece.extraInfo,
        pieceHolder.piece.sideConnections,
        pieceHolder.piece.roadConnections,
      ),
    );
  }
  for (let i = 0; i < gameState.characters.length; i++) {
    const character = gameState.characters[i];
    newMap.setCharacter(character.x, character.y, character.pos, character.playerId);
  }
  newMap.players = gameState.players;
  return newMap;
};

export const filterCharacters = (characters: ICharacter[], charactersToBeRemoved: ICharacter[]): ICharacter[] => {
  const newCharacters = characters.filter((character) => {
    if (charactersToBeRemoved.some((ctr) => {
      if (
        character.x === ctr.x &&
        character.y === ctr.y &&
        character.pos.octant === ctr.pos.octant &&
        character.pos.quadrant === ctr.pos.quadrant &&
        character.pos.middle === ctr.pos.middle
      ) {
        return true;
      }
      return false;
    })) {
      return false;
    }
    return true;
  });
  return newCharacters;
};
