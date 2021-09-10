import React from "react";
import './BaseGame.scss'
import {GameMap} from "../game/GameMap";
import {pieces} from "../game/defaultPieces";
import {MapDisplay} from "./MapDisplay";
import {getImageDataUrl, getRandomPiece} from "../utils";
import {Piece} from "../game/Piece";

interface IBaseGameProps {
  map: GameMap
  onSetPiece: (x: number, y: number, piece: Piece) => void
}

export const BaseGame = ({map, onSetPiece}: IBaseGameProps) => {
  const [zoomLevel, setZoomLevel] = React.useState(100)
  const [nextPiece, setNextPiece] = React.useState(getRandomPiece())
  const [nextPieceRotation, setNextPieceRotation] = React.useState(0)

  return <div className={'game main-limited'}>
    <div className={'map-container'}>
      <MapDisplay
        zoomLevel={zoomLevel}
        placeablePiece={nextPiece.getRotated(nextPieceRotation)}
        map={map}
        // onClickMap={onClickMap}
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
          onSetPiece(x, y, rotatedPiece)
          // let newMap = map.clone()
          // newMap.setPiece(x, y, rotatedPiece)
          // setMap(newMap)
          setNextPiece(getRandomPiece())
        }}
      />
    </div>
    <div className={'bottom-menu'}>
      <div className={'buttons'}>
        <button onClick={() => {
          setNextPiece(getRandomPiece())
        }}>Random piece
        </button>
        <button onClick={() => {
          setZoomLevel(100)
        }}>100%
        </button>
        <button onClick={() => {
          setZoomLevel(75)
        }}>75%
        </button>
        <button onClick={() => {
          setZoomLevel(50)
        }}>50%
        </button>
      </div>
      <div className={'rotation-choices'}>
        {[0, 1, 2, 3].map(rotationChoice => {
          return <div
            key={rotationChoice}
            className={nextPieceRotation === rotationChoice ? 'active' : ''}
          >
            <img
              key={rotationChoice}
              onClick={() => {
                setNextPieceRotation(rotationChoice)
              }}
              src={getImageDataUrl(nextPiece.getRotated(rotationChoice))}
            />
          </div>
        })}
      </div>
    </div>
  </div>
}
