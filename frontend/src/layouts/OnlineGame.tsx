import React from "react";
import './OnlineGame.scss';
import {useParams} from "react-router-dom";
import {GameMap, createGameMap, ITurnInfo, ICharacter, filterCharacters, IGameInfo, Piece} from "common";

import {Loader} from "../components/Loader";
import {OnlineGameDisplay} from "../components/OnlineGameDisplay";
import {axiosInstance} from "../utils";
import {ToastContext} from "../ToastProvider";

import {GameLobby} from "./GameLobby";

export interface ILatestPings {
  [key: string]: Date
}

export const OnlineGame = (): JSX.Element => {
  const {gameId, joinSlug} = useParams<{ gameId: string, joinSlug: string }>();
  const [loading, setLoading] = React.useState(true);
  const [gameInfo, setGameInfo] = React.useState<undefined | IGameInfo>(undefined);
  const [latestPings, setLatestPings] = React.useState<ILatestPings>({});
  const [socket, setSocket] = React.useState<undefined | WebSocket>(undefined);
  const {addToast} = React.useContext(ToastContext);

  const isYourTurn = React.useMemo(
    () => gameInfo &&
      gameInfo.data.turn &&
      gameInfo.meta.you.id === gameInfo.data.turn.playerId,
    [gameInfo],
  );

  // const [map, setMap] = React.useState<GameMap>(new GameMap())
  const placeablePiece = React.useMemo<Piece | undefined>(() => {
    if (!gameInfo || !isYourTurn || !gameInfo.data.turn || !gameInfo.data.turn.piece) {
      return undefined;
    }
    const pieceData = gameInfo.data.turn.piece;
    return new Piece(
      pieceData.sideTypes,
      pieceData.extraInfo,
      pieceData.sideConnections,
      pieceData.roadConnections,
    );
  }, [gameInfo]);

  const map = React.useMemo<GameMap>(() => {
    if (!gameInfo) {
      return new GameMap();
    }
    return createGameMap(gameInfo.data);
  }, [gameInfo]);

  const fetchGame = async () => {
    const response = await axiosInstance.get(
      `/games/${gameId}`, {
        headers: {Authorization: `Bearer ${joinSlug}`},
      },
    );
    const data: IGameInfo = response.data;
    setGameInfo(data);
  };

  const openSocket = () => {
    const newSocket = new WebSocket(
      `ws://localhost:8888/messages/${gameId}`,
      ['access_token', joinSlug],
    );
    newSocket.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      console.log('new socket message', message);

      if (message.type === 'player-joins') {
        console.log('player joined');
        fetchGame();
      }
      if (message.type === 'start-game') {
        setGameInfo((cur) => {
          if (!cur) {
            return cur;
          }
          return {
            ...cur, data: {
              ...cur.data,
              status: 'started',
            },
          };
        });
      }
      if (message.type === 'ping') {
        setLatestPings((cur) => {
          const newPings = {...cur};
          newPings[message.playerId] = new Date();
          return newPings;
        });
      }
      if (message.type === 'set-turn') {
        setGameInfo((cur) => {
          if (!cur) {
            return cur;
          }
          if (cur && message.data.playerId === cur.meta.you.id) {
            addToast('It is your turn');
          }
          return {
            ...cur, data: {
              ...cur.data,
              turn: message.data,
            },
          };
        });
      }
      if (message.type === 'piece-placed') {
        setGameInfo((cur) => {
          if (!cur) {
            return cur;
          }
          const newTurn: ITurnInfo = {...cur.data.turn!, piece: undefined};
          return {
            ...cur,
            data: {
              ...cur.data,
              pieceHolders: [...cur.data.pieceHolders, message.data],
              turn: newTurn,
            },
          };
        });
      }
      if (message.type === 'character-placed') {
        setGameInfo((cur) => {
          if (!cur) {
            return cur;
          }
          return {
            ...cur,
            data: {
              ...cur.data,
              characters: [...cur.data.characters, message.data],
              turn: {...cur.data.turn!, characterPlaced: true},
            },
          };
        });
      }
      if (message.type === 'remove-characters') {
        const charactersToBeRemoved: ICharacter[] = message.data;
        setGameInfo((cur) => {
          if (!cur) {
            return cur;
          }
          return {
            ...cur,
            data: {
              ...cur.data,
              characters: filterCharacters(cur.data.characters, charactersToBeRemoved),
            },
          };
        });
      }
    });

    return newSocket;
  };

  const initialize = async () => {
    await fetchGame();
    const newSocket = await openSocket();

    // Wait until socket is opened
    await new Promise((resolve) => {
      if (newSocket.readyState === WebSocket.OPEN) {
        // Resolve if state is already open
        resolve(undefined);
      } else {
        // Set on open handler
        newSocket.onopen = () => {
          resolve(undefined);
        };
      }
    });

    setLoading(false);
    setSocket(newSocket);
    return newSocket;
  };

  React.useEffect(() => {
    let newSocket: undefined | WebSocket;
    let intervalId: undefined | number;
    initialize().then((soc) => {
      newSocket = soc;
      intervalId = window.setInterval(() => {
        soc.send(JSON.stringify({type: 'ping'}));
      }, 10000);
      soc.send(JSON.stringify({type: 'ping'}));
    }).catch(() => {

    });
    return () => {
      if (newSocket) {
        newSocket.close();
      }
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, []);

  if (!gameInfo || !socket) {
    return <Loader full/>;
  }

  return <div className={'online-game main-limited'}>
    {loading && <Loader full/>}
    {gameInfo.data.status === 'created' && <GameLobby
      gameInfo={gameInfo}
      socket={socket}
      latestPings={latestPings}
    />}
    {gameInfo.data.status === 'started' && <OnlineGameDisplay
      gameInfo={gameInfo}
      map={map}
      latestPings={latestPings}
      placeablePiece={placeablePiece}
      onPieceSet={async (x, y, piece) => {
        addToast('Piece placed');
        if (socket) {
          await socket.send(JSON.stringify({
            type: 'piece-placed',
            data: {
              x,
              y,
              piece: piece.asJson(),
            },
          }));
        }
      }}
      onCharacterSet={async (x, y, pos) => {
        map.charactersToBeRemovedAfterPiece(x, y);
        if (!isYourTurn) {
          addToast('Not your turn.');
          return false;
        }
        if (
            gameInfo.data.turn &&
            gameInfo.data.turn.characterPlaced
        ) {
          addToast('Only one character per turn can be placed.');
          return false;
        }
        if (!(map.remainingCharacters(gameInfo.meta.you.id) > 0)) {
          addToast('No remaining characters.');
          return false;
        }
        addToast('Character placed');
        if (socket) {
          await socket.send(JSON.stringify({
            type: 'character-placed',
            data: {x, y, pos, playerId: gameInfo.meta.you.id},
          }));
        }
        return true;
      }}
    >
      <>
        {gameInfo.data.turn && isYourTurn &&
        <div className={'controls'}>
          <button
            onClick={() => {
              addToast('Turn ended.');
              socket.send(JSON.stringify({
                type: 'end-turn',
                data: {},
              }));
            }}
          >End turn
          </button>
        </div>}
      </>
    </OnlineGameDisplay>}
    {gameInfo.data.status === 'done' && <h1>Game is done</h1>}
  </div>;
};
