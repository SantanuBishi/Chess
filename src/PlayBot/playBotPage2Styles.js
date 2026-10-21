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
alignItems: 'flex-start',
justifyContent: 'center',
marginVertical: 50
},

// Bot avatar aligned to the left
botAvatarContainer: {
width: '100%',
alignItems: 'flex-start',
paddingHorizontal: 15,
marginBottom: 10,
},

botAvatar: {
width: 56,
height: 56,
resizeMode: 'contain',
},

// Timers placed near opposite screen edges with comfortable margins
timerRow: {
width: '100%',
flexDirection: 'row',
justifyContent: 'space-Between',
alignItems: 'center',
marginTop: 8,
marginBottom: 8,
paddingHorizontal: 24,
},

whiteTimerColumn: {
alignItems: 'flex-start',
},

blackTimerColumn: {
alignItems: 'flex-end',
marginLeft: 'auto',
},


timerControls: {
flexDirection: 'row',
justifyContent: 'space-between',
marginTop: 12,
},

controlButton: {
backgroundColor: '#444',
paddingHorizontal: 12,
paddingVertical: 8,
borderRadius: 6,
marginHorizontal: 6,
marginVertical: 6,
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
