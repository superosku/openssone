import {Piece, PieceExtraInfo, PieceSideType} from "./game/Piece";
import axios from "axios";
import {pieces} from "./game/defaultPieces";

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
  const colorCoastal = '#ffde5f'
  const colorWater = '#3178e3'
  const colorWaterDeep = '#2457a2'
  // const colorWaterDeepset = '#1e5099'
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
    return canvas.toDataURL("image/png");
  }

  // Fill groun with green
  ctx.fillStyle = colorGround
  ctx.strokeStyle = colorGroundBorder
  ctx.fillRect(0, 0, 100, 100)
  ctx.strokeRect(0, 0, 100, 100)

  ctx.lineWidth = 2;
  for (let i = 0; i < 500; i++) {
    const x = Math.round(Math.random() * 100)
    const y = Math.round(Math.random() * 100)
    const length = Math.round(Math.random() * 5 + 3)
    ctx.strokeStyle = `rgb(
      ${Math.round(62 - 5 + Math.random() * 10)},
      ${Math.round(138 - 2 + Math.random() * 40)},
      ${Math.round(34 - 5 + Math.random() * 10)}
    `
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + length);
    ctx.stroke();
  }

  ctx.lineWidth = 5;

  for (let i = 0; i < 4; i++) {
    const sideType = piece.sideTypes[i]
    ctx.translate(50, 50)

    // Roads and rivers
    if (sideType === PieceSideType.road || sideType === PieceSideType.river) {
      const colorsAndWidths: [string, number][] = sideType === PieceSideType.river ? [
        [colorCoastal, 17],
        [colorWater, 13],
        [colorWaterDeep, 8],
        // [colorWaterDeepset, 6],
      ] : [
        [colorRoad, 5]
      ]

      for (let j = 0; j < colorsAndWidths.length; j++) {
        const [color, width] = colorsAndWidths[j]

        ctx.strokeStyle = color
        ctx.lineWidth = width

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
          ctx.strokeStyle = color
          ctx.fillStyle = color
          ctx.lineWidth = width

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
          ctx.strokeStyle = color
          ctx.fillStyle = color
          ctx.lineWidth = width

          ctx.beginPath();
          ctx.moveTo(-10, -10);
          ctx.lineTo(10, -10);
          ctx.lineTo(10, 10);
          ctx.lineTo(-10, 10);
          ctx.lineTo(-10, -10);
          ctx.fill()
        }
      }
    }

    ctx.lineWidth = 5;
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

        for (let i = 0; i < 2; i++) {
          ctx.beginPath();
          ctx.moveTo(50, -50);
          ctx.lineTo(-15, -25);
          ctx.lineTo(-15, 25);
          ctx.lineTo(50, 50);
          ctx.stroke()
          ctx.setLineDash([3, 3])
          ctx.lineWidth = 8;
        }
        ctx.setLineDash([])
        ctx.lineWidth = 5;
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
        for (let i = 0; i < 2; i++) {
          ctx.beginPath()
          ctx.moveTo(-50, -50);
          ctx.lineTo(-10, 10);
          ctx.lineTo(50, 50);
          ctx.stroke();
          ctx.setLineDash([3, 3])
          ctx.lineWidth = 8;
        }
        ctx.setLineDash([])
        ctx.lineWidth = 5;
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

            for (let i = 0; i < 2; i++) {
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
              ctx.setLineDash([3, 3])
              ctx.lineWidth = 8;
            }
            ctx.setLineDash([])
            ctx.lineWidth = 5;
          }
        } else {
          // Regular 1 sided castle
          ctx.beginPath();
          ctx.arc(0, 85, 60, 0, 2 * Math.PI);
          ctx.fill();
          for (let i = 0; i < 2; i++) {
            ctx.beginPath();
            ctx.arc(0, 85, 60, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([3, 3])
            ctx.lineWidth = 8;
          }
          ctx.setLineDash([])
          ctx.lineWidth = 5;
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

export const getRandomPiece = () => {
  return pieces[Math.floor(Math.random() * pieces.length)]
}
