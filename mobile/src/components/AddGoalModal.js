import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';

export function AddGoalModal({ visible, onClose, onAddGoal }) {
  const [goalText, setGoalText] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleAddGoal = () => {
    if (!goalText.trim()) {
      Alert.alert('Ошибка', 'Введите текст цели');
      return;
    }

    if (!targetDate) {
      Alert.alert('Ошибка', 'Выберите дату');
      return;
    }

    const today = new Date();
    const selectedDate = new Date(targetDate);
    
    if (selectedDate <= today) {
      Alert.alert('Ошибка', 'Дата должна быть в будущем');
      return;
    }

    onAddGoal({
      text: goalText.trim(),
      target_date: targetDate,
    });

    // Сброс формы
    setGoalText('');
    setTargetDate('');
  };

  const handleClose = () => {
    setGoalText('');
    setTargetDate('');
    onClose();
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <MaterialIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Новая цель</Text>
          
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleAddGoal}
          >
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Текст цели</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Например: Выучить английский язык"
              value={goalText}
              onChangeText={setGoalText}
              multiline
              numberOfLines={3}
              maxLength={200}
            />
            <Text style={styles.characterCount}>
              {goalText.length}/200
            </Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Целевая дата</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="Выберите дату"
              value={targetDate}
              onChangeText={setTargetDate}
              keyboardType="numeric"
            />
            <Text style={styles.helpText}>
              Введите дату в формате ГГГГ-ММ-ДД
            </Text>
          </View>

          <View style={styles.exampleContainer}>
            <Text style={styles.exampleTitle}>Примеры целей:</Text>
            <Text style={styles.exampleText}>• Выучить новый язык</Text>
            <Text style={styles.exampleText}>• Начать заниматься спортом</Text>
            <Text style={styles.exampleText}>• Прочитать 10 книг</Text>
            <Text style={styles.exampleText}>• Изучить программирование</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.disabled,
    textAlignVertical: 'top',
  },
  dateInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.disabled,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.placeholder,
    textAlign: 'right',
    marginTop: 4,
  },
  helpText: {
    fontSize: 12,
    color: theme.colors.placeholder,
    marginTop: 4,
  },
  exampleContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  exampleTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: theme.colors.placeholder,
    marginBottom: 4,
  },
});
