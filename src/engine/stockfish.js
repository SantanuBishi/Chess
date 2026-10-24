import { useCallback, useEffect, useRef, useState } from 'react';
import { useStockfish } from '@udaychauhan/react-native-stockfish';

/**
 * Shared Stockfish lifecycle/UCI manager.
 *
 * Handles:
 * - Engine startup and cleanup
 * - UCI initialization
 * - Ready state
 * - Best move responses
 * - Engine errors
 *
 * Screens provide callbacks for engine events.
 *
 * IMPORTANT:
 * Keep one manager mounted per active engine session.
 * Multiple simultaneous consumers will need shared engine
 * ownership and a request queue.
 */
export function useStockfishManager({
  onReady,
  onBestMove,
  onError,
} = {}) {
  const callbacksRef = useRef({
    onReady,
    onBestMove,
    onError,
  });

  callbacksRef.current = {
    onReady,
    onBestMove,
    onError,
  };

  const engineReadyRef = useRef(false);
  const engineRunningRef = useRef(false);
  const outputBufferRef = useRef('');
  const startupTimerRef = useRef(null);
  const handleOutputRef = useRef(null);

  const [engineReady, setEngineReady] = useState(false);

  const {
    stockfishLoop,
    stopStockfish,
    sendCommandToStockfish,
  } = useStockfish({
    onOutput: useCallback((output) => {
      handleOutputRef.current?.(output);
    }, []),

    onError: useCallback((error) => {
      callbacksRef.current.onError?.(error);
    }, []),
  });

  /*
   * Process Stockfish UCI output.
   */
  handleOutputRef.current = (output) => {
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
      } else if (line === 'readyok') {
        engineReadyRef.current = true;

        setEngineReady(true);

        callbacksRef.current.onReady?.();
      } else if (line.startsWith('bestmove')) {
        const move = line.split(/\s+/)[1];

        callbacksRef.current.onBestMove?.(move);
      }
    }
  };

  /*
   * Start and stop Stockfish with the screen lifecycle.
   */
  useEffect(() => {
    let active = true;

    engineReadyRef.current = false;
    engineRunningRef.current = true;

    setEngineReady(false);

    outputBufferRef.current = '';

    stockfishLoop();

    startupTimerRef.current = setTimeout(() => {
      if (active) {
        sendCommandToStockfish('uci');
      }
    }, 500);

    return () => {
      active = false;

      engineReadyRef.current = false;
      engineRunningRef.current = false;

      clearTimeout(startupTimerRef.current);

      stopStockfish();
    };
  }, [
    stockfishLoop,
    stopStockfish,
    sendCommandToStockfish,
  ]);

  return {
    engineReady,
    engineReadyRef,
    engineRunningRef,
    sendCommandToStockfish,
  };
}

export default useStockfishManager;