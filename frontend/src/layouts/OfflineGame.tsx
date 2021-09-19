import React from "react";
import {GameMap, getRandomPiece, allPieces} from "common";

import {BaseGame} from "../components/BaseGame";


export const OfflineGame = (): JSX.Element => {
  const [map, setMap] = React.useState(new GameMap());
  const [nextPiece, setNextPiece] = React.useState(getRandomPiece());
  React.useEffect(() => {
    const newMap = map.clone();
    newMap.setPiece(0, 0, allPieces[0]);
    setMap(newMap);
  }, []);

  return <>
    <BaseGame
      map={map}
      onSetPiece={(x, y, piece) => {
        const newMap = map.clone();
        newMap.setPiece(x, y, piece);
        setMap(newMap);
        setNextPiece(getRandomPiece());
      }}
      onSetCharacter={(x, y, pos) => {
        const newMap = map.clone();
        newMap.setCharacter(x, y, pos, '123');
        setMap(newMap);
      }}
      placeablePiece={nextPiece}
    />
  </>;
};
