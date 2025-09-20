const API_BASE_URL = 'http://localhost:8000'; // Замените на ваш URL бэкенда

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Пользователи
  async createUser(username) {
    return this.request('/users/', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async getUsers() {
    return this.request('/users/');
  }

  // Цели
  async createGoal(userId, goalData) {
    return this.request(`/goals/?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(goalData),
    });
  }

  async getGoals(userId) {
    return this.request(`/goals/?user_id=${userId}`);
  }

  // Карточки
  async getCards(skip = 0, limit = 30) {
    return this.request(`/cards/?skip=${skip}&limit=${limit}`);
  }

  // Избранное
  async addToFavorites(userId, cardId) {
    return this.request(`/favorites/?user_id=${userId}&card_id=${cardId}`, {
      method: 'POST',
    });
  }

  async getFavorites(userId) {
    return this.request(`/favorites/?user_id=${userId}`);
  }

  // Ответы
  async addAnswer(userId, answerData) {
    return this.request(`/answers/?user_id=${userId}`, {
      method: 'POST',
      body: JSON.stringify(answerData),
    });
  }

  async getAnswers(userId, goalId) {
    return this.request(`/answers/?user_id=${userId}&goal_id=${goalId}`);
  }
}

export default new ApiService();
