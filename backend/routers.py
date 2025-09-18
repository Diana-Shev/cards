# основные роуты (эндпоинты) для пользователей, целей, карточек, избранного и ответов. 
#Все адреса API (например, /users/, /goals/, /cards/ и т.д.).


from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from crud, models, schemas
from database import SessionLocal
from typing import List

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# USERS
@router.post("/users/", response_model=schemas.User)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Пользователь уже существует")
    return crud.create_user(db=db, user=user)

# GOALS
@router.post("/goals/", response_model=schemas.Goal)
def create_goal(goal: schemas.GoalCreate, user_id: int, db: Session = Depends(get_db)):
    return crud.create_goal(db=db, goal=goal, user_id=user_id)

@router.get("/goals/", response_model=List[schemas.Goal])
def get_goals(user_id: int, db: Session = Depends(get_db)):
    return crud.get_goals(db=db, user_id=user_id)

# CARDS
@router.get("/cards/", response_model=List[schemas.Card])
def get_cards(skip: int = 0, limit: int = 30, db: Session = Depends(get_db)):
    return crud.get_cards(db=db, skip=skip, limit=limit)

# FAVORITES
@router.post("/favorites/", response_model=schemas.Favorite)
def add_favorite(user_id: int, card_id: int, db: Session = Depends(get_db)):
    return crud.add_favorite(db=db, user_id=user_id, card_id=card_id)

@router.get("/favorites/", response_model=List[schemas.Favorite])
def get_favorites(user_id: int, db: Session = Depends(get_db)):
    return crud.get_favorites(db=db, user_id=user_id)

# ANSWERS
@router.post("/answers/", response_model=schemas.Answer)
def add_answer(user_id: int, answer: schemas.AnswerCreate, db: Session = Depends(get_db)):
    return crud.add_answer(db=db, user_id=user_id, answer=answer)

@router.get("/answers/", response_model=List[schemas.Answer])
def get_answers(user_id: int, goal_id: int, db: Session = Depends(get_db)):
    return crud.get_answers(db=db, user_id=user_id, goal_id=goal_id)
