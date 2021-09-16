import {BaseGame} from "../components/BaseGame";
import React from "react";
import {GameMap} from "common";
// import {pieces} from "common/src/defaultPieces";
import {pieces} from "common";


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
      onSetCharacter={(x, y, iPiecePos) => {
        let newMap = map.clone()
        newMap.setCharacter(x, y, iPiecePos, 1)
        setMap(newMap)
      }}
    />
  </>
}
