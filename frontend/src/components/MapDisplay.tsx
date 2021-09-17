import React from 'react';
import './MapDisplay.scss';
import {GameMap, IOctant, IQuadrant, IPiecePos} from "common";
import {FaCheck} from 'react-icons/fa';
import {GiMeeple} from 'react-icons/gi';
import {getImageDataUrl, getRange} from "../utils";
import {Piece, PieceExtraInfo, PieceSideType} from "common";

interface IMapDisplayProps {
  map: GameMap
  zoomLevel?: number,
  onClickMap?: (x: number, y: number, pos: IPiecePos | undefined) => void
  placeablePiece?: Piece
}

export const MapDisplay = (
  {
    map,
    zoomLevel,
    onClickMap,
    placeablePiece
  }: IMapDisplayProps
) => {
  const [debugOctants, setDebugOctants] = React.useState<IOctant[]>([])
  const [debugRoads, setDebugRoads] = React.useState<IQuadrant[]>([])

  const mapRange = React.useMemo(() => map.getRange(), [map])
  const padAmount = 1

  const getClickedPosition = (clickX: number, clickY: number, piece: Piece) => {

    let position: IPiecePos = { middle: false, octant: undefined, quadrant: undefined }

    if (clickX >= 40 && clickX <= 60) {
      if (clickY >= 40 && clickY <= 60) {
        if (piece.extraInfo === PieceExtraInfo.monastery) {
          position.middle = true
        }
      }
    }
    if (position.middle) {
      return position
    }

    // Road Click
    if (clickX >= 45 && clickX <= 55) {
      if (clickY < 50) {
        if (piece.sideTypes[2] === PieceSideType.road) {
          position.quadrant = 2
        }
      } else {
        if (piece.sideTypes[0] === PieceSideType.road) {
          position.quadrant = 0
        }
      }
    }
    if (clickY >= 45 && clickY <= 55) {
      if (clickX < 50) {
        if (piece.sideTypes[1] === PieceSideType.road) {
          position.quadrant = 1
        }
      } else {
        if (piece.sideTypes[3] === PieceSideType.road) {
          position.quadrant = 3
        }
      }
    }
    if (position.quadrant !== undefined) {
      return position
    }

    // Octant Click
    if (clickY < 50) {
      if (clickX < 50) {
        if (clickX < clickY) {
          position.octant = 3
        } else {
          position.octant = 4
        }
      } else {
        if (clickX + clickY < 100) {
          position.octant = 5
        } else {
          position.octant = 6
        }
      }
    } else {
      if (clickX < 50) {
        if (clickX + clickY < 100) {
          position.octant = 2
        } else {
          position.octant = 1
        }
      } else {
        if (clickX < clickY) {
          position.octant = 0
        } else {
          position.octant = 7
        }
      }
    }
    return position

  }


  return <div className={'map-display' + (zoomLevel ? (' zoom-out ' + 'zoom-out-' + zoomLevel) : '')}>
    <table>
      <tbody>
      {getRange(mapRange.y.min - padAmount, mapRange.y.max + padAmount).map(y => {
        return <tr key={y}>
          {getRange(mapRange.x.min - padAmount, mapRange.x.max + padAmount).map(x => {
            const pieceHolder = map.getAt(x, y)

            let previewPiece: undefined | Piece = undefined
            let pieceStatusClass = ''
            if (placeablePiece) {
              if (map.pieceOkHere(x, y, placeablePiece)) {
                previewPiece = placeablePiece
                pieceStatusClass = 'ok'
              } else {
                for (let i = 1; i <= 3; i ++) {
                  const rotPiece = placeablePiece.getRotated(i)
                  if (map.pieceOkHere(x, y, rotPiece)) {
                    pieceStatusClass = 'ok-rotated'
                    previewPiece = rotPiece
                    break
                  }
                }
              }
            }

            return <td
              key={x}
              onClick={(event) => {
                // if we dont have funtion return
                if (onClickMap === undefined) {
                  return
                }
                // if clicking empty
                const piece = map.getAt(x, y)
                if (piece === undefined) {
                  onClickMap(x, y, undefined)
                  return
                }
                // if clicking piece
                const clickY = (
                  (event.clientY - (event.currentTarget).getBoundingClientRect().top) *
                  (100 / (zoomLevel || 100))
                )
                const clickX = (
                  (event.clientX - (event.currentTarget).getBoundingClientRect().left) *
                  (100 / (zoomLevel || 100))
                )
                console.log(event.target, event.currentTarget)
                const pos = getClickedPosition(clickX, clickY, piece.piece)
                onClickMap(x, y, pos)
                if (pos.quadrant !== undefined) {
                  setDebugRoads(map.getRoadPoints(x, y, pos.quadrant))
                  setDebugOctants([])
                } 
                if (pos.octant !== undefined) {
                  setDebugOctants(map.getCastlePoints(x, y, pos.octant))
                  setDebugRoads([])
                }
              }}
            >
              {pieceHolder && <>
                <img
                  src={getImageDataUrl(pieceHolder.piece)}
                />
                {debugOctants.filter(q => q.x === x && q.y === y).map(q => {
                  return <span
                    className={'debug octant-' + q.octa}
                    key={q.octa}
                  ></span>
                })}
                {debugRoads.filter(q => q.x === x && q.y === y).map(q => {
                  return <span
                    className={'debug quadrant-' + q.road}
                    key={q.road}
                  ></span>
                })}
                {map.getAllCharacters().filter(q => q.x === x && q.y === y).map(q => {
                  let className
                  if (q.pos.middle) {className = ('middle')}
                  if (q.pos.octant !== undefined) {className = ('octant-' + q.pos.octant)}
                  if (q.pos.quadrant !== undefined) {className = ('quadrant-' + q.pos.quadrant)}
                  return <GiMeeple
                    className={'character ' + className + ' player-' + map.getPlayerIndex(q.playerId)}
                    key={(q.pos.middle + '|' + q.pos.octant + '|' + q.pos.quadrant)}
                  ></GiMeeple>
                })}
              </>
              }
              {pieceStatusClass && <div className={'piece-status ' + pieceStatusClass}>
                <FaCheck/>
              </div>}
              {previewPiece && <img className={'preview'} src={getImageDataUrl(previewPiece)} />}
            </td>
          })}
        </tr>
      })}
      </tbody>
    </table>
  </div>
}
