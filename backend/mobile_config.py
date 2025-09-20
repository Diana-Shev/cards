# Конфигурация для мобильного приложения

# Настройки CORS для мобильного приложения
MOBILE_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8081",  # Expo dev server
    "http://127.0.0.1:8081",
    "exp://192.168.1.100:8081",  # Замените на ваш IP
    "exp://localhost:8081",
]

# Настройки для мобильного приложения
MOBILE_SETTINGS = {
    "max_cards_per_request": 50,
    "max_goals_per_user": 20,
    "max_favorites_per_user": 100,
    "card_text_max_length": 500,
    "goal_text_max_length": 200,
}

# Дополнительные заголовки для мобильного приложения
MOBILE_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "3600",
}
