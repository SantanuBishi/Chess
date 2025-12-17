import { StyleSheet, Dimensions } from 'react-native';

const boardSize = Dimensions.get('window').width;

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingBottom: 80,
  },

  /* ================= HEADER ================= */

  header: {
    width: '100%',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modeLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },

  turnIndicator: {
    fontSize: 16,
    color: '#ccc',
    marginTop: 4,
  },

  /* ================= MOVE HISTORY ================= */

  moveScroll: {
    marginTop: 40,
    maxHeight: 30,
    width: '100%',
  },

  moveScrollContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  moveItem: {
    marginRight: 12,
    fontSize: 14,
    color: '#ccc',
    backgroundColor: '#4b4a4aff',
    padding: 4,
    borderRadius: 5,
  },

  /* ================= BOARD ================= */

  centerBlock: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    transform: [{ translateY: -boardSize / 2 }],
    zIndex: 1,
  },

  /* ================= PLAYER ROW ================= */

  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 4,
  },

  playerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  playerIcon: {
    width: 40,
    height: 40,
    marginRight: 6,
  },

  playerLabel: {
    fontSize: 25,
    fontWeight: '500',
    color: '#eee',
  },

  /* ================= TIMER / CONTROLS ================= */

  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },

  controlButton: {
    backgroundColor: '#444',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 8,
    minWidth: 80,
    alignItems: 'center',
  },

  controlText: {
    color: '#fff',
    fontWeight: '600',
  },

  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 90,
    flexWrap: 'wrap',
  },

  inlineOptions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },

  optionItem: {
    backgroundColor: '#333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginHorizontal: 6,
  },

  headingRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
},

headingIcon: {
  width: 28,
  height: 28,
  resizeMode: 'contain',
},

});