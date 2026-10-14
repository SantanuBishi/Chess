import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';

import { useRoute, useNavigation } from '@react-navigation/native';
import { Chess } from 'chess.js';
import { useStockfish } from '@udaychauhan/react-native-stockfish';

import ChessBoard from '../Chessboard/Chessboard';
import styles from './playBotPage2Styles';

/* ---------------- INITIAL POSITION ---------------- */

const getInitialPositionMap = () => ({
  a8: 'r', b8: 'n', c8: 'b', d8: 'q',
  e8: 'k', f8: 'b', g8: 'n', h8: 'r',

  a7: 'p', b7: 'p', c7: 'p', d7: 'p',
  e7: 'p', f7: 'p', g7: 'p', h7: 'p',

  a2: 'P', b2: 'P', c2: 'P', d2: 'P',
  e2: 'P', f2: 'P', g2: 'P', h2: 'P',

  a1: 'R', b1: 'N', c1: 'B', d1: 'Q',
  e1: 'K', f1: 'B', g1: 'N', h1: 'R',
});

/* ---------------- MAIN COMPONENT ---------------- */

export default function PlayBotPage2() {
  const route = useRoute();
  const navigation = useNavigation();

  const {
    strength = 8,
    color = 'white',
  } = route.params || {};

  const chessRef = useRef(new Chess());

  const engineReadyRef = useRef(false);
  const engineRunningRef = useRef(false);
  const botThinkingRef = useRef(false);
  const gameActiveRef = useRef(true);

  const outputBufferRef = useRef('');
  const pendingBotMoveRef = useRef(false);
  const makeBotMoveRef = useRef(null);
  const applyBotMoveRef = useRef(null);

  const [positionMap, setPositionMap] = useState(
    getInitialPositionMap(),
  );

  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [highlightSquares, setHighlightSquares] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);
  const [engineReady, setEngineReady] = useState(false);
  const [botThinking, setBotThinking] = useState(false);
  const [gameMessage, setGameMessage] = useState('');

  const playerIsWhite = color === 'white';
  const orientation = playerIsWhite ? 'white' : 'black';

  /* ---------------- BOARD HELPERS ---------------- */

  const updateBoard = useCallback(() => {
    const chess = chessRef.current;
    const board = {};

    chess.board().forEach((row, rowIndex) => {
      row.forEach((piece, fileIndex) => {
        if (piece) {
          const square =
            'abcdefgh'[fileIndex] + (8 - rowIndex);

          board[square] =
            piece.color === 'w'
              ? piece.type.toUpperCase()
              : piece.type;
        }
      });
    });

    setPositionMap(board);
    setMoveHistory(chess.history());

    if (chess.isCheckmate()) {
      setGameMessage(
        chess.turn() === (playerIsWhite ? 'w' : 'b')
          ? 'Checkmate! Bot wins.'
          : 'Checkmate! You win!',
      );
    } else if (chess.isDraw()) {
      setGameMessage('Game drawn.');
    } else if (chess.isCheck()) {
      setGameMessage('Check!');
    } else {
      setGameMessage('');
    }
  }, [playerIsWhite]);

  const isPlayersTurn = useCallback(() => {
    const chess = chessRef.current;

    return (
      (chess.turn() === 'w' && playerIsWhite) ||
      (chess.turn() === 'b' && !playerIsWhite)
    );
  }, [playerIsWhite]);

  /* ---------------- STOCKFISH COMMANDS ---------------- */

  const {
    stockfishLoop,
    stopStockfish,
    sendCommandToStockfish,
  } = useStockfish({
    onOutput: useCallback((output) => {
      if (!gameActiveRef.current) {
        return;
      }

      outputBufferRef.current += String(output);

      const lines = outputBufferRef.current.split(/\r?\n/);

      outputBufferRef.current = lines.pop() || '';

      for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
          continue;
        }

        if (line === 'uciok') {
          sendCommandToStockfish('isready');
          continue;
        }

        if (line === 'readyok') {
          engineReadyRef.current = true;
          setEngineReady(true);

          if (!playerIsWhite) {
            setTimeout(() => {
              makeBotMoveRef.current?.();
            }, 200);
          }

          continue;
        }

        if (line.startsWith('bestmove')) {
          const move = line.split(/\s+/)[1];

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

          continue;
        }
      }
    }, [playerIsWhite, sendCommandToStockfish]),

    onError: useCallback((error) => {
      console.warn('Stockfish error:', error);
    }, []),
  });

  /* ---------------- ENGINE START / STOP ---------------- */

  useEffect(() => {
    gameActiveRef.current = true;
    engineRunningRef.current = true;
    engineReadyRef.current = false;
    pendingBotMoveRef.current = false;
    botThinkingRef.current = false;
    outputBufferRef.current = '';

    stockfishLoop();

    const startupTimer = setTimeout(() => {
      if (gameActiveRef.current) {
        sendCommandToStockfish('uci');
      }
    }, 500);

    return () => {
      gameActiveRef.current = false;
      engineRunningRef.current = false;

      clearTimeout(startupTimer);
      stopStockfish();
    };
  }, [
    stockfishLoop,
    stopStockfish,
    sendCommandToStockfish,
  ]);

  /* ---------------- BOT MOVE ---------------- */

  const makeBotMove = useCallback(() => {
    const chess = chessRef.current;

    if (
      !gameActiveRef.current ||
      !engineReadyRef.current ||
      !engineRunningRef.current ||
      pendingBotMoveRef.current ||
      chess.isGameOver()
    ) {
      return;
    }

    if (isPlayersTurn()) {
      return;
    }

    pendingBotMoveRef.current = true;
    botThinkingRef.current = true;
    setBotThinking(true);

    sendCommandToStockfish(`position fen ${chess.fen()}`);

    const safeStrength = Math.max(
      1,
      Math.min(20, Number(strength) || 8),
    );

    sendCommandToStockfish(`go depth ${safeStrength}`);
  }, [
    isPlayersTurn,
    sendCommandToStockfish,
    strength,
  ]);

  makeBotMoveRef.current = makeBotMove;

  const applyBotMove = useCallback((uciMove) => {
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
        console.warn('Stockfish returned an illegal move:', uciMove);
        return;
      }

      updateBoard();
    } catch (error) {
      console.warn('Could not apply Stockfish move:', error);
    }
  }, [updateBoard]);

  applyBotMoveRef.current = applyBotMove;

  /* ---------------- USER MOVE ---------------- */

  const onSquarePress = useCallback((square) => {
    const chess = chessRef.current;

    if (
      !gameActiveRef.current ||
      !engineReadyRef.current ||
      !isPlayersTurn() ||
      botThinkingRef.current ||
      chess.isGameOver()
    ) {
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
      setHighlightSquares(null);

      if (move) {
        updateBoard();

        setTimeout(() => {
          makeBotMoveRef.current?.();
        }, 200);
      } else {
        const moves = chess.moves({
          square,
          verbose: true,
        });

        if (moves.length) {
          setSelectedSquare(square);
          setLegalMoves(moves);
          setHighlightSquares({ from: square });
        }
      }

      return;
    }

    const moves = chess.moves({
      square,
      verbose: true,
    });

    if (moves.length) {
      setSelectedSquare(square);
      setLegalMoves(moves);
      setHighlightSquares({ from: square });
    }
  }, [
    isPlayersTurn,
    selectedSquare,
    updateBoard,
  ]);

  /* ---------------- UNDO ---------------- */

  const undoMove = useCallback(() => {
    const chess = chessRef.current;

    if (!gameActiveRef.current) {
      return;
    }

    // Stop any current engine search.
    if (pendingBotMoveRef.current && engineReadyRef.current) {
      sendCommandToStockfish('stop');
      pendingBotMoveRef.current = false;
      botThinkingRef.current = false;
      setBotThinking(false);
    }

    // Undo the bot's move and the player's move.
    if (chess.history().length > 0) {
      chess.undo();
    }

    if (chess.history().length > 0) {
      chess.undo();
    }

    setSelectedSquare(null);
    setLegalMoves([]);
    setHighlightSquares(null);

    updateBoard();

    if (
      engineReadyRef.current &&
      !chess.isGameOver() &&
      !isPlayersTurn()
    ) {
      setTimeout(() => {
        makeBotMoveRef.current?.();
      }, 200);
    }
  }, [
    isPlayersTurn,
    sendCommandToStockfish,
    updateBoard,
  ]);

  /* ---------------- EXIT ---------------- */

  const exitGame = useCallback(() => {
    gameActiveRef.current = false;
    navigation.goBack();
  }, [navigation]);

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.modeLabel}>Play vs Bot</Text>

        <Text style={styles.turnIndicator}>
          {!engineReady
            ? 'Starting Stockfish...'
            : gameMessage ||
              (botThinking
                ? 'Bot thinking...'
                : isPlayersTurn()
                  ? 'Your move'
                  : 'Bot thinking...')}
        </Text>
      </View>

      <View style={styles.playerRow}>
        <Image
          source={require('../../assets/bK.png')}
          style={styles.playerIcon}
        />

        <Text style={styles.playerLabel}>Bot (Stockfish)</Text>
      </View>

      <View style={styles.centerBlock}>
        <ChessBoard
          positionMap={positionMap}
          legalMoves={legalMoves}
          highlightSquares={highlightSquares}
          orientation={orientation}
          onSquarePress={onSquarePress}
        />
      </View>

      <View style={styles.playerRow}>
        <Image
          source={require('../../assets/wK.png')}
          style={styles.playerIcon}
        />

        <Text style={styles.playerLabel}>You</Text>
      </View>

      <ScrollView
        horizontal
        style={styles.moveScroll}
        contentContainerStyle={{ alignItems: 'center' }}
      >
        {moveHistory.map((move, index) => (
          <Text key={`${index}-${move}`} style={styles.moveItem}>
            {move}
          </Text>
        ))}
      </ScrollView>

      <View style={styles.controlRow}>
        <TouchableOpacity
          onPress={undoMove}
          style={styles.controlButton}
        >
          <Text style={styles.controlText}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={exitGame}
          style={styles.controlButton}
        >
          <Text style={styles.controlText}>Exit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}