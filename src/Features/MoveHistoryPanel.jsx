// src/components/Features/HighlightMove.jsx

import React from 'react';
import { View } from 'react-native';

export default function HighlightMove({
  squares = [],
  squareSize,
  getSquarePosition,
}) {
  if (!squares || squares.length === 0) return null;

  return (
    <>
      {squares.map(
        (sq) =>
          sq && (
            <View
              key={sq}
              style={{
                position: 'absolute',
                width: squareSize,
                height: squareSize,
                backgroundColor: 'rgba(255,255,0,0.3)',
                ...getSquarePosition(sq),
                zIndex: 3,
              }}
            />
          )
      )}
    </>
  );
}
