import React from "react";
import './Games.scss';
import {useHistory} from "react-router-dom";
import {IGameInfo, IGameState} from "common";
import {FaRedo} from 'react-icons/fa';
import {GiMeeple} from 'react-icons/gi';
import dayjs from "dayjs";
import relativeTime from 'dayjs/plugin/relativeTime';

import {Loader} from "../components/Loader";
import {axiosInstance, getRange} from "../utils";

dayjs.extend(relativeTime);

export const Games = (): JSX.Element => {
  const [games, setGames] = React.useState<IGameState[]>([]);
  const [loading, setLoading] = React.useState(true);
  const history = useHistory();

  const loadGames = async () => {
    setLoading(true);
    setGames([]);
    const response = await axiosInstance.get('/games');
    setGames(response.data);
    setLoading(false);
  };

  React.useEffect(() => {
    loadGames();
  }, []);

  if (loading) {
    return <div className={'games'}>
      <Loader/>
    </div>;
  }

  return <div className={'games'}>
    <div className={'top-controls'}>
      <FaRedo
        className={'refresh'}
        onClick={loadGames}
      />
    </div>
    <ul className={'game-list'}>
      {games.map((game) => {
        return <li className={'game'} key={game.id}>
          <div>
            <div>
              Created: <span className={'created'}>{dayjs(game.createdAt).fromNow()}</span>
            </div>
            <div>
              Players: <span>{getRange(0, game.players.length).map((i) => {
                return <GiMeeple
                key={i}
                className={`player-${i}`}
              />;
              })}</span>
            </div>
          </div>
          <div className={'right-part'}>
            <div>
              <span className={`status ${game.status}`}>{game.status}</span>
            </div>
            {game.status === 'created' && <button
              className={'btn'}
              onClick={async () => {
                const response = await axiosInstance.post(`/games/join/${game.joinSlug}`);
                const gameId = response.data.data._id;
                const joinSlug = response.data.meta.you.joinSlug;
                history.push(`/games/${gameId}/${joinSlug}`);
              }}>Join
            </button>}
          </div>
        </li>;
      })}
    </ul>
    <div className={'bottom-controls'}>
      <button
        className={'btn'}
        onClick={async () => {
          setLoading(true);
          const response = await axiosInstance.post('/games/new');
          const responseGame: IGameInfo = response.data;
          const gameId = responseGame.data.id;
          const joinSlug = responseGame.meta.you.joinSlug;
          history.push(`/games/${gameId}/${joinSlug}`);
        }}
      >New game
      </button>
    </div>
  </div>;
};
