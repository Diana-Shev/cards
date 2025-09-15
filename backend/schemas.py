#Pydantic-схемы для пользователей, целей, карточек, избранного и ответов.
#Это нужно для валидации данных, которые приходят и уходят через API.

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class UserBase(BaseModel):
    username: str = Field(..., example="diana")

class UserCreate(UserBase):
    pass

class User(UserBase):
    id: int
    class Config:
        orm_mode = True

class GoalBase(BaseModel):
    text: str = Field(..., example="Выучить английский")
    target_date: date

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        orm_mode = True

class CardBase(BaseModel):
    text: str

class CardCreate(CardBase):
    pass

class Card(CardBase):
    id: int
    class Config:
        orm_mode = True

class FavoriteBase(BaseModel):
    card_id: int

class FavoriteCreate(FavoriteBase):
    pass

class Favorite(FavoriteBase):
    id: int
    user_id: int
    created_at: datetime
    class Config:
        orm_mode = True

class AnswerBase(BaseModel):
    goal_id: int
    date: date
    is_yes: bool

class AnswerCreate(AnswerBase):
    pass

class Answer(AnswerBase):
    id: int
    user_id: int
    class Config:
        orm_mode = True
