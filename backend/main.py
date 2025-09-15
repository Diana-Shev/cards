#подключает все роуты.

from fastapi import FastAPI
from .routers import router

app = FastAPI(title="Мотивационные карточки")

app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Добро пожаловать в мотивационные карточки!"}