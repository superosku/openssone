import React from 'react';
import './App.scss';
import {FaBars, FaTimes} from 'react-icons/fa';
import {allRotatedPieces, pieces} from "./game/defaultPieces";
import {GameMap} from "./game/GameMap";
import {axiosInstance, getImageDataUrl} from "./utils";
import {MapDisplay} from "./components/MapDisplay";


const getRandomPiece = () => {
  return pieces[Math.floor(Math.random() * pieces.length)]
}

interface IGameProps {
  zoomLevel: number | undefined
}

const Game = ({zoomLevel}: IGameProps) => {
  const [map, setMap] = React.useState(new GameMap())
  const [nextPiece, setNextPiece] = React.useState(getRandomPiece())
  const [nextPieceRotation, setNextPieceRotation] = React.useState(0)

  React.useEffect(() => {
    let newMap = map.clone()
    newMap.setPiece(0, 0, pieces[0])
    setMap(newMap)
  }, [])

  return <div className={'game'}>
    <div className={'map-container'}>
      <MapDisplay
        zoomLevel={zoomLevel}
        placeablePiece={nextPiece.getRotated(nextPieceRotation)}
        map={map}
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
          let newMap = map.clone()
          newMap.setPiece(x, y, rotatedPiece)
          setMap(newMap)
          setNextPiece(getRandomPiece)
        }}
      />
    </div>
    <div className={'rotation-choices'}>
      {[0, 1, 2, 3].map(rotationChoice => {
        return <div
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
}

const App = () => {
  const [map, setMap] = React.useState(new GameMap())
  const [showDebug, setShowDebug] = React.useState(true)
  const [zoomLevel, setZoomLevel] = React.useState<undefined | number>(undefined)
  const [menuOpen, setMenuOpen] = React.useState(false)

  React.useEffect(() => {
    let newMap = map.clone()
    newMap.randomize()
    setMap(newMap)
  }, [])

  React.useEffect(() => {
    console.log('Opening socket')

    const socket = new WebSocket('ws://localhost:8888/messages');

    socket.addEventListener('close', (event) => {
      console.log('Socket closed')
    });

    socket.addEventListener('open', (event) => {
      console.log('Socket opened')
      socket.send('Hello Server!');
    });

    socket.addEventListener('message', (event) => {
      console.log('Message from server ', event.data);
    });
  }, [])

  return (
    <div className={'main-container'}>
      <div>
        <button
          onClick={async () => {
            const response = await axiosInstance.post('/games/new')
            console.log(response)
          }}
        >newGame
        </button>
        <button
          onClick={async () => {
            const response = await axiosInstance.post('/games/join/0ekfi')
            console.log(response)
          }}>joinGame
        </button>
        <button
          onClick={async () => {
            const response = await axiosInstance.get('/games/613aefce6ef6423566001988')
            console.log(response)
          }}>getGame
        </button>
        <button
          onClick={async () => {
            const response = await axiosInstance.post(
              '/games/613aefce6ef6423566001988/pieces',
              {
                x: Math.floor(Math.random() * 10) - 5,
                y: Math.floor(Math.random() * 10) - 5,
                piece: allRotatedPieces[
                  Math.floor(Math.random() * allRotatedPieces.length)
                  ].asJson()
              }
            )
            console.log(response)
          }}>postPiece
        </button>
      </div>
      <div className={'menu' + (menuOpen ? ' open' : ' closed')}>
        {menuOpen ? <>
          <FaTimes className={'times'} onClick={() => {
            setMenuOpen(!menuOpen)
          }}/>
          <span onClick={() => {
            setShowDebug(!showDebug)
          }}>Toggle debug</span>
          <span onClick={() => {
            setZoomLevel(undefined)
          }}>100%</span>
          <span onClick={() => {
            setZoomLevel(75)
          }}>75%</span>
          <span onClick={() => {
            setZoomLevel(50)
          }}>50%</span>
          <span onClick={() => {
            setZoomLevel(25)
          }}>25%</span>
        </> : <FaBars className={'bars'} onClick={() => {
          setMenuOpen(!menuOpen)
        }}/>}
      </div>
      {!showDebug && <Game zoomLevel={zoomLevel}/>}
      {showDebug &&
      <div>
        <h1>Generated map</h1>
        <MapDisplay map={map}/>
        <h1>All pieces</h1>
        <div className="outer">
          {pieces.map(piece => {
            return <div className={"inner"} key={piece.getHash()}>
              {[0, 1, 2, 3].map(rotation => {
                return <img key={rotation} src={getImageDataUrl(piece.getRotated(rotation))}/>
              })}
            </div>
          })}
        </div>
      </div>
      }
    </div>
  );
}

export default App;
