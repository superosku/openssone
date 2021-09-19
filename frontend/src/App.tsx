import React from 'react';
import './App.scss';
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import {GameMap, allPieces} from "common";

import {getImageDataUrl} from "./utils";
import {MapDisplay} from "./components/MapDisplay";
import {MainMenu} from './components/MainMenu';
import {Games} from './layouts/Games';
import {OnlineGame} from "./layouts/OnlineGame";
import {OfflineGame} from "./layouts/OfflineGame";
import {ToastProvider} from "./ToastProvider";

const GeneratedMap = (): JSX.Element => {
  const [map, setMap] = React.useState(new GameMap());

  React.useEffect(() => {
    const newMap = map.clone();
    newMap.randomize(15, 15);
    setMap(newMap);
  }, []);

  return <div className={'main-limited'}>
    <MapDisplay map={map}/>
  </div>;
};

const AllPieces = (): JSX.Element => {
  return <div className={'main-limited'}>
    <div className="outer">
      {allPieces.map((piece) => {
        return <div className={"inner"} key={piece.getHash()}>
          {[0, 1, 2, 3].map((rotation) => {
            return <img key={rotation} src={getImageDataUrl(piece.getRotated(rotation))}/>;
          })}
        </div>;
      })}
    </div>
  </div>;
};

const App = (): JSX.Element => {
  return <Router>
    <ToastProvider>
      <div className={'main-container'}>
        <MainMenu/>
        <Switch>
          <Route path={'/'} exact><OfflineGame/></Route>
          <Route path={'/generated'}><GeneratedMap/></Route>
          <Route path={'/pieces'}><AllPieces/></Route>
          <Route path={'/games'} exact><Games/></Route>
          <Route path={'/games/:gameId/:joinSlug'} exact><OnlineGame/></Route>
        </Switch>
      </div>
    </ToastProvider>
  </Router>;
};

export default App;
