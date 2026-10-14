import Stockfish from 'stockfish';

const engine = Stockfish();

engine.onmessage = (event) => {
  console.log('SF:', event.data);
};

engine.postMessage('uci');

export function getBestMove(fen, depth = 10, callback) {
  engine.postMessage('position fen ' + fen);
  engine.postMessage('go depth ' + depth);

  engine.onmessage = (event) => {
    const msg = event.data || event;
    if (msg.startsWith('bestmove')) {
      callback(msg.split(' ')[1]);
    }
  };
}
