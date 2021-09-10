import {Piece, PieceExtraInfo, PieceSideType} from "./game/Piece";
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:8888',
  headers: {
    'Content-Type': 'application/json'
  }
})

export const getRange = (min: number, max: number) => {
  return [...Array(max - min + 1).keys()].map(i => i + min)
}

let pieceImageCache: { [key: string]: string } = {}

export const getImageDataUrl = (piece: Piece) => {
  const colorRoad = '#b1aaa1'
  const colorCastle = '#7a5233'
  const colorCastleBoarder = '#6b482d'
  const colorWater = '#2358a7'
  const colorMonastery = '#96582f'
  const colorMonasteryBorder = '#704122'
  const colorGround = '#459926'
  const colorGroundBorder = '#3e8a22'

  const cached = pieceImageCache[piece.getHash()]
  if (cached) {
    return cached
  }

  const canvas = document.createElement('canvas')
  canvas.width = 100
  canvas.height = 100
  const ctx = canvas.getContext('2d')!

  // Full castle
  if (piece.sideTypes.every((s) => s === PieceSideType.castle)) {
    ctx.fillStyle = colorCastle
    ctx.fillRect(0, 0, 100, 100)
    ctx.fill()
    ctx.stroke()
    return canvas.toDataURL("image/png");
  }

  ctx.lineWidth = 5;

  // Fill groun with green
  ctx.fillStyle = colorGround
  ctx.strokeStyle = colorGroundBorder
  ctx.fillRect(0, 0, 100, 100)
  ctx.strokeRect(0, 0, 100, 100)

  for (let i = 0; i < 4; i++) {
    const sideType = piece.sideTypes[i]
    ctx.translate(50, 50)

    // Roads and rivers
    if (sideType === PieceSideType.road || sideType === PieceSideType.river) {
      if (sideType === PieceSideType.river) {
        ctx.strokeStyle = colorWater
      } else {
        ctx.strokeStyle = colorRoad
      }

      const canArch = (
        !(piece.extraInfo === PieceExtraInfo.monastery)
      )
      if (
        canArch &&
        sideType === piece.sideTypes[(i + 4 - 1) % 4] &&
        sideType !== piece.sideTypes[(i + 1) % 4] &&
        sideType !== piece.sideTypes[(i + 4 - 2) % 4]
      ) {
        // Do not draw corners twice
      } else if (
        canArch &&
        sideType === piece.sideTypes[(i + 1) % 4] &&
        sideType !== piece.sideTypes[(i + 2) % 4] &&
        sideType !== piece.sideTypes[(i + 3) % 4]
      ) {
        // Corners
        ctx.beginPath();
        ctx.arc(-50, 50, 50, 0, 2 * Math.PI);
        ctx.stroke();
      } else {
        if (
          sideType === PieceSideType.river && (
            piece.sideTypes.some(s => s === PieceSideType.road) ||
            piece.extraInfo === PieceExtraInfo.monastery
          )
        ) {
          // Water should bend to avoid roads or monastery
          const thing = Math.floor(i / 2) % 2 === 0 ? 15 : -15; // Needed to make water go around on the same side on both directions

          ctx.beginPath();
          ctx.moveTo(thing, 0);
          ctx.lineTo(thing, 15);
          ctx.lineTo(0, 30);
          ctx.lineTo(0, 50);
          ctx.stroke();
        } else {
          // Regular stuff
          let dist = 0
          if (piece.extraInfo === PieceExtraInfo.oppositeCastleFull) {
            dist = 22
          }
          if (piece.sideTypes[(i + 2) % 4] === PieceSideType.castle) {
            dist = -13
          }
          ctx.beginPath();
          ctx.moveTo(0, dist);
          ctx.lineTo(0, 50);
          ctx.stroke();
        }
      }

      // Draw villages and river endings
      const roadOrRiverCount = piece.sideTypes.reduce((a: number, s) => a + (s === sideType ? 1 : 0), 0)
      if (roadOrRiverCount === 1 && sideType === PieceSideType.river) {
        ctx.strokeStyle = colorWater
        ctx.fillStyle = colorWater

        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
      if (
        roadOrRiverCount !== 2 &&
        sideType === PieceSideType.road &&
        !(piece.extraInfo === PieceExtraInfo.oppositeCastleFull) &&
        !(piece.sideTypes[(i + 2) % 4] === PieceSideType.castle)
      ) {
        ctx.strokeStyle = colorRoad
        ctx.fillStyle = colorRoad

        ctx.beginPath();
        ctx.moveTo(-10, -10);
        ctx.lineTo(10, -10);
        ctx.lineTo(10, 10);
        ctx.lineTo(-10, 10);
        ctx.lineTo(-10, -10);
        ctx.fill()
      }
    }

    // Castles
    if (
      sideType === PieceSideType.castle
      && (
        piece.sideTypes[(i + 4 - 1) % 4] !== PieceSideType.castle || // Drawing handled in another side (only draw corners once)
        piece.extraInfo === PieceExtraInfo.nonConnectedSideBySideCastle // Except when non connected corner case...
      )
    ) {
      ctx.fillStyle = colorCastle
      ctx.strokeStyle = colorCastleBoarder

      if (
        piece.sideTypes[(i + 1) % 4] === PieceSideType.castle &&
        piece.sideTypes[(i + 2) % 4] === PieceSideType.castle
      ) {
        // Handle 3 sided castle
        ctx.beginPath();
        ctx.moveTo(50, -50);
        ctx.lineTo(-15, -25);
        ctx.lineTo(-15, 25);
        ctx.lineTo(50, 50);
        ctx.lineTo(-50, 50);
        ctx.lineTo(-50, -50);
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(50, -50);
        ctx.lineTo(-15, -25);
        ctx.lineTo(-15, 25);
        ctx.lineTo(50, 50);
        ctx.stroke()
      } else if (
        piece.sideTypes[(i + 1) % 4] === PieceSideType.castle &&
        piece.extraInfo !== PieceExtraInfo.nonConnectedSideBySideCastle
      ) {
        // Handle 2 sided castle
        ctx.beginPath();
        ctx.moveTo(-50, -50);
        ctx.lineTo(-10, 10);
        ctx.lineTo(50, 50);
        ctx.lineTo(-50, 50);
        ctx.fill();
        ctx.beginPath()
        ctx.moveTo(-50, -50);
        ctx.lineTo(-10, 10);
        ctx.lineTo(50, 50);
        ctx.stroke();
      } else {
        // Handle single castle
        if (
          piece.sideTypes[(i + 2) % 4] === PieceSideType.castle &&
          piece.extraInfo === PieceExtraInfo.oppositeCastleFull
        ) {
          // Handle connected opposite castle
          // Only draw connected opposite castle once
          if (i === 0 || i === 1) {
            ctx.beginPath();
            ctx.moveTo(-50, -50);
            ctx.lineTo(-20, -20);
            ctx.lineTo(-20, 20);
            ctx.lineTo(-50, 50);
            ctx.lineTo(50, 50);
            ctx.lineTo(20, 20);
            ctx.lineTo(20, -20);
            ctx.lineTo(50, -50);
            ctx.fill();

            ctx.beginPath()
            ctx.moveTo(-50, -50);
            ctx.lineTo(-20, -20);
            ctx.lineTo(-20, 20);
            ctx.lineTo(-50, 50);
            ctx.stroke()

            ctx.beginPath()
            ctx.lineTo(50, 50);
            ctx.lineTo(20, 20);
            ctx.lineTo(20, -20);
            ctx.lineTo(50, -50);
            ctx.stroke()
          }
        } else {
          // Regular 1 sided castle
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(0, 85, 60, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
        }
      }
    }

    ctx.rotate(Math.PI / 2)
    ctx.translate(-50, -50)
  }

  // Monastery
  if (piece.extraInfo === PieceExtraInfo.monastery) {
    ctx.fillStyle = colorMonastery
    ctx.strokeStyle = colorMonasteryBorder
    ctx.beginPath();
    ctx.moveTo(40, 40);
    ctx.lineTo(50, 30);
    ctx.lineTo(60, 40);
    ctx.lineTo(60, 60);
    ctx.lineTo(40, 60);
    ctx.lineTo(40, 40);
    ctx.fill()
    ctx.stroke();
  }

  const dataUrl = canvas.toDataURL("image/png");
  pieceImageCache[piece.getHash()] = dataUrl
  return dataUrl
}
