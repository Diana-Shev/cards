import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useApp } from '../context/AppContext';
import { GoalCard } from '../components/GoalCard';
import { AddGoalModal } from '../components/AddGoalModal';
import { theme } from '../theme/theme';

export default function GoalsScreen({ navigation }) {
  const {
    user,
    goals,
    isLoading,
    error,
    createGoal,
    addAnswer,
  } = useApp();

  const [showAddGoal, setShowAddGoal] = useState(false);

  const handleAddGoal = async (goalData) => {
    try {
      await createGoal(goalData);
      setShowAddGoal(false);
      Alert.alert('Успех', 'Цель добавлена!');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить цель');
    }
  };

  const handleAnswer = async (goalId, isYes) => {
    try {
      await addAnswer({
        goal_id: goalId,
        date: new Date().toISOString().split('T')[0],
        is_yes: isYes,
      });
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось сохранить ответ');
    }
  };

  const getProgressPercentage = (goal) => {
    if (!goal.answers || goal.answers.length === 0) return 0;
    
    const yesAnswers = goal.answers.filter(answer => answer.is_yes).length;
    const totalAnswers = goal.answers.length;
    
    return Math.round((yesAnswers / totalAnswers) * 100);
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Ошибка: {error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Мои цели</Text>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddGoal(true)}
        >
          <MaterialIcons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {goals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="flag" size={64} color={theme.colors.placeholder} />
            <Text style={styles.emptyTitle}>Нет целей</Text>
            <Text style={styles.emptySubtitle}>
              Добавьте свою первую цель для отслеживания прогресса
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => setShowAddGoal(true)}
            >
              <Text style={styles.emptyButtonText}>Добавить цель</Text>
            </TouchableOpacity>
          </View>
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              progress={getProgressPercentage(goal)}
              daysRemaining={getDaysRemaining(goal.target_date)}
              onAnswer={handleAnswer}
            />
          ))
        )}
      </ScrollView>

      <AddGoalModal
        visible={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onAddGoal={handleAddGoal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: theme.colors.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.disabled,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
  },
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  emptyButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
