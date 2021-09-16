import React from "react";
import './BaseGame.scss'
import {MapDisplay} from "./MapDisplay";
import {getImageDataUrl, getRandomPiece} from "../utils";
import {Piece} from "common";
import {GameMap, IPiecePos} from "common";
import {FaUndo, FaRedo} from 'react-icons/fa';

interface IBaseGameProps {
  map: GameMap
  onSetPiece: (x: number, y: number, piece: Piece) => void
  onSetCharacter: (x: number, y: number, iPiecePos: IPiecePos) => void
}

export const BaseGame = ({map, onSetPiece, onSetCharacter}: IBaseGameProps) => {
  const [zoomLevel, setZoomLevel] = React.useState(100)
  const [nextPiece, setNextPiece] = React.useState(getRandomPiece())
  const [nextPieceRotation, setNextPieceRotation] = React.useState(0)

  return <div className={'game main-limited'}>
    <div className={'map-container'}>
      <MapDisplay
        zoomLevel={zoomLevel}
        placeablePiece={nextPiece.getRotated(nextPieceRotation)}
        map={map}
        onClickMap={(x, y, pos) => {
          if (!pos) {
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

            setNextPiece(getRandomPiece())
          } else {
            onSetCharacter(x, y, pos)
          }
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
        <div className={'rotation-button'} onClick={() => {
          setNextPieceRotation((nextPieceRotation + 1 + 4) % 4)
        }}>
          <FaUndo/>
        </div>
        <img src={getImageDataUrl(nextPiece.getRotated(nextPieceRotation))}/>
        <div className={'rotation-button'} onClick={() => {
          setNextPieceRotation((nextPieceRotation - 1 + 4) % 4)
        }}>
          <FaRedo/>
        </div>
      </div>
    </div>
  </div>
}
