import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export function GoalCard({ goal, progress, daysRemaining, onAnswer }) {
  const [showActions, setShowActions] = useState(false);
  const [answeredToday, setAnsweredToday] = useState(false);
  
  const slideAnim = useState(new Animated.Value(0))[0];

  const toggleActions = () => {
    const toValue = showActions ? 0 : 1;
    setShowActions(!showActions);
    
    Animated.spring(slideAnim, {
      toValue,
      useNativeDriver: true,
    }).start();
  };

  const handleAnswer = (isYes) => {
    onAnswer(goal.id, isYes);
    setAnsweredToday(true);
    toggleActions();
  };

  const getProgressColor = () => {
    if (progress >= 80) return theme.colors.success;
    if (progress >= 50) return theme.colors.warning;
    return theme.colors.error;
  };

  const getDaysRemainingText = () => {
    if (daysRemaining < 0) return 'Просрочено';
    if (daysRemaining === 0) return 'Сегодня';
    if (daysRemaining === 1) return 'Завтра';
    return `${daysRemaining} дней`;
  };

  const getDaysRemainingColor = () => {
    if (daysRemaining < 0) return theme.colors.error;
    if (daysRemaining <= 3) return theme.colors.warning;
    return theme.colors.text;
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.card}
        onPress={toggleActions}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <Text style={styles.goalText} numberOfLines={2}>
            {goal.text}
          </Text>
          <MaterialIcons
            name={showActions ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
            size={24}
            color={theme.colors.placeholder}
          />
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>Прогресс: {progress}%</Text>
            <Text style={[styles.daysText, { color: getDaysRemainingColor() }]}>
              {getDaysRemainingText()}
            </Text>
          </View>
          
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${progress}%`,
                  backgroundColor: getProgressColor(),
                },
              ]}
            />
          </View>
        </View>

        <Animated.View
          style={[
            styles.actionsContainer,
            {
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 60],
                  }),
                },
              ],
              opacity: slideAnim,
            },
          ]}
        >
          <Text style={styles.actionsTitle}>Выполнили сегодня?</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.noButton]}
              onPress={() => handleAnswer(false)}
            >
              <MaterialIcons name="close" size={20} color="white" />
              <Text style={styles.actionButtonText}>Нет</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.yesButton]}
              onPress={() => handleAnswer(true)}
            >
              <MaterialIcons name="check" size={20} color="white" />
              <Text style={styles.actionButtonText}>Да</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  goalText: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
    lineHeight: 24,
    marginRight: 12,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
  },
  daysText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.disabled,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  actionsContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.disabled,
  },
  actionsTitle: {
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    justifyContent: 'center',
  },
  noButton: {
    backgroundColor: theme.colors.error,
  },
  yesButton: {
    backgroundColor: theme.colors.success,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
});
