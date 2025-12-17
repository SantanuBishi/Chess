// src/components/Board/ChessBoard.jsx

import React from 'react';
import { View, Image, TouchableOpacity, Dimensions } from 'react-native';
import LegalDot from '../Features/LegalDot';
import LastMoveHighlight from '../Features/HighlightMove';
import styles from './ChessboardStyles';

const boardSize = Dimensions.get('window').width;
const squareSize = boardSize / 8;

const pieceMap = {
  K: require('../../assets/wK.png'),
  Q: require('../../assets/wQ.png'),
  R: require('../../assets/wR.png'),
  B: require('../../assets/wB.png'),
  N: require('../../assets/wN.png'),
  P: require('../../assets/wP.png'),
  k: require('../../assets/bK.png'),
  q: require('../../assets/bQ.png'),
  r: require('../../assets/bR.png'),
  b: require('../../assets/bB.png'),
  n: require('../../assets/bN.png'),
  p: require('../../assets/bP.png'),
};

const files = ['a','b','c','d','e','f','g','h'];
const ranks = [1,2,3,4,5,6,7,8];

export default function ChessBoard({
  positionMap,
  legalMoves,
  highlightSquares,
  onSquarePress,
  orientation = 'white', // default safe
}) {
  const isWhite = orientation === 'white';

  const displayFiles = isWhite ? files : [...files].reverse();
  const displayRanks = isWhite ? [...ranks].reverse() : ranks;

  const allSquares = [];
  displayRanks.forEach((r) => {
    displayFiles.forEach((f) => {
      allSquares.push(`${f}${r}`);
    });
  });

  const getSquarePosition = (square) => {
    const file = square[0];
    const rank = parseInt(square[1], 10);

    const row = displayRanks.indexOf(rank);
    const col = displayFiles.indexOf(file);

    return {
      top: row * squareSize,
      left: col * squareSize,
    };
  };

  return (
    <View style={[styles.boardWrapper, { width: boardSize, height: boardSize }]}>
      
      {/* BOARD IMAGE (ROTATES ONLY FOR BLACK) */}
      <Image
        source={require('../../assets/Chessboard.png')}
        style={[
          styles.board,
          {
            width: boardSize,
            height: boardSize,
            transform: orientation === 'black' ? [{ rotate: '180deg' }] : [],
          },
        ]}
        pointerEvents="box-none"
      />

      {/* PIECES */}
      {Object.entries(positionMap).map(([square, piece]) => (
        <Image
          key={square}
          source={pieceMap[piece]}
          style={[
            styles.piece,
            {
              width: squareSize,
              height: squareSize,
              ...getSquarePosition(square),
            },
          ]}
        />
      ))}

      {/* LAST MOVE HIGHLIGHT */}
      <LastMoveHighlight
        squares={[highlightSquares?.from, highlightSquares?.to]}
        squareSize={squareSize}
        getSquarePosition={getSquarePosition}
      />

      {/* LEGAL MOVES */}
      <LegalDot
        legalMoves={legalMoves}
        squareSize={squareSize}
        getSquarePosition={getSquarePosition}
      />

      {/* TOUCHABLE SQUARES */}
      {allSquares.map((square) => (
        <TouchableOpacity
          key={`touch-${square}`}
          style={[
            styles.square,
            {
              width: squareSize,
              height: squareSize,
              ...getSquarePosition(square),
            },
          ]}
          onPress={() => onSquarePress(square)}
        />
      ))}
    </View>
  );
}
