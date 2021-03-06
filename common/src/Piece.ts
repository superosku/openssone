
export enum PieceSideType {
  empty,
  road,
  castle,
  river,
}

export enum PieceExtraInfo {
  empty,
  oppositeCastleFull,
  monastery,
  nonConnectedSideBySideCastle,
  pointyCastle
}

export class Piece {
  // bottom, left, top, right
  sideTypes: [PieceSideType, PieceSideType, PieceSideType, PieceSideType];
  extraInfo: PieceExtraInfo;
  sideConnections: [number, number, number, number, number, number, number, number];
  roadConnections: [number, number, number, number];

  constructor(
    sideTypes: [PieceSideType, PieceSideType, PieceSideType, PieceSideType],
    extraInfo: PieceExtraInfo = PieceExtraInfo.empty,
    sideConnections: [number, number, number, number, number, number, number, number] = [1, 2, 3, 4, 5, 6, 7, 8],
    roadConnections: [number, number, number, number] = [0, 0, 0, 0],
  ) {
    this.sideTypes = sideTypes;
    this.extraInfo = extraInfo;
    this.sideConnections = sideConnections;
    this.roadConnections = roadConnections;
  }

  asJson() { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return {
      sideTypes: this.sideTypes,
      extraInfo: this.extraInfo,
      sideConnections: this.sideConnections,
      roadConnections: this.roadConnections,
    };
  }

  getBottom() : PieceSideType {
    return this.sideTypes[0];
  }

  getLeft() :PieceSideType {
    return this.sideTypes[1];
  }

  getTop(): PieceSideType {
    return this.sideTypes[2];
  }

  getRight(): PieceSideType {
    return this.sideTypes[3];
  }

  getRotated(rotation: number) : Piece {
    return new Piece(
      [
        this.sideTypes[(0 + rotation) % 4],
        this.sideTypes[(1 + rotation) % 4],
        this.sideTypes[(2 + rotation) % 4],
        this.sideTypes[(3 + rotation) % 4],
      ],
      this.extraInfo,
      [
        this.sideConnections[(0 + (rotation * 2)) % 8],
        this.sideConnections[(1 + (rotation * 2)) % 8],
        this.sideConnections[(2 + (rotation * 2)) % 8],
        this.sideConnections[(3 + (rotation * 2)) % 8],
        this.sideConnections[(4 + (rotation * 2)) % 8],
        this.sideConnections[(5 + (rotation * 2)) % 8],
        this.sideConnections[(6 + (rotation * 2)) % 8],
        this.sideConnections[(7 + (rotation * 2)) % 8],
      ],
      [
        this.roadConnections[(0 + rotation) % 4],
        this.roadConnections[(1 + rotation) % 4],
        this.roadConnections[(2 + rotation) % 4],
        this.roadConnections[(3 + rotation) % 4],
      ],
    );
  }

  getHash() : string {
    return `${this.sideTypes[0]}-${this.sideTypes[1]}-${this.sideTypes[2]}-${this.sideTypes[3]}-${this.extraInfo}`;
  }
}

export type IPiece = Piece
