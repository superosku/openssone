import {BaseGame} from "../components/BaseGame";
import React from "react";
import {GameMap, getRandomPiece} from "common";
// import {pieces} from "common/src/defaultPieces";
import {allPieces} from "common";


export const OfflineGame = () => {
  const [map, setMap] = React.useState(new GameMap())
  const [nextPiece, setNextPiece] = React.useState(getRandomPiece())
  React.useEffect(() => {
    let newMap = map.clone()
    newMap.setPiece(0, 0, allPieces[0])
    setMap(newMap)
  }, [])

  return <>
    <BaseGame
      map={map}
      onSetPiece={(x, y, piece) => {
        let newMap = map.clone()
        newMap.setPiece(x, y, piece)
        setMap(newMap)
        setNextPiece(getRandomPiece())
      }}
      onSetCharacter={(x, y, pos) => {
        let newMap = map.clone()
        newMap.setCharacter(x, y, pos, '123')
        setMap(newMap)
      }}
      placeablePiece={nextPiece}
    />
  </>
}
