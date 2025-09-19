import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://38.244.179.25:8000';
axios.defaults.baseURL = API_BASE_URL;

function App() {
  const [currentView, setCurrentView] = useState('cards');
  const [cards, setCards] = useState([]);
  const [cardQueue, setCardQueue] = useState([]); // очередь карточек для показа
  const [currentCard, setCurrentCard] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [filter, setFilter] = useState('all');
  const [goals, setGoals] = useState([]); // eslint-disable-line no-unused-vars
  const [currentGoal, setCurrentGoal] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных при старте
  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (filter === 'all') {
      // При смене фильтра или загрузке карточек формируем новую очередь
      if (cards.length > 0) {
        setCardQueue(shuffle([...cards]));
      }
    } else {
      const favCards = cards.filter(card => favorites.some(fav => fav.card_id === card.id));
      setCardQueue(shuffle([...favCards]));
    }
  }, [cards, filter, favorites]);

  useEffect(() => {
    // Показываем первую карточку из очереди
    if (cardQueue.length > 0) {
      setCurrentCard(cardQueue[0]);
    } else {
      setCurrentCard(null);
    }
  }, [cardQueue]);

  const loadInitialData = async () => {
    try {
      let user;
      try {
        const userResponse = await axios.post('/users/', { username: 'diana' });
        user = userResponse.data;
      } catch (error) {
        if (error.response?.status === 400) {
          const existingUser = await axios.get('/users/');
          user = existingUser.data.find(u => u.username === 'diana') || existingUser.data[0];
        } else {
          throw error;
        }
      }
      setUser(user);
      const cardsResponse = await axios.get('/cards/');
      setCards(cardsResponse.data);
      const goalsResponse = await axios.get(`/goals/?user_id=${user.id}`);
      setGoals(goalsResponse.data);
      if (goalsResponse.data.length > 0) {
        setCurrentGoal(goalsResponse.data[0]);
      }
      const favoritesResponse = await axios.get(`/favorites/?user_id=${user.id}`);
      setFavorites(favoritesResponse.data);
      if (goalsResponse.data.length > 0) {
        const answersResponse = await axios.get(`/answers/?user_id=${user.id}&goal_id=${goalsResponse.data[0].id}`);
        setAnswers(answersResponse.data);
      }
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
      console.error('Детали ошибки:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  function shuffle(array) {
    // Фишер-Йетс для перемешивания
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const handleSwipe = (direction) => {
    if (!currentCard) return;
    if (direction === 'right') {
      addToFavorites(currentCard.id);
      // Добавляем понравившуюся карточку в очередь ещё раз (будет появляться чаще)
      setCardQueue(prev => shuffle([...prev.slice(1), currentCard]));
    } else {
      // Просто убираем текущую карточку
      setCardQueue(prev => prev.slice(1));
    }
  };

  const addToFavorites = async (cardId) => {
    try {
      await axios.post('/favorites/', null, {
        params: { user_id: user.id, card_id: cardId }
      });
      const favoritesResponse = await axios.get(`/favorites/?user_id=${user.id}`);
      setFavorites(favoritesResponse.data);
    } catch (error) {
      console.error('Ошибка добавления в избранное:', error);
    }
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
      const answersResponse = await axios.get(`/answers/?user_id=${user.id}&goal_id=${currentGoal.id}`);
      setAnswers(answersResponse.data);
    } catch (error) {
      console.error('Ошибка сохранения ответа:', error);
    }
  };

  // Прогресс-бар: процент = (кол-во дней с ответом Да) / (все дни между созданием и датой цели)
  const getProgress = () => {
    if (!currentGoal) return 0;
    const createdAt = new Date(currentGoal.created_at);
    const targetDate = new Date(currentGoal.target_date);
    const today = new Date();
    // Считаем только дни до сегодняшнего дня или до targetDate (что меньше)
    const lastDay = today < targetDate ? today : targetDate;
    const totalDays = Math.ceil((lastDay - createdAt) / (1000 * 60 * 60 * 24)) + 1;
    if (totalDays <= 0) return 0;
    const yesAnswers = answers.filter(answer => answer.is_yes).length;
    return Math.min(100, Math.round((yesAnswers / totalDays) * 100));
  };

  const progress = getProgress();

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1>🎯 Мотивационные карточки</h1>
        </div>
        <div style={{ textAlign: 'center', color: 'white', padding: '40px' }}>
          <h3>Загрузка...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1>🎯 Мотивационные карточки</h1>
        {currentGoal && (
          <div style={{ color: 'white', marginTop: 10, fontWeight: 'bold' }}>
            Цель: {currentGoal.text} (до {new Date(currentGoal.target_date).toLocaleDateString('ru-RU')})
          </div>
        )}
      </div>
      <div className="progress-bar" style={{ marginTop: 10 }}>
        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
      </div>
      <div style={{ color: 'white', textAlign: 'right', fontWeight: 'bold', marginBottom: 10 }}>
        Прогресс: {progress}%
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
                Осталось: {cardQueue.length}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>Карточки закончились!</h3>
              <p>Нажмите кнопку ниже, чтобы начать заново</p>
              <button className="btn btn-like" onClick={() => setCardQueue(shuffle([...cards]))}>
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
