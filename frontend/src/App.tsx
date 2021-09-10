import React from 'react';
import './App.scss';
import {FaBars, FaTimes} from 'react-icons/fa';
import {allRotatedPieces, pieces} from "./game/defaultPieces";
import {GameMap} from "./game/GameMap";
import {axiosInstance, getImageDataUrl} from "./utils";
import {MapDisplay} from "./components/MapDisplay";

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";


const getRandomPiece = () => {
  return pieces[Math.floor(Math.random() * pieces.length)]
}

interface IGameProps {
  // zoomLevel: number | undefined
}

const Game = ({}: IGameProps) => {
  const [zoomLevel, setZoomLevel] = React.useState(100)
  const [map, setMap] = React.useState(new GameMap())
  const [nextPiece, setNextPiece] = React.useState(getRandomPiece())
  const [nextPieceRotation, setNextPieceRotation] = React.useState(0)

  React.useEffect(() => {
    let newMap = map.clone()
    newMap.setPiece(0, 0, pieces[0])
    setMap(newMap)
  }, [])

  return <div className={'game main-limited'}>
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

const GeneratedMap = () => {
  const [map, setMap] = React.useState(new GameMap())

  React.useEffect(() => {
    let newMap = map.clone()
    newMap.randomize()
    setMap(newMap)
  }, [])

  return <div className={'main-limited'}>
    <MapDisplay map={map}/>
  </div>
}

const AllPieces = () => {
  return <div className={'main-limited'}>
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

const App = () => {
  // const [map, setMap] = React.useState(new GameMap())
  // const [showDebug, setShowDebug] = React.useState(false)
  // const [zoomLevel, setZoomLevel] = React.useState<undefined | number>(undefined)
  // const [menuOpen, setMenuOpen] = React.useState(false)
  //
  // React.useEffect(() => {
  //   let newMap = map.clone()
  //   newMap.randomize()
  //   setMap(newMap)
  // }, [])

  // React.useEffect(() => {
  //   console.log('Opening socket')
  //
  //   const socket = new WebSocket('ws://localhost:8888/messages');
  //
  //   socket.addEventListener('close', (event) => {
  //     console.log('Socket closed')
  //   });
  //
  //   socket.addEventListener('open', (event) => {
  //     console.log('Socket opened')
  //     socket.send('Hello Server!');
  //   });
  //
  //   socket.addEventListener('message', (event) => {
  //     console.log('Message from server ', event.data);
  //   });
  // }, [])

  return <Router>
    <div className={'main-container'}>
      <nav>
        <ul>
          <li><Link to={'/'}>Try</Link></li>
          <li><Link to={'/generated'}>Generated</Link></li>
          <li><Link to={'/pieces'}>Pieces</Link></li>
          <li><Link to={'/games'}>Games</Link></li>
        </ul>
      </nav>
      <Switch>
        <Route path={'/'} exact><Game/></Route>
        <Route path={'/generated'}><GeneratedMap/></Route>
        <Route path={'/pieces'}><AllPieces/></Route>
        <Route path={'/games'}></Route>
      </Switch>
    </div>
  </Router>
}

export default App;
