#SQLAlchemy-модели (структура таблиц)

from sqlalchemy import Column, Integer, String, Date, Boolean, ForeignKey, Text, DateTime, UniqueConstraint
from sqlalchemy.orm import declarative_base, relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    # Можно добавить email, password_hash для расширения
    goals = relationship('Goal', back_populates='user')
    answers = relationship('Answer', back_populates='user')
    favorites = relationship('Favorite', back_populates='user')

class Goal(Base):
    __tablename__ = 'goals'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    text = Column(Text, nullable=False)
    target_date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', back_populates='goals')
    answers = relationship('Answer', back_populates='goal')

class Card(Base):
    __tablename__ = 'cards'
    id = Column(Integer, primary_key=True, index=True)
    text = Column(Text, nullable=False)
    # Можно добавить поле "category" или "image_url" при необходимости
    favorites = relationship('Favorite', back_populates='card')

class Favorite(Base):
    __tablename__ = 'favorites'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    card_id = Column(Integer, ForeignKey('cards.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship('User', back_populates='favorites')
    card = relationship('Card', back_populates='favorites')
    __table_args__ = (UniqueConstraint('user_id', 'card_id', name='_user_card_uc'),)

class Answer(Base):
    __tablename__ = 'answers'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    goal_id = Column(Integer, ForeignKey('goals.id'), nullable=False)
    date = Column(Date, nullable=False)
    is_yes = Column(Boolean, nullable=False)  # True = "Да", False = "Нет"
    user = relationship('User', back_populates='answers')
    goal = relationship('Goal', back_populates='answers')
    __table_args__ = (UniqueConstraint('user_id', 'goal_id', 'date', name='_user_goal_date_uc'),)
