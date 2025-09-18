#подключает все роуты.

from fastapi import FastAPI
from routers import router
import os
from sqlalchemy.orm import Session
from database import SessionLocal
import models

app = FastAPI(title="Мотивационные карточки")

app.include_router(router)

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
