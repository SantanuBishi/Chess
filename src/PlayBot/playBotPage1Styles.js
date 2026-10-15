import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#121212',
  },

  headingBlock: {
    marginTop: 20,
    marginBottom: 12,
    backgroundColor: '#121212',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },

  // Bot preview
  botPreview: {
    backgroundColor: '#1E1E1E',
    padding: 10,
    borderRadius: 12,
    minHeight: 120,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 12,
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },

  rating: {
    fontSize: 16,
    color: '#CCCCCC',
    marginRight: 8,
  },

  flag: {
    fontSize: 14,
    color: '#AAAAAA',
  },

  speech: {
    fontSize: 14,
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginTop: 12,
    textAlign: 'left',
    height: 40,
    overflow: 'hidden',
  },

  // Bot selection
  scrollArea: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: 12,
  },

  categoryBlock: {
    marginVertical: 20,
  },

  categoryTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#FFFFFF',
    fontSize: 20,
  },

  botRow: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  alignItems: 'flex-start',
},

  botCard: {
  width: '22%',
  alignItems: 'center',
  justifyContent: 'center',
  marginHorizontal: '1.5%',
  marginTop: 16,
  paddingVertical: 6,
  borderWidth: 2,
  borderColor: 'transparent',
  borderRadius: 10,
},

  selectedBotCard: {
    borderWidth: 2,
    borderColor: '#81B64C',
    borderRadius: 10,
    backgroundColor: '#1F2A18',
    transform: [{ scale: 1.05 }],
  },

  botThumb: {
    width: 64,
    height: 64,
    borderRadius: 24,
  },

  botName: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 3,
  },

  // Configuration panel
  configPanel: {
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },

  // Settings and colours side-by-side
  settingsColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  settingsHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  alignSelf: 'flex-start',
  minHeight: 50,
  paddingVertical: 8,
  paddingHorizontal: 10,
  backgroundColor: '#2A2A2A',
  borderWidth: 1,
  borderColor: '#444444',
  borderRadius: 10,
},

settingsHeaderText: {
  flexDirection: 'column',
  alignItems: 'flex-start',
  marginRight: 8,
},

  configTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },

  settingsSubtitle: {
    color: '#AAAAAA',
    fontSize: 10,
    marginTop: 4,
  },

  expandIcon: {
    color: '#FFFFFF',
    fontSize: 12,
    marginLeft: 4,
  },

  // Expanded settings
  settingsContent: {
    marginTop: 0,
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#202020',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },

  sectionTitle: {
    color: '#AAAAAA',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 10,
  },

  // Time control
  timeOptionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  timeTile: {
    flex: 1,
    minHeight: 62,
    marginHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#3A3A3A',
    borderRadius: 9,
  },

  selectedTimeTile: {
    backgroundColor: '#1F2A18',
    borderColor: '#81B64C',
  },

  timeNumber: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: 'bold',
  },

  timeLabel: {
    color: '#AAAAAA',
    fontSize: 11,
    marginTop: 2,
  },

  selectedTimeText: {
    color: '#FFFFFF',
  },

  // Game options
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  optionRow: {
    width: '48%',
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  toggleLabel: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
    marginRight: 4,
  },

  // Colour selection
  colorSelectorInline: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexShrink: 0,
  marginLeft: 6,
  gap: 15,
},  

  colorButton: {
  width: 49,
  height: 49,
  alignItems: 'center',
  justifyContent: 'center',
  borderWidth: 2,
  borderColor: 'transparent',
  borderRadius: 5,
},

selectedColor: {
  borderColor: '#81B64C',
  backgroundColor: '#1F2A18',
},

  colorIcon: {
    width: 43,
    height: 43,
    resizeMode: 'contain',
  },

  // Play button
  playButton: {
    backgroundColor: '#81B64C',
    width: '100%',
    minHeight: 48,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabledButton: {
    backgroundColor: '#555555',
    opacity: 0.7,
  },

  playText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default styles;