import React from 'react';
import './MapDisplay.scss';
import {GameMap, IOctant, IQuadrant} from "../game/GameMap";
import {Piece} from "../game/Piece";
import {FaCheck} from 'react-icons/fa';
import {getImageDataUrl, getRange} from "../utils";

interface IMapDisplayProps {
  map: GameMap
  zoomLevel?: number,
  onClickMap?: (x: number, y: number) => void
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

  return <div className={'map-display' + (zoomLevel ? (' zoom-out ' + 'zoom-out-' + zoomLevel) : '')}>
    <table>
      <tbody>
      {getRange(mapRange.y.min - 1, mapRange.y.max + 1).map(y => {
        return <tr key={y}>
          {getRange(mapRange.x.min - 1, mapRange.x.max + 1).map(x => {
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
              {pieceHolder && <>
                <img
                  src={getImageDataUrl(pieceHolder.piece)}
                  onClick={(event) => {
                    const clickY = (
                      (event.clientY - (event.target as HTMLImageElement).getBoundingClientRect().top) *
                      (100 / (zoomLevel || 100))
                    )
                    const clickX = (
                      (event.clientX - (event.target as HTMLImageElement).getBoundingClientRect().left) *
                      (100 / (zoomLevel || 100))
                    )

                    // Road Click
                    let clickedRoadQuadrant

                    if (clickX >= 45 && clickX <= 55) {
                      if (clickY < 50) {
                        clickedRoadQuadrant = 2
                      } else {
                        clickedRoadQuadrant = 0
                      }
                    }
                    if (clickY >= 45 && clickY <= 55) {
                      if (clickX < 50) {
                        clickedRoadQuadrant = 1
                      } else {
                        clickedRoadQuadrant = 3
                      }
                    }

                    if (clickedRoadQuadrant !== undefined) {
                      const roads = map.getRoadPoints(x, y, clickedRoadQuadrant)
                      if (roads) {
                        setDebugRoads(roads)
                        setDebugOctants([])
                        return
                      }
                    }

                    // Octant Click
                    let octant = 0

                    if (clickY < 50) {
                      if (clickX < 50) {
                        if (clickX < clickY) {
                          octant = 3
                        } else {
                          octant = 4
                        }
                      } else {
                        if (clickX + clickY < 100) {
                          octant = 5
                        } else {
                          octant = 6
                        }
                      }
                    } else {
                      if (clickX < 50) {
                        if (clickX + clickY < 100) {
                          octant = 2
                        } else {
                          octant = 1
                        }
                      } else {
                        if (clickX < clickY) {
                          octant = 0
                        } else {
                          octant = 7
                        }
                      }
                    }

                    const octants = map.getCastlePoints(x, y, octant)
                    setDebugOctants(octants)
                    setDebugRoads([])
                  }
                  }
                />
                {debugOctants.filter(q => q.x === x && q.y === y).map(q => {
                  return <span
                    className={'debug-octant debug-octant-' + q.octa}
                    key={q.octa}
                  ></span>
                })}
                {debugRoads.filter(q => q.x === x && q.y === y).map(q => {
                  return <span
                    className={'debug-road debug-road-' + q.road}
                    key={q.road}
                  ></span>
                })}
              </>
              }
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
