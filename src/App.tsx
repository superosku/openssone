import React from 'react';
import './App.scss';
import {FaCheck} from 'react-icons/fa';

const range = (min: number, max: number) => {
  return [...Array(max - min + 1).keys()].map(i => i + min)
}

const colorRoad = '#b1aaa1'
const colorCastle = '#7a5233'
const colorCastleBoarder = '#6b482d'
const colorWater = '#2358a7'
const colorMonastery = '#96582f'
const colorMonasteryBorder = '#704122'
const colorGround = '#459926'
const colorGroundBorder = '#3e8a22'

enum PieceSideType {
  empty,
  road,
  castle,
  river,
}

enum PieceExtraInfo {
  empty,
  oppositeCastleFull,
  monastery,
  nonConnectedSideBySideCastle,
}

class Piece {
  // bottom, left, top, right
  sideTypes: [PieceSideType, PieceSideType, PieceSideType, PieceSideType];
  extraInfo: PieceExtraInfo
  sideConnections: [number, number, number, number, number, number, number, number];

  constructor(
    sideTypes: [PieceSideType, PieceSideType, PieceSideType, PieceSideType],
    extraInfo: PieceExtraInfo = PieceExtraInfo.empty,
    sideConnections: [number, number, number, number, number, number, number, number] = [1, 2, 3, 4, 5, 6, 7, 8],
  ) {
    this.sideTypes = sideTypes
    this.extraInfo = extraInfo
    this.sideConnections = sideConnections
  }

  getBottom() {
    return this.sideTypes[0]
  }

  getLeft() {
    return this.sideTypes[1]
  }

  getTop() {
    return this.sideTypes[2]
  }

  getRight() {
    return this.sideTypes[3]
  }

  getImageDataUrl() {
    const canvas = document.createElement('canvas')
    canvas.width = 100
    canvas.height = 100
    const ctx = canvas.getContext('2d')!

    // Full castle
    if (this.sideTypes.every((s) => s === PieceSideType.castle)) {
      ctx.fillStyle = colorCastle
      ctx.fillRect(0, 0, 100, 100)
      ctx.fill()
      ctx.stroke()
      return canvas.toDataURL("image/png");
    }

    ctx.lineWidth = 5;

    // Fill groun with green
    ctx.fillStyle = colorGround
    ctx.strokeStyle = colorGroundBorder
    ctx.fillRect(0, 0, 100, 100)
    ctx.strokeRect(0, 0, 100, 100)

    for (let i = 0; i < 4; i++) {
      const sideType = this.sideTypes[i]
      ctx.translate(50, 50)

      // Roads and rivers
      if (sideType === PieceSideType.road || sideType === PieceSideType.river) {
        if (sideType === PieceSideType.river) {
          ctx.strokeStyle = colorWater
        } else {
          ctx.strokeStyle = colorRoad
        }

        const canArch = (
          !(this.extraInfo === PieceExtraInfo.monastery)
        )
        if (
          canArch &&
          sideType === this.sideTypes[(i + 4 - 1) % 4] &&
          sideType !== this.sideTypes[(i + 1) % 4] &&
          sideType !== this.sideTypes[(i + 4 - 2) % 4]
        ) {
          // Do not draw corners twice
        } else if (
          canArch &&
          sideType === this.sideTypes[(i + 1) % 4] &&
          sideType !== this.sideTypes[(i + 2) % 4] &&
          sideType !== this.sideTypes[(i + 3) % 4]
        ) {
          // Corners
          ctx.beginPath();
          ctx.arc(-50, 50, 50, 0, 2 * Math.PI);
          ctx.stroke();
        } else {
          if (
            sideType === PieceSideType.river && (
              this.sideTypes.some(s => s === PieceSideType.road) ||
              this.extraInfo === PieceExtraInfo.monastery
            )
          ) {
            // Water should bend to avoid roads or monastery
            const thing = Math.floor(i / 2) % 2 === 0 ? 15 : -15; // Needed to make water go around on the same side on both directions

            ctx.beginPath();
            ctx.moveTo(thing, 0);
            ctx.lineTo(thing, 15);
            ctx.lineTo(0, 30);
            ctx.lineTo(0, 50);
            ctx.stroke();
          } else {
            // Regular stuff
            let dist = 0
            if (this.extraInfo === PieceExtraInfo.oppositeCastleFull) {
              dist = 22
            }
            if (this.sideTypes[(i + 2) % 4] === PieceSideType.castle) {
              dist = -13
            }
            ctx.beginPath();
            ctx.moveTo(0, dist);
            ctx.lineTo(0, 50);
            ctx.stroke();
          }
        }

        // Draw villages and river endings
        const roadOrRiverCount = this.sideTypes.reduce((a: number, s) => a + (s === sideType ? 1 : 0), 0)
        if (roadOrRiverCount === 1 && sideType === PieceSideType.river) {
          ctx.strokeStyle = colorWater
          ctx.fillStyle = colorWater

          ctx.beginPath();
          ctx.arc(0, 0, 10, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        }
        if (
          roadOrRiverCount !== 2 &&
          sideType === PieceSideType.road &&
          !(this.extraInfo === PieceExtraInfo.oppositeCastleFull) &&
          !(this.sideTypes[(i + 2) % 4] === PieceSideType.castle)
        ) {
          ctx.strokeStyle = colorRoad
          ctx.fillStyle = colorRoad

          ctx.beginPath();
          ctx.moveTo(-10, -10);
          ctx.lineTo(10, -10);
          ctx.lineTo(10, 10);
          ctx.lineTo(-10, 10);
          ctx.lineTo(-10, -10);
          ctx.fill()
        }
      }

      // Castles
      if (
        sideType === PieceSideType.castle
        && (
          this.sideTypes[(i + 4 - 1) % 4] !== PieceSideType.castle || // Drawing handled in another side (only draw corners once)
          this.extraInfo === PieceExtraInfo.nonConnectedSideBySideCastle // Except when non connected corner case...
        )
      ) {
        ctx.fillStyle = colorCastle
        ctx.strokeStyle = colorCastleBoarder

        if (
          this.sideTypes[(i + 1) % 4] === PieceSideType.castle &&
          this.sideTypes[(i + 2) % 4] === PieceSideType.castle
        ) {
          // Handle 3 sided castle
          ctx.beginPath();
          ctx.moveTo(50, -50);
          ctx.lineTo(-15, -25);
          ctx.lineTo(-15, 25);
          ctx.lineTo(50, 50);
          ctx.lineTo(-50, 50);
          ctx.lineTo(-50, -50);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(50, -50);
          ctx.lineTo(-15, -25);
          ctx.lineTo(-15, 25);
          ctx.lineTo(50, 50);
          ctx.stroke()
        } else if (
          this.sideTypes[(i + 1) % 4] === PieceSideType.castle &&
          this.extraInfo !== PieceExtraInfo.nonConnectedSideBySideCastle
        ) {
          // Handle 2 sided castle
          ctx.beginPath();
          ctx.moveTo(-50, -50);
          ctx.lineTo(-10, 10);
          ctx.lineTo(50, 50);
          ctx.lineTo(-50, 50);
          ctx.fill();
          ctx.beginPath()
          ctx.moveTo(-50, -50);
          ctx.lineTo(-10, 10);
          ctx.lineTo(50, 50);
          ctx.stroke();
        } else {
          // Handle single castle
          if (
            this.sideTypes[(i + 2) % 4] === PieceSideType.castle &&
            this.extraInfo === PieceExtraInfo.oppositeCastleFull
          ) {
            // Handle connected opposite castle
            // Only draw connected opposite castle once
            if (i === 0 || i === 1) {
              ctx.beginPath();
              ctx.moveTo(-50, -50);
              ctx.lineTo(-20, -20);
              ctx.lineTo(-20, 20);
              ctx.lineTo(-50, 50);
              ctx.lineTo(50, 50);
              ctx.lineTo(20, 20);
              ctx.lineTo(20, -20);
              ctx.lineTo(50, -50);
              ctx.fill();

              ctx.beginPath()
              ctx.moveTo(-50, -50);
              ctx.lineTo(-20, -20);
              ctx.lineTo(-20, 20);
              ctx.lineTo(-50, 50);
              ctx.stroke()

              ctx.beginPath()
              ctx.lineTo(50, 50);
              ctx.lineTo(20, 20);
              ctx.lineTo(20, -20);
              ctx.lineTo(50, -50);
              ctx.stroke()
            }
          } else {
            // Regular 1 sided castle
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.arc(0, 85, 60, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
          }
        }
      }

      ctx.rotate(Math.PI / 2)
      ctx.translate(-50, -50)
    }

    // Monastery
    if (this.extraInfo === PieceExtraInfo.monastery) {
      ctx.fillStyle = colorMonastery
      ctx.strokeStyle = colorMonasteryBorder
      ctx.beginPath();
      ctx.moveTo(40, 40);
      ctx.lineTo(50, 30);
      ctx.lineTo(60, 40);
      ctx.lineTo(60, 60);
      ctx.lineTo(40, 60);
      ctx.lineTo(40, 40);
      ctx.fill()
      ctx.stroke();
    }

    return canvas.toDataURL("image/png");
  }

  getRotated(rotation: number) {
    return new Piece(
      [
        this.sideTypes[(0 + rotation) % 4],
        this.sideTypes[(1 + rotation) % 4],
        this.sideTypes[(2 + rotation) % 4],
        this.sideTypes[(3 + rotation) % 4],
      ],
      this.extraInfo,
      // Fix SideConnection rotations
      [
        this.sideConnections[(0 + (rotation*2)) % 8],
        this.sideConnections[(1 + (rotation*2)) % 8],
        this.sideConnections[(2 + (rotation*2)) % 8],
        this.sideConnections[(3 + (rotation*2)) % 8],
        this.sideConnections[(4 + (rotation*2)) % 8],
        this.sideConnections[(5 + (rotation*2)) % 8],
        this.sideConnections[(6 + (rotation*2)) % 8],
        this.sideConnections[(7 + (rotation*2)) % 8],
      ]
    )
  }

  getHash() {
    return `${this.sideTypes[0]}-${this.sideTypes[1]}-${this.sideTypes[2]}-${this.sideTypes[3]}-${this.extraInfo}`
  }
}

const pieces = [
  new Piece(
    [PieceSideType.empty, PieceSideType.empty, PieceSideType.empty, PieceSideType.empty,],
    undefined,
    [1,1,1,1,1,1,1,1]
  ),
  new Piece(
    [PieceSideType.road, PieceSideType.empty, PieceSideType.empty, PieceSideType.empty,],
    undefined,
    [1,1,1,1,1,1,1,1]
  ),
  new Piece(
    [PieceSideType.road, PieceSideType.road, PieceSideType.empty, PieceSideType.empty,],
    undefined,
    [1,2,2,1,1,1,1,1]
  ),
  new Piece(
    [PieceSideType.road, PieceSideType.empty, PieceSideType.road, PieceSideType.empty,],
    undefined,
    [1,2,2,2,2,1,1,1]
  ),
  new Piece(
    [PieceSideType.empty, PieceSideType.road, PieceSideType.road, PieceSideType.road,],
    undefined,
    [1,1,1,2,2,3,3,1]
  ),
  new Piece(
    [PieceSideType.road, PieceSideType.road, PieceSideType.road, PieceSideType.road,],
    undefined,
    [1,2,2,3,3,4,4,1]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.road, PieceSideType.road, PieceSideType.castle,],
    undefined,
    [1,1,2,3,3,2,1,1]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.empty, PieceSideType.empty, PieceSideType.castle,], 
    PieceExtraInfo.nonConnectedSideBySideCastle,
    [1,1,2,2,2,2,3,3]
  ),
  new Piece(
    [PieceSideType.empty, PieceSideType.road, PieceSideType.castle, PieceSideType.road,],
    undefined,
    [1,1,1,2,3,3,2,1]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.road, PieceSideType.castle, PieceSideType.empty,],
    undefined,
    [1,1,2,2,3,3,2,2]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.empty, PieceSideType.castle, PieceSideType.empty,], 
    PieceExtraInfo.oppositeCastleFull,
    [1,1,2,2,1,1,3,3]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.road, PieceSideType.castle, PieceSideType.empty,], 
    PieceExtraInfo.oppositeCastleFull,
    [1,1,2,3,1,1,4,4]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.castle, PieceSideType.castle, PieceSideType.road,],
    undefined,
    [1,1,1,1,1,1,2,3]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.castle, PieceSideType.castle, PieceSideType.empty,],
    undefined,
    [1,1,1,1,1,1,2,2]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.castle, PieceSideType.castle, PieceSideType.castle,],
    undefined,
    [1,1,1,1,1,1,1,1]
  ),
  new Piece(
    [PieceSideType.castle, PieceSideType.road, PieceSideType.road, PieceSideType.empty,], 
    PieceExtraInfo.monastery,
    [1,1,2,3,3,2,2,2]
  ),
  new Piece(
    [PieceSideType.empty, PieceSideType.empty, PieceSideType.empty, PieceSideType.empty,], 
    PieceExtraInfo.monastery,
    [1,1,1,1,1,1,1,1]
  ),
  new Piece(
    [PieceSideType.road, PieceSideType.empty, PieceSideType.empty, PieceSideType.empty,], 
    PieceExtraInfo.monastery,
    [1,1,1,1,1,1,1,1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.empty, PieceSideType.empty, PieceSideType.empty,],
    undefined,
    [1,1,1,1,1,1,1,1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.empty, PieceSideType.river, PieceSideType.empty,],
    undefined,
    [1,2,2,2,2,1,1,1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.river, PieceSideType.empty, PieceSideType.empty,],
    undefined,
    [1,2,2,1,1,1,1,1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.empty, PieceSideType.river, PieceSideType.road,], 
    PieceExtraInfo.monastery,
    [1,2,2,2,2,3,3,1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.empty, PieceSideType.river, PieceSideType.road,],
    undefined,
    [1,2,2,2,2,3,3,1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.river, PieceSideType.road, PieceSideType.road,],
    undefined,
    [1,2,2,1,1,3,3,1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.castle, PieceSideType.river, PieceSideType.road,],
    undefined,
    [1,2,3,3,2,4,4,1]
  ),
  new Piece(
    [PieceSideType.river, PieceSideType.river, PieceSideType.castle, PieceSideType.castle,],
    undefined,
    [1,2,2,1,3,3,3,3]
  ),
]

const allRotatedPieces = pieces.reduce((a: Piece[], piece) => {
  return [
    ...a,
    piece,
    piece.getRotated(1),
    piece.getRotated(2),
    piece.getRotated(3),
  ]
}, [])

interface IPieceHolder {
  piece: Piece
  x: number
  y: number
}

interface Quadrant {
  x: number;
  y: number;
  quad: number;
}

class Map {
  pieceHolders: IPieceHolder[]

  constructor() {
    this.pieceHolders = []
  }

  clone() {
    let newMap = new Map()
    newMap.pieceHolders = this.pieceHolders.map(holder => {
      return {...holder}
    })
    return newMap
  }

  setPiece(x: number, y: number, piece: Piece) {
    this.pieceHolders.push({x, y, piece})
  }

  randomize() {
    for (let x = 0; x < 10; x++) {
      for (let y = 0; y < 10; y++) {
        for (let i = 0; i < 1000; i++) {
          const randomPiece = allRotatedPieces[Math.floor(Math.random() * allRotatedPieces.length)]
          if (this.pieceOkHere(x, y, randomPiece)) {
            this.pieceHolders.push({
              x, y, piece: randomPiece,
            })
            break
          }
        }
      }
    }
  }

  getAt(x: number, y: number) {
    return this.pieceHolders.filter(p => p.x === x && p.y === y)[0]
  }

  pieceOkHere(x: number, y: number, piece: Piece) {
    const isFirstPiece = this.pieceHolders.length === 0

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
    if (this.pieceHolders.length === 0) {
      return {x: {min: 0, max: 0}, y: {min: 0, max: 0}}
    }
    return {
      x: {
        min: Math.min(...this.pieceHolders.map(p => p.x)),
        max: Math.max(...this.pieceHolders.map(p => p.x)),
      },
      y: {
        min: Math.min(...this.pieceHolders.map(p => p.y)),
        max: Math.max(...this.pieceHolders.map(p => p.y)),
      }
    }
  }

  getCastlePoints(firstX: number, firstY: number, octaquadrant: number)  {
    const first: Quadrant = {
      x: firstX,
      y: firstY,
      quad: octaquadrant,
    }
  
    let visited: Quadrant[] = [first];

    const pushToVisited = (quad: Quadrant) => {
      if (!visited.some((extQ) => {
        return extQ.x === quad.x && extQ.y === quad.y && extQ.quad === quad.quad
      })) {
        visited.push(quad)
      }
    }

    for (let index = 0; index < visited.length; index++) {
      let current = visited[index]
      if (!current) {
        break;
      }

      const thisPiece = this.getAt(current.x, current.y).piece
      const castleIndex = thisPiece.sideConnections[current.quad]

      for (let i = 0;i < thisPiece.sideConnections.length;i++) {
        if (thisPiece.sideConnections[i] === castleIndex) {
          const newQuadrant: Quadrant = {
            x: current.x,
            y: current.y,
            quad: i,
          }
          pushToVisited(newQuadrant)
        }
      }

      const quadToOpposite: {[key: number]: number} = {0: 5, 1: 4, 2: 7, 3: 6, 4: 1, 5: 0, 6: 3, 7: 2}
      const newQuad = quadToOpposite[current.quad]

      if ((Math.floor(current.quad/2) === 0) && (this.getAt(current.x, current.y+1))) {
        const bottomQuad: Quadrant = {x: current.x, y: current.y+1, quad: newQuad}
        pushToVisited(bottomQuad)
      } if ((Math.floor(current.quad/2) === 1) && (this.getAt(current.x-1, current.y))) {
        const leftQuad: Quadrant = {x: current.x-1, y: current.y, quad: newQuad}
        pushToVisited(leftQuad)
      } if ((Math.floor(current.quad/2) === 2) && (this.getAt(current.x, current.y-1))) {
        const topQuad: Quadrant = {x: current.x, y: current.y-1, quad: newQuad}
        pushToVisited(topQuad)
      } if ((Math.floor(current.quad/2) === 3) && (this.getAt(current.x+1, current.y))) {
        const rightQuad: Quadrant = {x: current.x+1, y: current.y, quad: newQuad}
        pushToVisited(rightQuad)
      }
    }

    return visited
  }
}

interface IMapDisplayProps {
  map: Map
  zoomLevel?: number,
  onClickMap?: (x: number, y: number) => void
  placeablePiece?: Piece
}

interface IQuadrant {
  x: number
  y: number
  quadrant: number
}

const MapDisplay = (
  {
    map,
    zoomLevel,
    onClickMap,
    placeablePiece
  }: IMapDisplayProps
) => {
  const [debugQuadrants, setDebugQuadrants] = React.useState<IQuadrant[]>([])
  const [loading, setloading] = React.useState<boolean>(true)

  const mapRange = React.useMemo(() => map.getRange(), [map])

  return <div className={'map-display' + (zoomLevel ? (' zoom-out ' + 'zoom-out-' + zoomLevel) : '')}>
    <table>
      <tbody>
      {range(mapRange.y.min - 1, mapRange.y.max + 1).map(y => {
        return <tr key={y}>
          {range(mapRange.x.min - 1, mapRange.x.max + 1).map(x => {
            const pieceHolder = map.getAt(x, y)

            let pieceStatusClass = ''
            if (placeablePiece) {
              if (map.pieceOkHere(x, y, placeablePiece)) {
                pieceStatusClass = 'ok'
              } else {
                if ([1, 2, 3].some((i) =>
                  map.pieceOkHere(x, y, placeablePiece.getRotated(i))
                )) {
                  pieceStatusClass = 'ok-rotated'
                }
              }
            }

            return <td
              key={x}
              onClick={() => {
                if (onClickMap) {
                  onClickMap(x, y)
                }
              }}
            >
              {pieceHolder && <img
                src={pieceHolder.piece.getImageDataUrl()}
                onClick={(event) => {
                  const clickY = event.clientY - (event.target as HTMLImageElement).getBoundingClientRect().top
                  const clickX = event.clientX - (event.target as HTMLImageElement).getBoundingClientRect().left

                  let octaquadrant = 0

                  if (clickY < 50) {
                    if (clickX < 50) {
                      if (clickX < clickY) {
                        octaquadrant = 3
                      } else {
                        octaquadrant = 4
                      }
                    } else {
                      if (clickX + clickY < 100) {
                        octaquadrant = 5
                      } else {
                        octaquadrant = 6
                      }
                    }
                  } else {
                    if (clickX < 50) {
                      if (clickX + clickY < 100) {
                        octaquadrant = 2
                      } else {
                        octaquadrant = 1
                      }
                    } else {
                      if (clickX < clickY) {
                        octaquadrant = 0
                      } else {
                        octaquadrant = 7
                      }
                    }
                  }

                  const quadrants = map.getCastlePoints(x, y, octaquadrant)
                }}
              />}
              {pieceStatusClass && <div className={'piece-status ' + pieceStatusClass}>
                <FaCheck/>
              </div>}
            </td>
          })}
        </tr>
      })}
      </tbody>
    </table>
  </div>
}

const getRandomPiece = () => {
  return pieces[Math.floor(Math.random() * pieces.length)]
}

interface IGameProps {
  zoomLevel: number | undefined
}

const Game = ({zoomLevel}: IGameProps) => {
  const [map, setMap] = React.useState(new Map())
  const [nextPiece, setNextPiece] = React.useState(getRandomPiece())
  const [nextPieceRotation, setNextPieceRotation] = React.useState(0)

  React.useEffect(() => {
    let newMap = map.clone()
    newMap.setPiece(0, 0, pieces[0])
    setMap(newMap)
  }, [])

  return <div className={'game'}>
    <div className={'map-container'}>
      <MapDisplay
        zoomLevel={zoomLevel}
        placeablePiece={nextPiece.getRotated(nextPieceRotation)}
        map={map}
        onClickMap={(x, y) => {
          let rotatedPiece = nextPiece.getRotated(nextPieceRotation)
          let wasOk = false
          if (!map.pieceOkHere(x, y, rotatedPiece)) {
            for (let i = 0; i < 3; i++) {
              rotatedPiece = rotatedPiece.getRotated(1)
              if (map.pieceOkHere(x, y, rotatedPiece)) {
                wasOk = true
                break
              }
            }
          } else {
            wasOk = true
          }
          if (!wasOk) {
            return
          }
          let newMap = map.clone()
          newMap.setPiece(x, y, rotatedPiece)
          setMap(newMap)
          setNextPiece(getRandomPiece)
        }}
      />
    </div>
    <div className={'rotation-choices'}>
      {[0, 1, 2, 3].map(rotationChoice => {
        return <div
          className={nextPieceRotation === rotationChoice ? 'active' : ''}
        >
          <img
            key={rotationChoice}
            onClick={() => {
              setNextPieceRotation(rotationChoice)
            }}
            src={nextPiece.getRotated(rotationChoice).getImageDataUrl()}
          />
        </div>
      })}
    </div>
  </div>
}

const App = () => {
  const [map, setMap] = React.useState(new Map())
  const [showDebug, setShowDebug] = React.useState(false)
  const [zoomLevel, setZoomLevel] = React.useState<undefined | number>(undefined)

  React.useEffect(() => {
    let newMap = map.clone()
    newMap.randomize()
    setMap(newMap)
  }, [])

  return (
    <div className={'main-container'}>
      <div className={'menu'}>
        <span className={'logo'}>Openssone</span>
        <span onClick={() => {
          setShowDebug(!showDebug)
        }}>Toggle debug</span>
        <span onClick={() => {
          setZoomLevel(undefined)
        }}>100%</span>
        <span onClick={() => {
          setZoomLevel(75)
        }}>75%</span>
        <span onClick={() => {
          setZoomLevel(50)
        }}>50%</span>
        <span onClick={() => {
          setZoomLevel(25)
        }}>25%</span>
      </div>
      {!showDebug && <Game zoomLevel={zoomLevel}/>}
      {showDebug &&
      <div>
        <h1>Generated map</h1>
        <MapDisplay map={map}/>
        <h1>All pieces</h1>
        <div className="outer">
          {pieces.map(piece => {
            return <div className={"inner"} key={piece.getHash()}>
              {[0, 1, 2, 3].map(rotation => {
                return <img key={rotation} src={piece.getRotated(rotation).getImageDataUrl()}/>
              })}
            </div>
          })}
        </div>
      </div>
      }
    </div>
  );
}

export default App;
