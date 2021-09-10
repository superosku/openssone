import {BaseGame} from "../components/BaseGame";
import React from "react";
import {GameMap} from "../game/GameMap";
import {pieces} from "../game/defaultPieces";
import {getRandomPiece} from "../utils";
import {MapDisplay} from "../components/MapDisplay";
import {Piece} from "../game/Piece";


export const OfflineGame = () => {
  const [map, setMap] = React.useState(new GameMap())
  React.useEffect(() => {
    let newMap = map.clone()
    newMap.setPiece(0, 0, pieces[0])
    setMap(newMap)
  }, [])

  return <>
    <BaseGame
      map={map}
      onSetPiece={(x, y, piece) => {
        let newMap = map.clone()
        newMap.setPiece(x, y, piece)
        setMap(newMap)
      }}
    />
  </>
}
