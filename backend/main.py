#подключает все роуты.

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import router
import os
from sqlalchemy.orm import Session
from database import SessionLocal
import models

app = FastAPI(title="Мотивационные карточки")

# Добавляем CORS для работы с frontend и мобильным приложением
from mobile_config import MOBILE_CORS_ORIGINS

app.add_middleware(
    CORSMiddleware,
    allow_origins=MOBILE_CORS_ORIGINS,  # Разрешаем локальный frontend и мобильное приложение
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(router)

# Добавляем обработчик для OPTIONS запросов
@app.options("/{path:path}")
async def options_handler(path: str):
    return {"message": "OK"}

@app.on_event("startup")
def load_cards_on_startup():
    from docx import Document
    db: Session = SessionLocal()
    try:
        cards_count = db.query(models.Card).count()
        if cards_count == 0 and os.path.exists("cards.docx"):
            doc = Document("cards.docx")
            for para in doc.paragraphs:
                text = para.text.strip()
                if text:
                    card = models.Card(text=text)
                    db.add(card)
            db.commit()
            print(f"Загружено {db.query(models.Card).count()} карточек из cards.docx")
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в мотивационные карточки!"}
