import React from 'react';
import './App.scss';
import {getImageDataUrl} from "./utils";
import {MapDisplay} from "./components/MapDisplay";
import {MainMenu} from './components/MainMenu'
import {Games} from './layouts/Games'

import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import {OnlineGame} from "./layouts/OnlineGame";
import {OfflineGame} from "./layouts/OfflineGame";
import {GameMap} from "common"
import {allPieces} from "common"

const GeneratedMap = () => {
  const [map, setMap] = React.useState(new GameMap())

  React.useEffect(() => {
    let newMap = map.clone()
    newMap.randomize(15, 15)
    setMap(newMap)
  }, [])

  return <div className={'main-limited'}>
    <MapDisplay map={map}/>
  </div>
}

const AllPieces = () => {
  return <div className={'main-limited'}>
    <div className="outer">
      {allPieces.map(piece => {
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
  return <Router>
    <div className={'main-container'}>
      <MainMenu/>
      <Switch>
        <Route path={'/'} exact><OfflineGame/></Route>
        <Route path={'/generated'}><GeneratedMap/></Route>
        <Route path={'/pieces'}><AllPieces/></Route>
        <Route path={'/games'} exact><Games /></Route>
        <Route path={'/games/:gameId/:joinSlug'} exact><OnlineGame /></Route>
      </Switch>
    </div>
  </Router>
}

export default App;
