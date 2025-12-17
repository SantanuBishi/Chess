import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Chess } from 'chess.js';

import ChessBoard from '../Chessboard/Chessboard';
import { MoveHistoryPanel } from '../Features';
import styles from './playBotPage2Styles';

/* ================= UTIL ================= */
const getPositionMap = (fen) => {
  const rows = fen.split(' ')[0].split('/');
  const files = 'abcdefgh';
  const position = {};

  rows.forEach((row, rIdx) => {
    let cIdx = 0;
    for (const char of row) {
      if (isNaN(char)) {
        position[`${files[cIdx]}${8 - rIdx}`] = char;
        cIdx++;
      } else {
        cIdx += parseInt(char, 10);
      }
    }
  });

  return position;
};

export default function PlayBotPage2() {
  const navigation = useNavigation();
  const route = useRoute();

 const {
  bot,
  color,
  mode,          // 👈 ADD THIS
  timeControl = 0,
  config = {},
} = route.params;

console.log('Bot mode selected:', mode);


  /* ================= GAME CORE ================= */
  const game = useRef(new Chess());

  const playerColor = color === 'white' ? 'w' : 'b';
  const botColor = playerColor === 'w' ? 'b' : 'w';

  /* ================= STATE ================= */
  const [positionMap, setPositionMap] = useState(
    getPositionMap(game.current.fen())
  );
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [highlightSquares, setHighlightSquares] = useState(null);

  const [moveHistory, setMoveHistory] = useState([]);
  const [moveIndex, setMoveIndex] = useState(-1);
  const [rollbackIndex, setRollbackIndex] = useState(0);

  const [activeColor, setActiveColor] = useState('w');
  const [isBoardTouchable, setBoardTouchable] = useState(true);

  /* ================= PLAYER ROW (FIXED POSITIONS) ================= */
  // 🔒 Player ALWAYS bottom, Bot ALWAYS top
  const topPlayerName = bot?.name;
  const bottomPlayerName = 'You';

  const topIcon =
    color === 'white'
      ? require('../../assets/bK.png') // bot = black
      : require('../../assets/wK.png'); // bot = white

  const bottomIcon =
    color === 'white'
      ? require('../../assets/wK.png') // you = white
      : require('../../assets/bK.png'); // you = black

  /* ================= BOT FIRST MOVE (IF PLAYER BLACK) ================= */
  useEffect(() => {
    if (playerColor === 'b') {
      setTimeout(makeBotMove, 600);
    }
  }, []);

  /* ================= USER MOVE ================= */
  const handleSquareClick = (square) => {
    if (!isBoardTouchable || activeColor !== playerColor) return;

    if (!selectedSquare) {
      const moves = game.current.moves({ square, verbose: true });
      if (moves.length) {
        setSelectedSquare(square);
        setLegalMoves(moves);
      }
      return;
    }

    const isLegal = legalMoves.some((m) => m.to === square);
    if (!isLegal) {
      setSelectedSquare(null);
      setLegalMoves([]);
      return;
    }

    const move = game.current.move({
      from: selectedSquare,
      to: square,
      promotion: 'q',
    });

    if (move) {
      afterMove(move);
      setTimeout(makeBotMove, 600);
    }
  };

  /* ================= AFTER MOVE ================= */
  const afterMove = (move) => {
    setSelectedSquare(null);
    setLegalMoves([]);
    setPositionMap(getPositionMap(game.current.fen()));

    setMoveHistory((prev) => [...prev.slice(0, rollbackIndex), move.san]);
    setMoveIndex(rollbackIndex);
    setRollbackIndex(rollbackIndex + 1);

    setActiveColor(game.current.turn());

    setHighlightSquares({
      from: move.from,
      to: move.to,
      capture: move.flags.includes('c') ? move.to : null,
    });
  };

  /* ================= BOT MOVE (DUMMY) ================= */
  const makeBotMove = () => {
    if (game.current.turn() !== botColor) return;

    const moves = game.current.moves({ verbose: true });
    if (!moves.length) return;

    const move = moves[Math.floor(Math.random() * moves.length)];
    game.current.move(move);
    afterMove(move);
  };

  /* ================= UI ================= */
  return (
    <View style={styles.container}>
      {/* HEADER */}
     <View style={styles.header}>
  <View style={styles.headingRow}>
    <Image
      source={require('../../assets/Bot.png')}
      style={styles.headingIcon}
    />
    <Text style={styles.modeLabel}>Play vs Bot</Text>
  </View>
        

        <MoveHistoryPanel
          moveHistory={moveHistory}
          moveIndex={moveIndex}
          setMoveIndex={setMoveIndex}
          setRollbackIndex={setRollbackIndex}
          setPositionMap={setPositionMap}
          setActiveColor={setActiveColor}
          game={game}
          setHighlightSquares={setHighlightSquares}
          getPositionMap={getPositionMap}
        />
      </View>

      {/* BOARD + PLAYERS */}
      <View style={styles.centerBlock}>
        {/* TOP = BOT (FIXED) */}
        <View style={styles.playerRow}>
          <View style={styles.playerBlock}>
            <Image source={topIcon} style={styles.playerIcon} />
            <Text style={styles.playerLabel}>{topPlayerName}</Text>
          </View>
        </View>

        {/* CHESSBOARD */}
        <ChessBoard
          positionMap={positionMap}
          legalMoves={legalMoves}
          highlightSquares={highlightSquares}
          onSquarePress={handleSquareClick}
          orientation={color} // 🔥 ONLY board rotates
        />

        {/* BOTTOM = YOU (FIXED) */}
        <View style={styles.playerRow}>
          <View style={styles.playerBlock}>
            <Image source={bottomIcon} style={styles.playerIcon} />
            <Text style={styles.playerLabel}>{bottomPlayerName}</Text>
          </View>
        </View>

        {/* CONTROLS */}
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.controlText}>Exit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => {
              game.current.reset();
              setPositionMap(getPositionMap(game.current.fen()));
              setMoveHistory([]);
              setMoveIndex(-1);
              setRollbackIndex(0);
              setActiveColor('w');
            }}
          >
            <Text style={styles.controlText}>Restart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
