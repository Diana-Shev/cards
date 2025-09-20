import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { Card } from '../components/Card';
import { FilterBar } from '../components/FilterBar';
import { UserSetup } from '../components/UserSetup';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { WordDocumentLoader } from '../components/WordDocumentLoader';
import { theme } from '../theme/theme';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function MainScreen({ navigation }) {
  const {
    user,
    cards,
    favorites,
    filter,
    isLoading,
    error,
    createUser,
    addToFavorites,
    setFilter,
    getRandomCard,
    getFilteredCards,
  } = useApp();

  const [currentCard, setCurrentCard] = useState(null);
  const [showUserSetup, setShowUserSetup] = useState(false);
  const [showWordLoader, setShowWordLoader] = useState(false);

  useEffect(() => {
    if (!user) {
      setShowUserSetup(true);
    } else {
      setShowUserSetup(false);
      loadRandomCard();
    }
  }, [user, filter]);

  const loadRandomCard = () => {
    const card = getRandomCard();
    setCurrentCard(card);
  };

  const handleSwipeRight = async () => {
    if (!currentCard || !user) return;
    
    try {
      // Добавляем в избранное (пользователь воспользовался советом)
      await addToFavorites(currentCard.id);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Показываем следующую карточку
      loadRandomCard();
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить в избранное');
    }
  };

  const handleSwipeLeft = async () => {
    if (!currentCard) return;
    
    try {
      // Карточка не понравилась - просто показываем следующую
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      loadRandomCard();
    } catch (error) {
      console.error('Error handling swipe left:', error);
    }
  };

  const handleStarPress = async () => {
    if (!currentCard || !user) return;
    
    try {
      await addToFavorites(currentCard.id);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Успех', 'Карточка добавлена в избранное!');
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось добавить в избранное');
    }
  };

  const handleUserCreate = async (username) => {
    try {
      await createUser(username);
      setShowUserSetup(false);
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось создать пользователя');
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  const handleGoalsPress = () => {
    navigation.navigate('Goals');
  };

  const handleLoadWordDocument = () => {
    setShowWordLoader(true);
  };

  const handleCardsLoaded = (cards) => {
    // Здесь можно добавить логику для сохранения карточек
    console.log('Loaded cards:', cards);
    Alert.alert('Успех', `Загружено ${cards.length} карточек`);
  };

  if (showUserSetup) {
    return (
      <SafeAreaView style={styles.container}>
        <UserSetup onCreateUser={handleUserCreate} />
      </SafeAreaView>
    );
  }

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
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => window.location.reload()}
          >
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const filteredCards = getFilteredCards();
  if (filteredCards.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <FilterBar filter={filter} onFilterChange={handleFilterChange} />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {filter === 'favorites' 
              ? 'Нет избранных карточек' 
              : 'Нет доступных карточек'
            }
          </Text>
        </View>
        <FloatingActionButton onPress={handleGoalsPress} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      
      <FilterBar filter={filter} onFilterChange={handleFilterChange} />
      
      <View style={styles.cardContainer}>
        {currentCard && (
          <Card
            card={currentCard}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onStarPress={handleStarPress}
            isFavorite={favorites.some(fav => fav.card_id === currentCard.id)}
          />
        )}
      </View>
      
      <FloatingActionButton onPress={handleGoalsPress} />
      
      <WordDocumentLoader
        visible={showWordLoader}
        onClose={() => setShowWordLoader(false)}
        onCardsLoaded={handleCardsLoaded}
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
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    color: theme.colors.text,
    textAlign: 'center',
  },
});
