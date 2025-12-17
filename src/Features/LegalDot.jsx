import React from 'react';
import { View, StyleSheet } from 'react-native';

export default function LegalDot({
  legalMoves,
  squareSize,
  getSquarePosition, // 🔥 RECEIVE FROM ChessBoard
}) {
  if (!legalMoves || !legalMoves.length) return null;

  return (
    <>
      {legalMoves.map((moveObj) => {
        const square = moveObj.to;
        const isCapture =
          moveObj.flags.includes('c') || moveObj.flags.includes('e');

        const position = getSquarePosition(square); // ✅ orientation-safe

        const style = isCapture
          ? {
              ...styles.hollowLegal,
              width: squareSize,
              height: squareSize,
              borderRadius: squareSize / 2,
              top: position.top,
              left: position.left,
            }
          : {
              ...styles.highlightLegal,
              top: position.top + (squareSize - 20) / 2,
              left: position.left + (squareSize - 20) / 2,
            };

        return <View key={`highlight-${moveObj.from}-${moveObj.to}-${moveObj.promotion || 'none'}`} style={style} />;
      })}
    </>
  );
}

const styles = StyleSheet.create({
  highlightLegal: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    width: 20,
    height: 20,
    borderRadius: 50,
    zIndex: 10,
  },
  hollowLegal: {
    position: 'absolute',
    borderWidth: 4,
    borderColor: 'rgba(0, 0, 0, 0.15)',
    backgroundColor: 'transparent',
    zIndex: 10,
  },
});
