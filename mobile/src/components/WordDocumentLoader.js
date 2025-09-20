import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { theme } from '../theme/theme';
import WordParser from '../services/wordParser';

export function WordDocumentLoader({ visible, onClose, onCardsLoaded }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCards, setLoadedCards] = useState([]);
  const [documentName, setDocumentName] = useState('');

  const handleLoadDocument = async () => {
    try {
      setIsLoading(true);
      setLoadedCards([]);
      setDocumentName('');

      const result = await WordParser.loadAndParseDocument();
      
      if (result.success) {
        setLoadedCards(result.cards);
        setDocumentName(result.documentName);
        
        Alert.alert(
          'Успех',
          `Загружено ${result.count} карточек из документа "${result.documentName}"`,
          [
            {
              text: 'Отмена',
              style: 'cancel',
            },
            {
              text: 'Загрузить',
              onPress: () => {
                onCardsLoaded(result.cards);
                handleClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Ошибка', result.error || 'Не удалось загрузить документ');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Произошла ошибка при загрузке документа');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setLoadedCards([]);
    setDocumentName('');
    onClose();
  };

  const handleLoadCards = () => {
    if (loadedCards.length > 0) {
      onCardsLoaded(loadedCards);
      handleClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleClose}
          >
            <MaterialIcons name="close" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Загрузка карточек</Text>
          
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.instructionContainer}>
            <MaterialIcons name="info" size={24} color={theme.colors.primary} />
            <Text style={styles.instructionText}>
              Выберите Word-документ с мотивационными карточками. Карточки должны быть разделены пустыми строками.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.loadButton}
            onPress={handleLoadDocument}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <MaterialIcons name="upload-file" size={24} color="white" />
                <Text style={styles.loadButtonText}>Выбрать документ</Text>
              </>
            )}
          </TouchableOpacity>

          {documentName && (
            <View style={styles.documentInfo}>
              <Text style={styles.documentName}>{documentName}</Text>
              <Text style={styles.cardCount}>
                Найдено карточек: {loadedCards.length}
              </Text>
            </View>
          )}

          {loadedCards.length > 0 && (
            <View style={styles.previewContainer}>
              <Text style={styles.previewTitle}>Предварительный просмотр:</Text>
              <ScrollView style={styles.previewScroll}>
                {loadedCards.slice(0, 5).map((card, index) => (
                  <View key={index} style={styles.previewCard}>
                    <Text style={styles.previewText} numberOfLines={3}>
                      {card.text}
                    </Text>
                  </View>
                ))}
                {loadedCards.length > 5 && (
                  <Text style={styles.moreText}>
                    ... и еще {loadedCards.length - 5} карточек
                  </Text>
                )}
              </ScrollView>
              
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleLoadCards}
              >
                <Text style={styles.confirmButtonText}>Загрузить карточки</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: 12,
    lineHeight: 20,
  },
  loadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 24,
  },
  loadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  documentInfo: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 4,
  },
  cardCount: {
    fontSize: 14,
    color: theme.colors.placeholder,
  },
  previewContainer: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: 12,
  },
  previewScroll: {
    flex: 1,
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: theme.colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
  },
  moreText: {
    fontSize: 14,
    color: theme.colors.placeholder,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  confirmButton: {
    backgroundColor: theme.colors.success,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});
