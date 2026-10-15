// src/components/Board/ChessBoard.jsx

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';

import LegalDot from '../Features/LegalDot';
import LastMoveHighlight from '../Features/HighlightMove';
import styles from './ChessboardStyles';

const boardSize = Dimensions.get('window').width;
const squareSize = boardSize / 8;
const MOVE_DURATION = 160;

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

const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ranks = [1, 2, 3, 4, 5, 6, 7, 8];

export default function ChessBoard({
  positionMap = {},
  legalMoves = [],
  highlightSquares,
  onSquarePress,
  orientation = 'white',
}) {
  const isWhite = orientation === 'white';

  const displayFiles = isWhite ? files : [...files].reverse();
  const displayRanks = isWhite ? [...ranks].reverse() : ranks;

  const animatedPiecesRef = useRef({});
  const previousPositionRef = useRef(positionMap);
  const initializedRef = useRef(false);

  const [, forceUpdate] = useState(0);

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

  const allSquares = [];

  displayRanks.forEach((rank) => {
    displayFiles.forEach((file) => {
      allSquares.push(`${file}${rank}`);
    });
  });

  /*
   * Each piece gets its own animated position.
   * On the first render, pieces appear in their starting squares.
   */
  if (!initializedRef.current) {
    Object.entries(positionMap).forEach(([square, piece]) => {
      const position = getSquarePosition(square);

      animatedPiecesRef.current[square] = {
        piece,
        square,
        left: new Animated.Value(position.left),
        top: new Animated.Value(position.top),
        opacity: new Animated.Value(1),
      };
    });

    previousPositionRef.current = positionMap;
    initializedRef.current = true;
  }

  useEffect(() => {
    const previousPosition = previousPositionRef.current;
    const nextPosition = positionMap;

    const previousEntries = Object.entries(previousPosition);
    const nextEntries = Object.entries(nextPosition);

    const nextPieces = {};
    const claimedPreviousSquares = new Set();

    /*
     * Match pieces that remain on the same square first.
     */
    nextEntries.forEach(([square, piece]) => {
      const existing = animatedPiecesRef.current[square];

      if (existing && existing.piece === piece) {
        nextPieces[square] = {
          ...existing,
          square,
        };

        claimedPreviousSquares.add(square);
      }
    });

    /*
     * Identify pieces that moved from one square to another.
     * The piece type is used to match the old and new positions.
     */
    const unmatchedPrevious = previousEntries
      .filter(([square]) => !claimedPreviousSquares.has(square))
      .map(([square, piece]) => ({
        square,
        piece,
        animated: animatedPiecesRef.current[square],
      }));

    const unmatchedNext = nextEntries.filter(
      ([square]) => !nextPieces[square],
    );

    const usedPreviousSquares = new Set();

    unmatchedNext.forEach(([toSquare, piece]) => {
      const fromIndex = unmatchedPrevious.findIndex(
        (candidate) =>
          !usedPreviousSquares.has(candidate.square) &&
          candidate.piece === piece &&
          candidate.animated,
      );

      if (fromIndex === -1) {
        /*
         * A genuinely new piece, such as a promoted piece,
         * starts at its destination.
         */
        const destination = getSquarePosition(toSquare);

        nextPieces[toSquare] = {
          piece,
          square: toSquare,
          left: new Animated.Value(destination.left),
          top: new Animated.Value(destination.top),
          opacity: new Animated.Value(1),
        };

        return;
      }

      const previous = unmatchedPrevious[fromIndex];
      usedPreviousSquares.add(previous.square);

      const animated = previous.animated;
      const destination = getSquarePosition(toSquare);

      /*
       * Reuse the existing animated values so the piece moves
       * instead of disappearing and reappearing.
       */
      nextPieces[toSquare] = {
        ...animated,
        piece,
        square: toSquare,
      };

      Animated.parallel([
        Animated.timing(animated.left, {
          toValue: destination.left,
          duration: MOVE_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(animated.top, {
          toValue: destination.top,
          duration: MOVE_DURATION,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]).start();
    });

    animatedPiecesRef.current = nextPieces;
    previousPositionRef.current = nextPosition;

    forceUpdate((value) => value + 1);
  }, [positionMap, orientation]);

  return (
    <View
      style={[
        styles.boardWrapper,
        {
          width: boardSize,
          height: boardSize,
        },
      ]}
    >
      {/* BOARD IMAGE */}
      <Image
        source={require('../../assets/Chessboard.png')}
        style={[
          styles.board,
          {
            width: boardSize,
            height: boardSize,
            transform:
              orientation === 'black'
                ? [{ rotate: '180deg' }]
                : [],
          },
        ]}
        pointerEvents="none"
      />

      {/* ANIMATED PIECES */}
      {Object.entries(animatedPiecesRef.current).map(
        ([square, animatedPiece]) => (
          <Animated.View
            key={`${animatedPiece.piece}-${square}`}
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: squareSize,
              height: squareSize,
              left: animatedPiece.left,
              top: animatedPiece.top,
              opacity: animatedPiece.opacity,
              zIndex: 5,
            }}
          >
            <Image
              source={pieceMap[animatedPiece.piece]}
              style={{
                width: squareSize,
                height: squareSize,
                resizeMode: 'contain',
              }}
            />
          </Animated.View>
        ),
      )}

      {/* LAST MOVE HIGHLIGHT */}
      <LastMoveHighlight
        squares={[
          highlightSquares?.from,
          highlightSquares?.to,
        ]}
        squareSize={squareSize}
        getSquarePosition={getSquarePosition}
      />

      {/* LEGAL MOVE DOTS */}
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