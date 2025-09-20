import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ApiService from '../services/api';

const AppContext = createContext();

const initialState = {
  user: null,
  cards: [],
  favorites: [],
  goals: [],
  currentCardIndex: 0,
  filter: 'all', // 'all' или 'favorites'
  isLoading: false,
  error: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_USER':
      return { ...state, user: action.payload };
    
    case 'SET_CARDS':
      return { ...state, cards: action.payload };
    
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    
    case 'SET_FILTER':
      return { ...state, filter: action.payload, currentCardIndex: 0 };
    
    case 'NEXT_CARD':
      return { ...state, currentCardIndex: state.currentCardIndex + 1 };
    
    case 'ADD_FAVORITE':
      return {
        ...state,
        favorites: [...state.favorites, action.payload],
      };
    
    case 'REMOVE_FAVORITE':
      return {
        ...state,
        favorites: state.favorites.filter(fav => fav.card_id !== action.payload),
      };
    
    case 'ADD_GOAL':
      return {
        ...state,
        goals: [...state.goals, action.payload],
      };
    
    case 'ADD_ANSWER':
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.goal_id
            ? { ...goal, answers: [...(goal.answers || []), action.payload] }
            : goal
        ),
      };
    
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Загрузка данных при запуске
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Загружаем пользователя из локального хранилища
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        dispatch({ type: 'SET_USER', payload: user });
        
        // Загружаем данные пользователя
        await loadUserData(user.id);
      }
      
      // Загружаем карточки
      const cards = await ApiService.getCards();
      dispatch({ type: 'SET_CARDS', payload: cards });
      
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const loadUserData = async (userId) => {
    try {
      const [favorites, goals] = await Promise.all([
        ApiService.getFavorites(userId),
        ApiService.getGoals(userId),
      ]);
      
      dispatch({ type: 'SET_FAVORITES', payload: favorites });
      dispatch({ type: 'SET_GOALS', payload: goals });
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const createUser = async (username) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const user = await ApiService.createUser(username);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'SET_USER', payload: user });
      return user;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addToFavorites = async (cardId) => {
    if (!state.user) return;
    
    try {
      const favorite = await ApiService.addToFavorites(state.user.id, cardId);
      dispatch({ type: 'ADD_FAVORITE', payload: favorite });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const removeFromFavorites = (cardId) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: cardId });
  };

  const createGoal = async (goalData) => {
    if (!state.user) return;
    
    try {
      const goal = await ApiService.createGoal(state.user.id, goalData);
      dispatch({ type: 'ADD_GOAL', payload: goal });
      return goal;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const addAnswer = async (answerData) => {
    if (!state.user) return;
    
    try {
      const answer = await ApiService.addAnswer(state.user.id, answerData);
      dispatch({ type: 'ADD_ANSWER', payload: answer });
      return answer;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const setFilter = (filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const nextCard = () => {
    dispatch({ type: 'NEXT_CARD' });
  };

  const getFilteredCards = () => {
    if (state.filter === 'favorites') {
      const favoriteCardIds = state.favorites.map(fav => fav.card_id);
      return state.cards.filter(card => favoriteCardIds.includes(card.id));
    }
    return state.cards;
  };

  const getCurrentCard = () => {
    const filteredCards = getFilteredCards();
    if (filteredCards.length === 0) return null;
    
    const index = state.currentCardIndex % filteredCards.length;
    return filteredCards[index];
  };

  const getRandomCard = () => {
    const filteredCards = getFilteredCards();
    if (filteredCards.length === 0) return null;
    
    const randomIndex = Math.floor(Math.random() * filteredCards.length);
    return filteredCards[randomIndex];
  };

  const value = {
    ...state,
    createUser,
    addToFavorites,
    removeFromFavorites,
    createGoal,
    addAnswer,
    setFilter,
    nextCard,
    getFilteredCards,
    getCurrentCard,
    getRandomCard,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
