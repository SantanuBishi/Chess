import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Chess } from 'chess.js';
import Stockfish from '../engine/stockfish';

import ChessBoard from '../Chessboard/Chessboard';
import styles from './playBotPage2Styles';

/* ---------------- INITIAL POSITION ---------------- */

const getInitialPositionMap = () => ({
  a8: 'r', b8: 'n', c8: 'b', d8: 'q', e8: 'k', f8: 'b', g8: 'n', h8: 'r',
  a7: 'p', b7: 'p', c7: 'p', d7: 'p', e7: 'p', f7: 'p', g7: 'p', h7: 'p',
  a2: 'P', b2: 'P', c2: 'P', d2: 'P', e2: 'P', f2: 'P', g2: 'P', h2: 'P',
  a1: 'R', b1: 'N', c1: 'B', d1: 'Q', e1: 'K', f1: 'B', g1: 'N', h1: 'R',
});

/* ---------------- MAIN COMPONENT ---------------- */

export default function PlayBotPage2() {
  const route = useRoute();
  const navigation = useNavigation();

  const {
    strength = 8,      // from PlayBotPage1
    color = 'white',   // from PlayBotPage1
  } = route.params || {};

  const chessRef = useRef(new Chess());
  const engineRef = useRef(null);

  const [positionMap, setPositionMap] = useState(getInitialPositionMap());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [highlightSquares, setHighlightSquares] = useState(null);
  const [moveHistory, setMoveHistory] = useState([]);

  const playerIsWhite = color === 'white';
  const orientation = playerIsWhite ? 'white' : 'black';

  /* ---------------- INIT STOCKFISH ---------------- */

  useEffect(() => {
    engineRef.current = Stockfish();
    engineRef.current.postMessage('uci');

    engineRef.current.onmessage = (event) => {
      const msg = event.data || event;
      if (msg.startsWith('bestmove')) {
        const move = msg.split(' ')[1];
        applyBotMove(move);
      }
    };

    // bot plays first if user is black
    if (!playerIsWhite) {
      setTimeout(makeBotMove, 500);
    }

    return () => {
      engineRef.current = null;
    };
  }, []);

  /* ---------------- HELPERS ---------------- */

  const updateBoard = () => {
    const chess = chessRef.current;
    const board = {};

    chess.board().forEach((row, r) => {
      row.forEach((piece, f) => {
        if (piece) {
          const square = 'abcdefgh'[f] + (8 - r);
          board[square] =
            piece.color === 'w'
              ? piece.type.toUpperCase()
              : piece.type;
        }
      });
    });

    setPositionMap(board);
    setMoveHistory(chess.history());
  };

  const isPlayersTurn = () => {
    const chess = chessRef.current;
    return (
      (chess.turn() === 'w' && playerIsWhite) ||
      (chess.turn() === 'b' && !playerIsWhite)
    );
  };

  /* ---------------- BOT MOVE ---------------- */

  const makeBotMove = () => {
    const chess = chessRef.current;
    if (chess.isGameOver()) return;

    engineRef.current.postMessage(`position fen ${chess.fen()}`);
    engineRef.current.postMessage(`go depth ${strength}`);
  };

  const applyBotMove = (uciMove) => {
    if (!uciMove || uciMove === '(none)') return;

    chessRef.current.move({
      from: uciMove.slice(0, 2),
      to: uciMove.slice(2, 4),
      promotion: 'q',
    });

    updateBoard();
  };

  /* ---------------- USER MOVE ---------------- */

  const onSquarePress = (square) => {
    const chess = chessRef.current;
    if (!isPlayersTurn()) return;

    if (selectedSquare) {
      const move = chess.move({
        from: selectedSquare,
        to: square,
        promotion: 'q',
      });

      setSelectedSquare(null);
      setLegalMoves([]);
      setHighlightSquares(null);

      if (move) {
        updateBoard();
        setTimeout(makeBotMove, 400);
      }
    } else {
      const moves = chess.moves({ square, verbose: true });
      if (moves.length) {
        setSelectedSquare(square);
        setLegalMoves(moves);
        setHighlightSquares({ from: square });
      }
    }
  };

  /* ---------------- UNDO ---------------- */

  const undoMove = () => {
    chessRef.current.undo();
    chessRef.current.undo();
    updateBoard();
  };

  /* ---------------- UI ---------------- */

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.modeLabel}>Play vs Bot</Text>
        <Text style={styles.turnIndicator}>
          {isPlayersTurn() ? 'Your move' : 'Bot thinking...'}
        </Text>
      </View>

      <View style={styles.playerRow}>
        <Image source={require('../../assets/bK.png')} style={styles.playerIcon} />
        <Text style={styles.playerLabel}>Bot</Text>
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
        <Image source={require('../../assets/wK.png')} style={styles.playerIcon} />
        <Text style={styles.playerLabel}>You</Text>
      </View>

      <ScrollView horizontal style={styles.moveScroll}>
        {moveHistory.map((m, i) => (
          <Text key={i} style={styles.moveItem}>{m}</Text>
        ))}
      </ScrollView>

      <View style={styles.controlRow}>
        <TouchableOpacity onPress={undoMove} style={styles.controlButton}>
          <Text style={styles.controlText}>Undo</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.controlButton}>
          <Text style={styles.controlText}>Exit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
