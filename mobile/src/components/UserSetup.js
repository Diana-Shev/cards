import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { theme } from '../theme/theme';

export function UserSetup({ onCreateUser }) {
  const [username, setUsername] = useState('');

  const handleCreateUser = () => {
    if (!username.trim()) {
      Alert.alert('Ошибка', 'Введите имя пользователя');
      return;
    }

    if (username.trim().length < 2) {
      Alert.alert('Ошибка', 'Имя пользователя должно содержать минимум 2 символа');
      return;
    }

    onCreateUser(username.trim());
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Добро пожаловать!</Text>
        <Text style={styles.subtitle}>
          Введите ваше имя для начала работы с мотивационными карточками
        </Text>
        
        <TextInput
          style={styles.input}
          placeholder="Ваше имя"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="words"
          autoCorrect={false}
          maxLength={50}
        />
        
        <TouchableOpacity
          style={[styles.button, !username.trim() && styles.buttonDisabled]}
          onPress={handleCreateUser}
          disabled={!username.trim()}
        >
          <Text style={styles.buttonText}>Начать</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 300,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.placeholder,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: theme.colors.text,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.colors.disabled,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
