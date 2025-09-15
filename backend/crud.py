#функции для работы с базой: создание, получение, добавление в избранное, ответы и т.д.
#Это логика, которая будет вызываться из роутов.

from sqlalchemy.orm import Session
from . import models, schemas
from datetime import date, datetime

# USERS

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    db_user = models.User(username=user.username)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# GOALS

def create_goal(db: Session, goal: schemas.GoalCreate, user_id: int):
    db_goal = models.Goal(**goal.dict(), user_id=user_id)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

def get_goals(db: Session, user_id: int):
    return db.query(models.Goal).filter(models.Goal.user_id == user_id).all()

# CARDS

def get_cards(db: Session, skip: int = 0, limit: int = 30):
    return db.query(models.Card).offset(skip).limit(limit).all()

def create_card(db: Session, card: schemas.CardCreate):
    db_card = models.Card(**card.dict())
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    return db_card

# FAVORITES

def add_favorite(db: Session, user_id: int, card_id: int):
    db_fav = models.Favorite(user_id=user_id, card_id=card_id)
    db.add(db_fav)
    db.commit()
    db.refresh(db_fav)
    return db_fav

def get_favorites(db: Session, user_id: int):
    return db.query(models.Favorite).filter(models.Favorite.user_id == user_id).all()

# ANSWERS

def add_answer(db: Session, user_id: int, answer: schemas.AnswerCreate):
    db_answer = models.Answer(user_id=user_id, **answer.dict())
    db.add(db_answer)
    db.commit()
    db.refresh(db_answer)
    return db_answer

def get_answers(db: Session, user_id: int, goal_id: int):
    return db.query(models.Answer).filter(models.Answer.user_id == user_id, models.Answer.goal_id == goal_id).all()
