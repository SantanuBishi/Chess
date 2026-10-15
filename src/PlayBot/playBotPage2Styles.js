import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingTop: 50,
    paddingBottom: 24,
  },

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
    textAlign: 'center',
    paddingHorizontal: 12,
  },

  moveScroll: {
    marginTop: 12,
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
    backgroundColor: '#4b4a4a',
    padding: 2,
    borderRadius: 5,
  },

  centerBlock: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },

  playerRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 4,
  },

  playerBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },

  playerIcon: {
    width: 40,
    height: 40,
    marginRight: 6,
  },

  playerLabel: {
    fontSize: 22,
    fontWeight: '500',
    color: '#eee',
    flexShrink: 1,
  },

  timerControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
  },

  controlButton: {
    backgroundColor: '#444',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginHorizontal: 4,
    marginVertical: 4,
    minWidth: 72,
    alignItems: 'center',
  },

  controlText: {
    color: '#fff',
    fontWeight: '600',
  },

  controlRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
    flexWrap: 'wrap',
    paddingHorizontal: 8,
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
});