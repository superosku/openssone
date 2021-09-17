import React from "react";
import './BaseGame.scss'
import {MapDisplay} from "./MapDisplay";
import {getImageDataUrl} from "../utils";
import {Piece} from "common";
import {GameMap, IPiecePos} from "common";
import {FaUndo, FaRedo} from 'react-icons/fa';

interface IBaseGameProps {
  map: GameMap
  onSetPiece: (x: number, y: number, piece: Piece) => void
  onSetCharacter: (x: number, y: number, pos: IPiecePos) => void
  placeablePiece?: Piece
  children?: JSX.Element
}

export const BaseGame = (
  {
    map,
    onSetPiece,
    onSetCharacter,
    placeablePiece,
    children
  }: IBaseGameProps) => {
  const [zoomLevel, setZoomLevel] = React.useState(100)
  const [nextPieceRotation, setNextPieceRotation] = React.useState(0)

  return <div className={'game main-limited'}>
    <div className={'map-container'}>
      <MapDisplay
        zoomLevel={zoomLevel}
        placeablePiece={placeablePiece && placeablePiece.getRotated(nextPieceRotation)}
        map={map}
        onClickMap={(x, y, pos) => {
          if (!pos) {
            if (!placeablePiece) {
              return
            }
            let rotatedPiece = placeablePiece.getRotated(nextPieceRotation)
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
          } else {
            onSetCharacter(x, y, pos)
          }
        }}
      />
    </div>
    {children}
    <div className={'bottom-menu'}>
      <div className={'buttons'}>
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
    </div>
      {placeablePiece &&
      <div className={'rotation-choices'}>
        <div className={'rotation-button'} onClick={() => {
          setNextPieceRotation((nextPieceRotation + 1 + 4) % 4)
        }}>
          <FaUndo/>
        </div>
        <img src={getImageDataUrl(placeablePiece.getRotated(nextPieceRotation))}/>
        <div className={'rotation-button'} onClick={() => {
          setNextPieceRotation((nextPieceRotation - 1 + 4) % 4)
        }}>
          <FaRedo/>
        </div>
      </div>}
    {/*</div>*/}
  </div>
}
