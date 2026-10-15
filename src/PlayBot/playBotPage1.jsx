import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';

import WhiteIcon from '../../assets/white.svg';
import BlackIcon from '../../assets/black.svg';
import RandomIcon from '../../assets/random.svg';

import styles from './playBotPage1Styles';
import { allBots, botsByCategory } from '../PlayBot/bots/index';

const TIME_OPTIONS = [5, 10, 15, 20];

const GAME_OPTIONS = [
  { key: 'Hints', label: 'Hints' },
  { key: 'Takebacks', label: 'Takebacks' },
  { key: 'Analysis', label: 'Analysis' },
  { key: 'Threats', label: 'Threats' },
  { key: 'BotChat', label: 'Bot Chat' },
  { key: 'Timer', label: 'Timer' },
  { key: 'Arrow', label: 'Best Move Arrow' },
  { key: 'MoveHighlights', label: 'Move Highlights' },
  { key: 'Dots', label: 'Legal Move Dots' },
];

export default function PlayBotPage1() {
  const navigation = useNavigation();

  const [selectedBotId, setSelectedBotId] = useState(
    allBots[0]?.id || null
  );

  const [settingsExpanded, setSettingsExpanded] = useState(false);

  // Time displayed in minutes
  const [selectedTime, setSelectedTime] = useState(10);

  const [customConfig, setCustomConfig] = useState({
    Hints: true,
    Takebacks: true,
    Analysis: false,
    Threats: false,
    BotChat: false,
    Timer: true,
    Arrow: false,
    MoveHighlights: true,
    Dots: true,
  });

  const [selectedColor, setSelectedColor] = useState('white');

  const [engineStrength] = useState(10);

  const selectedBot = allBots.find(
    (bot) => bot.id === selectedBotId
  );

  const toggleOption = (key, value) => {
    setCustomConfig((previousConfig) => ({
      ...previousConfig,
      [key]: value,
    }));
  };

  const renderColorIcon = (color) => {
  const iconProps = {
    width: 43,
    height: 43,
  };

  if (color === 'white') {
    return <WhiteIcon {...iconProps} />;
  }

  if (color === 'black') {
    return <BlackIcon {...iconProps} />;
  }

  return <RandomIcon {...iconProps} />;
};

  const handlePlay = () => {
    if (!selectedBot) {
      return;
    }

    const finalColor =
      selectedColor === 'random'
        ? Math.random() < 0.5
          ? 'white'
          : 'black'
        : selectedColor;

    // Convert selected minutes to seconds.
    // Example: 10 minutes = 600 seconds.
    const timeInSeconds = customConfig.Timer
      ? selectedTime * 60
      : 0;

    navigation.navigate('playBotPage2', {
      bot: selectedBot,
      color: finalColor,
      config: customConfig,
      strength: engineStrength,
      timeControl: timeInSeconds,
      startTimer: customConfig.Timer,
    });
  };

  return (
    <View style={styles.container}>
      {/* Heading */}
      <View style={styles.headingBlock}>
        <Text style={styles.heading}>Play with Bot</Text>
      </View>

      {/* Selected bot preview */}
      {selectedBot && (
        <View style={styles.botPreview}>
          <View style={styles.topRow}>
            <Image
              source={selectedBot.avatar}
              style={styles.avatar}
            />

            <View style={styles.infoRow}>
              <Text style={styles.name}>
                {selectedBot.name}
              </Text>

              <Text style={styles.rating}>
                Rating: {selectedBot.rating}
              </Text>

              <Text style={styles.flag}>
                Flag: {selectedBot.flag}
              </Text>
            </View>
          </View>

          {selectedBot.speech ? (
            <Text
              style={styles.speech}
              numberOfLines={2}
            >
              “{selectedBot.speech}”
            </Text>
          ) : null}
        </View>
      )}

      {/* Bot selection */}
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {botsByCategory.map((category) => (
          <View
            key={category.title}
            style={styles.categoryBlock}
          >
            <Text style={styles.categoryTitle}>
              {category.title}
            </Text>

            <View style={styles.botRow}>
              {category.bots.map((bot) => (
                <TouchableOpacity
                  key={bot.id}
                  activeOpacity={0.8}
                  style={[
                    styles.botCard,
                    selectedBotId === bot.id &&
                      styles.selectedBotCard,
                  ]}
                  onPress={() => setSelectedBotId(bot.id)}
                >
                  <Image
                    source={bot.avatar}
                    style={styles.botThumb}
                  />

                  <Text
                    style={styles.botName}
                    numberOfLines={1}
                  >
                    {bot.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Configuration panel */}
      <View style={styles.configPanel}>
        {/* Game Settings and colour selection side-by-side */}
        <View style={styles.settingsColorRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.settingsHeader}
            onPress={() =>
              setSettingsExpanded((previous) => !previous)
            }
          >
            <View style={styles.settingsHeaderText}>
              <Text style={styles.configTitle}>
                Options
              </Text>

              
            </View>

            <Text style={styles.expandIcon}>
              {settingsExpanded ? '▲' : '▼'}
            </Text>
          </TouchableOpacity>

          {/* Colour selector */}
          <View style={styles.colorSelectorInline}>
            {['white', 'random', 'black'].map((color) => (
              <TouchableOpacity
                key={color}
                activeOpacity={0.8}
                style={[
                  styles.colorButton,
                  selectedColor === color &&
                    styles.selectedColor,
                ]}
                onPress={() => setSelectedColor(color)}
              >
                {renderColorIcon(color)}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Expandable settings */}
        {settingsExpanded && (
          <View style={styles.settingsContent}>
            <Text style={styles.sectionTitle}>
              TIME CONTROL
            </Text>

            {/* Time selection */}
            <View style={styles.timeOptionsRow}>
              {TIME_OPTIONS.map((minutes) => {
                const isSelected = selectedTime === minutes;

                return (
                  <TouchableOpacity
                    key={minutes}
                    activeOpacity={0.8}
                    style={[
                      styles.timeTile,
                      isSelected && styles.selectedTimeTile,
                    ]}
                    onPress={() => setSelectedTime(minutes)}
                  >
                    <Text
                      style={[
                        styles.timeNumber,
                        isSelected && styles.selectedTimeText,
                      ]}
                    >
                      {minutes}
                    </Text>

                    <Text
                      style={[
                        styles.timeLabel,
                        isSelected && styles.selectedTimeText,
                      ]}
                    >
                      min
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Game options */}
            <Text style={styles.sectionTitle}>
              GAME OPTIONS
            </Text>

            <View style={styles.optionsGrid}>
              {GAME_OPTIONS.map((option) => (
                <View
                  key={option.key}
                  style={styles.optionRow}
                >
                  <Text style={styles.toggleLabel}>
                    {option.label}
                  </Text>

                  <Switch
                    value={customConfig[option.key]}
                    onValueChange={(value) =>
                      toggleOption(option.key, value)
                    }
                    trackColor={{
                      false: '#3A3A3A',
                      true: '#81B64C',
                    }}
                    thumbColor="#FFFFFF"
                    ios_backgroundColor="#3A3A3A"
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Play button */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.playButton,
            !selectedBot && styles.disabledButton,
          ]}
          disabled={!selectedBot}
          onPress={handlePlay}
        >
          <Text style={styles.playText}>
            {selectedBot ? 'Play Bot' : 'Select a Bot'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}