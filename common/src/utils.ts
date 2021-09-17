import {IGameState} from "./game";
import {defaultPieces, riverPieces} from "./defaultPieces";

export const getNextGamePiece = (gameState: IGameState) => {
  if (gameState.pieceHolders.length === 0 || gameState.pieceHolders.length === 7) {
    return riverPieces[0]
  }
  const pieceChoices = gameState.pieceHolders.length < 7 ? riverPieces.slice(1) : defaultPieces
  return pieceChoices[Math.floor(Math.random() * pieceChoices.length)]
}
