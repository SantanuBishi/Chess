import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Image,
  Platform,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  useRoute,
  useNavigation,
} from '@react-navigation/native';

import { Chess } from 'chess.js';

import {
  useStockfishManager,
} from '../engine/stockfish';

import {
  TimerBlock,
  MoveHistoryPanel,
} from '../Features';

import ChessBoard from '../Chessboard/Chessboard';

import styles from './playBotPage2Styles';

/* =========================================
   CHESS POSITION HELPERS
========================================= */

const getPositionMap = (fen) => {
  const rows = fen.split(' ')[0].split('/');
  const files = 'abcdefgh';
  const position = {};

  rows.forEach((row, rowIndex) => {
    let fileIndex = 0;

    for (const char of row) {
      if (/\d/.test(char)) {
        fileIndex += Number(char);
      } else {
        position[
          `${files[fileIndex]}${8 - rowIndex}`
        ] = char;

        fileIndex += 1;
      }
    }
  });

  return position;
};

const getLastMoveHighlight = (chess) => {
  const lastMove = chess
    .history({ verbose: true })
    .slice(-1)[0];

  if (!lastMove) {
    return null;
  }

  return {
    from: lastMove.from,
    to: lastMove.to,
    capture: lastMove.flags.includes('c')
      ? lastMove.to
      : null,
  };
};

/* =========================================
   PLAY BOT SCREEN
========================================= */

export default function PlayBotPage2() {
  const route = useRoute();
  const navigation = useNavigation();

  const {
    strength = 8,
    color = 'white',
    timeControl = 0,
    startTimer = false,
    bot,
  } = route.params || {};

  const playerIsWhite = color === 'white';

  const orientation = playerIsWhite
    ? 'white'
    : 'black';

  /* =========================================
     GAME REFERENCES
  ========================================= */

  const chessRef = useRef(new Chess());

  const reviewChessRef = useRef(new Chess());

  const botThinkingRef = useRef(false);

  const gameActiveRef = useRef(true);

  const pendingBotMoveRef = useRef(false);

  const makeBotMoveRef = useRef(null);

  const applyBotMoveRef = useRef(null);

  const timeLogRef = useRef([
    {
      w: timeControl,
      b: timeControl,
    },
  ]);

  /* =========================================
     UI STATE
  ========================================= */

  const [positionMap, setPositionMap] = useState(
    () => getPositionMap(chessRef.current.fen()),
  );

  const [selectedSquare, setSelectedSquare] =
    useState(null);

  const [legalMoves, setLegalMoves] =
    useState([]);

  const [highlightSquares, setHighlightSquares] =
    useState(null);

  const [moveHistory, setMoveHistory] =
    useState([]);

  const [moveIndex, setMoveIndex] =
    useState(-1);

  const [rollbackIndex, setRollbackIndex] =
    useState(0);

  const [showOptions, setShowOptions] =
    useState(false);

  /* =========================================
     TIMER STATE
  ========================================= */

  const [whiteTime, setWhiteTime] =
    useState(timeControl);

  const [blackTime, setBlackTime] =
    useState(timeControl);

  const [activeColor, setActiveColor] =
    useState('w');

  const [isRunning, setIsRunning] =
    useState(Boolean(startTimer));

  const [isBoardTouchable, setBoardTouchable] =
    useState(true);

  const [timeLog, setTimeLog] = useState([
    {
      w: timeControl,
      b: timeControl,
    },
  ]);

  /* =========================================
     ENGINE / GAME STATUS
  ========================================= */

  const [botThinking, setBotThinking] =
    useState(false);

  const [gameMessage, setGameMessage] =
    useState('');

  /* =========================================
     SCREEN LIFECYCLE
  ========================================= */

  useEffect(() => {
    gameActiveRef.current = true;

    return () => {
      gameActiveRef.current = false;
    };
  }, []);

  /* =========================================
     TURN HELPER
  ========================================= */

  const isPlayersTurn = useCallback(() => {
    const turn = chessRef.current.turn();

    return (
      (turn === 'w' && playerIsWhite) ||
      (turn === 'b' && !playerIsWhite)
    );
  }, [playerIsWhite]);

  /* =========================================
     UPDATE BOARD AFTER A MOVE
  ========================================= */

  const updateBoard = useCallback(() => {
    const chess = chessRef.current;

    const history = chess.history();

    const newTimeLog = timeLogRef.current.slice(
      0,
      history.length + 1,
    );

    timeLogRef.current = newTimeLog;

    setTimeLog(newTimeLog);

    setMoveHistory(history);

    setMoveIndex(history.length - 1);

    setRollbackIndex(history.length);

    reviewChessRef.current = new Chess(
      chess.fen(),
    );

    setPositionMap(
      getPositionMap(chess.fen()),
    );

    setActiveColor(chess.turn());

    setHighlightSquares(
      getLastMoveHighlight(chess),
    );

    setSelectedSquare(null);

    setLegalMoves([]);

    if (chess.isCheckmate()) {
      setGameMessage(
        chess.turn() ===
          (playerIsWhite ? 'w' : 'b')
          ? 'Checkmate! Bot wins.'
          : 'Checkmate! You win!',
      );

      setIsRunning(false);

      setBoardTouchable(false);
    } else if (chess.isDraw()) {
      setGameMessage('Game drawn.');

      setIsRunning(false);

      setBoardTouchable(false);
    } else if (chess.isCheck()) {
      setGameMessage('Check!');
    } else {
      setGameMessage('');
    }
  }, [playerIsWhite]);

  /* =========================================
     APPLY STOCKFISH MOVE
  ========================================= */

  const applyBotMove = useCallback(
    (uciMove) => {
      if (!gameActiveRef.current) {
        return;
      }

      const chess = chessRef.current;

      try {
        const move = chess.move({
          from: uciMove.slice(0, 2),
          to: uciMove.slice(2, 4),
          promotion: uciMove[4] || 'q',
        });

        if (!move) {
          console.warn(
            'Stockfish returned an illegal move:',
            uciMove,
          );

          return;
        }

        const historyLength =
          chess.history().length;

        const snapshot = {
          w: whiteTime,
          b: blackTime,
        };

        timeLogRef.current =
          timeLogRef.current.slice(
            0,
            historyLength,
          );

        timeLogRef.current.push(snapshot);

        updateBoard();
      } catch (error) {
        console.warn(
          'Could not apply Stockfish move:',
          error,
        );
      }
    },
    [
      updateBoard,
      whiteTime,
      blackTime,
    ],
  );

  applyBotMoveRef.current = applyBotMove;

  /* =========================================
     CENTRAL STOCKFISH MANAGER
  ========================================= */

  const {
    engineReady,
    engineReadyRef,
    engineRunningRef,
    sendCommandToStockfish,
  } = useStockfishManager({
    /*
     * Called when the engine is ready.
     */
    onReady: useCallback(() => {
      if (!playerIsWhite) {
        setTimeout(() => {
          makeBotMoveRef.current?.();
        }, 200);
      }
    }, [playerIsWhite]),

    /*
     * Called when Stockfish returns bestmove.
     */
    onBestMove: useCallback((move) => {
      pendingBotMoveRef.current = false;

      botThinkingRef.current = false;

      setBotThinking(false);

      if (
        move &&
        move !== '(none)' &&
        move !== '0000'
      ) {
        applyBotMoveRef.current?.(move);
      }
    }, []),

    /*
     * Called when the engine reports an error.
     */
    onError: useCallback((error) => {
      console.warn(
        'Stockfish error:',
        error,
      );

      setGameMessage(
        'Stockfish error. Please exit and reopen the game.',
      );
    }, []),
  });

  /* =========================================
     ASK STOCKFISH TO MAKE A BOT MOVE
  ========================================= */

  const makeBotMove = useCallback(() => {
    const chess = chessRef.current;

    if (
      !gameActiveRef.current ||
      !engineReadyRef.current ||
      !engineRunningRef.current ||
      pendingBotMoveRef.current ||
      chess.isGameOver() ||
      isPlayersTurn()
    ) {
      return;
    }

    pendingBotMoveRef.current = true;

    botThinkingRef.current = true;

    setBotThinking(true);

    sendCommandToStockfish(
      `position fen ${chess.fen()}`,
    );

    const safeStrength = Math.max(
      1,
      Math.min(
        20,
        Number(strength) || 8,
      ),
    );

    sendCommandToStockfish(
      `go depth ${safeStrength}`,
    );
  }, [
    isPlayersTurn,
    sendCommandToStockfish,
    strength,
  ]);

  makeBotMoveRef.current = makeBotMove;

  /* =========================================
     TIMER
  ========================================= */

  useEffect(() => {
    if (
      !isRunning ||
      timeControl <= 0 ||
      !isBoardTouchable
    ) {
      return undefined;
    }

    const interval = setInterval(() => {
      if (activeColor === 'w') {
        setWhiteTime((previous) => {
          if (previous <= 1) {
            setIsRunning(false);

            setBoardTouchable(false);

            Alert.alert(
              'Time out',
              playerIsWhite
                ? 'You lost on time.'
                : 'Bot lost on time.',
            );

            return 0;
          }

          return previous - 1;
        });
      } else {
        setBlackTime((previous) => {
          if (previous <= 1) {
            setIsRunning(false);

            setBoardTouchable(false);

            Alert.alert(
              'Time out',
              playerIsWhite
                ? 'Bot lost on time.'
                : 'You lost on time.',
            );

            return 0;
          }

          return previous - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    isRunning,
    timeControl,
    isBoardTouchable,
    activeColor,
    playerIsWhite,
  ]);

  /* =========================================
     PLAYER MOVE
  ========================================= */

  const onSquarePress = useCallback(
    (square) => {
      const chess = chessRef.current;

      if (
        !gameActiveRef.current ||
        !engineReadyRef.current ||
        !engineRunningRef.current ||
        !isBoardTouchable ||
        !isPlayersTurn() ||
        botThinkingRef.current ||
        chess.isGameOver()
      ) {
        if (
          !isBoardTouchable &&
          Platform.OS === 'android'
        ) {
          ToastAndroid.show(
            'Press Start to continue.',
            ToastAndroid.SHORT,
          );
        }

        return;
      }

      if (selectedSquare) {
        let move = null;

        try {
          move = chess.move({
            from: selectedSquare,
            to: square,
            promotion: 'q',
          });
        } catch {
          move = null;
        }

        setSelectedSquare(null);

        setLegalMoves([]);

        if (move) {
          const historyLength =
            chess.history().length;

          const snapshot = {
            w: whiteTime,
            b: blackTime,
          };

          timeLogRef.current =
            timeLogRef.current.slice(
              0,
              historyLength,
            );

          timeLogRef.current.push(snapshot);

          updateBoard();

          setTimeout(() => {
            makeBotMoveRef.current?.();
          }, 200);
        } else {
          const possible = chess.moves({
            square,
            verbose: true,
          });

          if (possible.length) {
            setSelectedSquare(square);

            setLegalMoves(possible);

            setHighlightSquares({
              from: square,
            });
          } else {
            setHighlightSquares(
              getLastMoveHighlight(chess),
            );
          }
        }

        return;
      }

      const possible = chess.moves({
        square,
        verbose: true,
      });

      if (possible.length) {
        setSelectedSquare(square);

        setLegalMoves(possible);

        setHighlightSquares({
          from: square,
        });
      }
    },
    [
      isBoardTouchable,
      isPlayersTurn,
      selectedSquare,
      updateBoard,
      whiteTime,
      blackTime,
    ],
  );

  /* =========================================
     START / PAUSE GAME
  ========================================= */

  const pauseOrStart = useCallback(() => {
    if (isRunning) {
      setIsRunning(false);

      setBoardTouchable(false);

      if (
        pendingBotMoveRef.current &&
        engineReadyRef.current
      ) {
        sendCommandToStockfish('stop');

        pendingBotMoveRef.current = false;

        botThinkingRef.current = false;

        setBotThinking(false);
      }

      return;
    }

    if (!engineReadyRef.current) {
      Alert.alert(
        'Please wait',
        'Stockfish is still starting.',
      );

      return;
    }

    if (chessRef.current.isGameOver()) {
      Alert.alert(
        'Game over',
        'This game has already finished.',
      );

      return;
    }

    const liveHistoryLength =
      chessRef.current.history().length;

    if (
      moveIndex !== liveHistoryLength - 1
    ) {
      setMoveIndex(
        liveHistoryLength - 1,
      );

      setRollbackIndex(
        liveHistoryLength,
      );

      setPositionMap(
        getPositionMap(
          chessRef.current.fen(),
        ),
      );

      setHighlightSquares(
        getLastMoveHighlight(
          chessRef.current,
        ),
      );

      setActiveColor(
        chessRef.current.turn(),
      );
    }

    setBoardTouchable(true);

    setIsRunning(true);

    if (!isPlayersTurn()) {
      setTimeout(() => {
        makeBotMoveRef.current?.();
      }, 200);
    }
  }, [
    isRunning,
    isPlayersTurn,
    moveIndex,
    sendCommandToStockfish,
  ]);

  /* =========================================
     UNDO
  ========================================= */

  const undoMove = useCallback(() => {
    if (!gameActiveRef.current) {
      return;
    }

    if (
      pendingBotMoveRef.current &&
      engineReadyRef.current
    ) {
      sendCommandToStockfish('stop');

      pendingBotMoveRef.current = false;

      botThinkingRef.current = false;

      setBotThinking(false);
    }

    const chess = chessRef.current;

    if (chess.history().length === 0) {
      return;
    }

    chess.undo();

    if (
      chess.history().length > 0 &&
      isPlayersTurn()
    ) {
      chess.undo();
    }

    const history = chess.history();

    timeLogRef.current =
      timeLogRef.current.slice(
        0,
        history.length + 1,
      );

    setTimeLog(timeLogRef.current);

    reviewChessRef.current = new Chess(
      chess.fen(),
    );

    setMoveHistory(history);

    setMoveIndex(
      history.length - 1,
    );

    setRollbackIndex(
      history.length,
    );

    setPositionMap(
      getPositionMap(chess.fen()),
    );

    setActiveColor(chess.turn());

    setHighlightSquares(
      getLastMoveHighlight(chess),
    );

    setSelectedSquare(null);

    setLegalMoves([]);

    setGameMessage('');

    setIsRunning(false);

    setBoardTouchable(false);
  }, [
    isPlayersTurn,
    sendCommandToStockfish,
  ]);

  /* =========================================
     MOVE HISTORY NAVIGATION
  ========================================= */

  const browseTo = useCallback((index) => {
    const history =
      chessRef.current.history();

    const clampedIndex = Math.max(
      -1,
      Math.min(
        index,
        history.length - 1,
      ),
    );

    const review = new Chess();

    for (
      let i = 0;
      i <= clampedIndex;
      i += 1
    ) {
      try {
        review.move(history[i]);
      } catch (error) {
        console.warn(
          'Could not review move:',
          history[i],
          error,
        );

        break;
      }
    }

    reviewChessRef.current = review;

    setPositionMap(
      getPositionMap(review.fen()),
    );

    setActiveColor(review.turn());

    setHighlightSquares(
      getLastMoveHighlight(review),
    );

    setMoveIndex(clampedIndex);

    setRollbackIndex(
      clampedIndex + 1,
    );

    setSelectedSquare(null);

    setLegalMoves([]);

    setIsRunning(false);

    setBoardTouchable(false);

    const snapshot =
      timeLogRef.current[
        clampedIndex + 1
      ];

    if (snapshot) {
      setWhiteTime(snapshot.w);

      setBlackTime(snapshot.b);
    }
  }, []);

  const goBack = useCallback(() => {
    if (moveIndex >= 0) {
      browseTo(moveIndex - 1);
    }
  }, [
    browseTo,
    moveIndex,
  ]);

  const goForward = useCallback(() => {
    const maxIndex =
      chessRef.current.history().length - 1;

    if (moveIndex < maxIndex) {
      browseTo(moveIndex + 1);
    }
  }, [
    browseTo,
    moveIndex,
  ]);

  /* =========================================
     DRAW OFFER
  ========================================= */

  const offerDraw = useCallback(() => {
    Alert.alert(
      'Offer Draw',
      'Send a draw offer?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Offer',
          onPress: () => {
            Alert.alert(
              'Draw',
              'Draw offer noted. Stockfish does not negotiate draw offers.',
            );
          },
        },
      ],
    );
  }, []);

  /* =========================================
     RESIGN
  ========================================= */

  const resign = useCallback(() => {
    Alert.alert(
      'Resign',
      'Are you sure you want to resign?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Resign',
          style: 'destructive',
          onPress: () => {
            setIsRunning(false);

            setBoardTouchable(false);

            gameActiveRef.current = false;

            Alert.alert(
              'You resigned',
              'Bot wins.',
            );
          },
        },
      ],
    );
  }, []);

  /* =========================================
     EXIT GAME
  ========================================= */

  const exitGame = useCallback(() => {
    Alert.alert(
      'Exit game',
      'Leave this game?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: () => {
            gameActiveRef.current = false;

            navigation.goBack();
          },
        },
      ],
    );
  }, [navigation]);

  /* =========================================
     STATUS TEXT
  ========================================= */

  const statusText = !engineReady
    ? 'Starting Stockfish...'
    : gameMessage ||
      (
        botThinking
          ? 'Bot thinking...'
          : isPlayersTurn()
            ? 'Your move'
            : 'Bot to move'
      );

  /* =========================================
     UI
  ========================================= */

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.modeLabel}>
          🤖 Play vs Bot
        </Text>

        <Text style={styles.turnIndicator}>
          {statusText}
        </Text>

        <MoveHistoryPanel
          moveHistory={moveHistory}
          moveIndex={moveIndex}
          setMoveIndex={browseTo}
          setRollbackIndex={setRollbackIndex}
          setPositionMap={setPositionMap}
          setActiveColor={setActiveColor}
          getPositionMap={getPositionMap}
          game={chessRef}
          setHighlightSquares={
            setHighlightSquares
          }
        />
      </View>

      {/* Board and timers */}
      <View style={styles.centerBlock}>
        <View style={styles.botAvatarContainer}>
          <Image
            source={
              bot?.avatar ||
              require('../../assets/bK.png')
            }
            style={{
              width: 56,
              height: 56,
              resizeMode: 'contain',
            }}
          />
        </View>

        <ChessBoard
          positionMap={positionMap}
          legalMoves={legalMoves}
          highlightSquares={highlightSquares}
          orientation={orientation}
          onSquarePress={onSquarePress}
        />

        {timeControl > 0 && (
          <View style={styles.timerRow}>
            <View style={styles.whiteTimerColumn}>
              <TimerBlock
                mode="w"
                activeColor={activeColor}
                whiteTime={whiteTime}
                blackTime={blackTime}
                isRunning={
                  isRunning &&
                  activeColor === 'w'
                }
                timeControl={timeControl}
              />
            </View>

            <View style={styles.blackTimerColumn}>
              <TimerBlock
                mode="b"
                activeColor={activeColor}
                whiteTime={whiteTime}
                blackTime={blackTime}
                isRunning={
                  isRunning &&
                  activeColor === 'b'
                }
                timeControl={timeControl}
              />
            </View>
          </View>
        )}
      </View>

      {/* Main controls */}
      <View style={styles.controlRow}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() =>
            setShowOptions(
              (previous) => !previous,
            )
          }
        >
          <Text style={styles.controlText}>
            Options
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={pauseOrStart}
        >
          <Text style={styles.controlText}>
            {isRunning ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={goBack}
        >
          <Text style={styles.controlText}>
            Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={goForward}
        >
          <Text style={styles.controlText}>
            Forward
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={undoMove}
        >
          <Text style={styles.controlText}>
            Undo
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={exitGame}
        >
          <Text style={styles.controlText}>
            Exit
          </Text>
        </TouchableOpacity>
      </View>

      {/* Options panel */}
      {showOptions && (
        <View style={styles.inlineOptions}>
          <TouchableOpacity
            style={styles.optionItem}
            onPress={offerDraw}
          >
            <Text style={styles.controlText}>
              Draw
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionItem}
            onPress={resign}
          >
            <Text style={styles.controlText}>
              Resign
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}