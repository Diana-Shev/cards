import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// Настройка базового URL для API
const API_BASE_URL = 'http://38.244.179.25:8000';
axios.defaults.baseURL = API_BASE_URL;

function App() {
  const [currentView, setCurrentView] = useState('cards');
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all' или 'favorites'
  const [goals, setGoals] = useState([]);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [user, setUser] = useState(null);

  // Загрузка данных при старте
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      // Создаем пользователя (если не существует)
      const userResponse = await axios.post('/users/', { username: 'diana' });
      setUser(userResponse.data);

      // Загружаем карточки
      const cardsResponse = await axios.get('/cards/');
      setCards(cardsResponse.data);

      // Загружаем цели пользователя
      const goalsResponse = await axios.get(`/goals/?user_id=${userResponse.data.id}`);
      setGoals(goalsResponse.data);
      if (goalsResponse.data.length > 0) {
        setCurrentGoal(goalsResponse.data[0]);
      }

      // Загружаем избранное
      const favoritesResponse = await axios.get(`/favorites/?user_id=${userResponse.data.id}`);
      setFavorites(favoritesResponse.data);

      // Загружаем ответы
      if (goalsResponse.data.length > 0) {
        const answersResponse = await axios.get(`/answers/?user_id=${userResponse.data.id}&goal_id=${goalsResponse.data[0].id}`);
        setAnswers(answersResponse.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  const handleSwipe = (direction) => {
    const currentCard = getCurrentCard();
    if (!currentCard) return;

    if (direction === 'right') {
      // Добавляем в избранное
      addToFavorites(currentCard.id);
    }

    // Переходим к следующей карточке
    setCurrentCardIndex(prev => prev + 1);
  };

  const addToFavorites = async (cardId) => {
    try {
      await axios.post('/favorites/', null, {
        params: { user_id: user.id, card_id: cardId }
      });
      // Обновляем список избранного
      const favoritesResponse = await axios.get(`/favorites/?user_id=${user.id}`);
      setFavorites(favoritesResponse.data);
    } catch (error) {
      console.error('Ошибка добавления в избранное:', error);
    }
  };

  const getCurrentCard = () => {
    const filteredCards = filter === 'favorites' 
      ? cards.filter(card => favorites.some(fav => fav.card_id === card.id))
      : cards;
    
    return filteredCards[currentCardIndex] || null;
  };

  const createGoal = async (goalData) => {
    try {
      const response = await axios.post('/goals/', goalData, {
        params: { user_id: user.id }
      });
      setGoals(prev => [...prev, response.data]);
      setCurrentGoal(response.data);
      setCurrentView('cards');
    } catch (error) {
      console.error('Ошибка создания цели:', error);
    }
  };

  const answerDailyQuestion = async (isYes) => {
    if (!currentGoal) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      await axios.post('/answers/', {
        goal_id: currentGoal.id,
        date: today,
        is_yes: isYes
      }, {
        params: { user_id: user.id }
      });

      // Обновляем ответы
      const answersResponse = await axios.get(`/answers/?user_id=${user.id}&goal_id=${currentGoal.id}`);
      setAnswers(answersResponse.data);
    } catch (error) {
      console.error('Ошибка сохранения ответа:', error);
    }
  };

  const getProgress = () => {
    if (!currentGoal || answers.length === 0) return 0;
    const yesAnswers = answers.filter(answer => answer.is_yes).length;
    return Math.round((yesAnswers / answers.length) * 100);
  };

  const resetCards = () => {
    setCurrentCardIndex(0);
  };

  const currentCard = getCurrentCard();
  const progress = getProgress();

  return (
    <div className="container">
      <div className="header">
        <h1>🎯 Мотивационные карточки</h1>
      </div>

      <div className="navigation">
        <button 
          className={`nav-btn ${currentView === 'cards' ? 'active' : ''}`}
          onClick={() => setCurrentView('cards')}
        >
          Карточки
        </button>
        <button 
          className={`nav-btn ${currentView === 'goal' ? 'active' : ''}`}
          onClick={() => setCurrentView('goal')}
        >
          Цель
        </button>
        <button 
          className={`nav-btn ${currentView === 'question' ? 'active' : ''}`}
          onClick={() => setCurrentView('question')}
        >
          Вопрос дня
        </button>
      </div>

      {currentView === 'cards' && (
        <div>
          <div className="filters">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Все карточки
            </button>
            <button 
              className={`filter-btn ${filter === 'favorites' ? 'active' : ''}`}
              onClick={() => setFilter('favorites')}
            >
              Избранное
            </button>
          </div>

          {currentCard ? (
            <div>
              <div className="card">
                {currentCard.text}
              </div>
              
              <div className="buttons">
                <button 
                  className="btn btn-skip"
                  onClick={() => handleSwipe('left')}
                >
                  Пропустить
                </button>
                <button 
                  className="btn btn-favorite"
                  onClick={() => handleSwipe('right')}
                >
                  ⭐ В избранное
                </button>
              </div>

              <div style={{ textAlign: 'center', color: 'white', marginTop: '20px' }}>
                {currentCardIndex + 1} из {filter === 'favorites' ? favorites.length : cards.length}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>Карточки закончились!</h3>
              <p>Нажмите кнопку ниже, чтобы начать заново</p>
              <button className="btn btn-like" onClick={resetCards}>
                Начать заново
              </button>
            </div>
          )}
        </div>
      )}

      {currentView === 'goal' && (
        <div>
          {currentGoal ? (
            <div>
              <div className="goal-form">
                <h3>Ваша цель:</h3>
                <p>{currentGoal.text}</p>
                <p><strong>Дата достижения:</strong> {new Date(currentGoal.target_date).toLocaleDateString('ru-RU')}</p>
                
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p>Прогресс: {progress}%</p>
              </div>
            </div>
          ) : (
            <GoalForm onCreateGoal={createGoal} />
          )}
        </div>
      )}

      {currentView === 'question' && currentGoal && (
        <div className="daily-question">
          <h3>Ежедневный вопрос</h3>
          <p>Ты сегодня продвинулся к цели "{currentGoal.text}"?</p>
          
          <div className="question-buttons">
            <button 
              className="btn btn-yes"
              onClick={() => answerDailyQuestion(true)}
            >
              Да ✅
            </button>
            <button 
              className="btn btn-no"
              onClick={() => answerDailyQuestion(false)}
            >
              Нет ❌
            </button>
          </div>

          <div className="progress-bar" style={{ marginTop: '20px' }}>
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p>Прогресс: {progress}%</p>
        </div>
      )}
    </div>
  );
}

function GoalForm({ onCreateGoal }) {
  const [text, setText] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (text && targetDate) {
      onCreateGoal({ text, target_date: targetDate });
    }
  };

  return (
    <div className="goal-form">
      <h3>Постановка цели</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Текст цели:</label>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Например: Выучить английский язык"
            required
          />
        </div>
        
        <div className="form-group">
          <label>Дата достижения:</label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" className="btn btn-like">
          Создать цель
        </button>
      </form>
    </div>
  );
}

export default App;
