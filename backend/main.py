# [Task]: T-001, T-016
# [From]: speckit.plan §2.2, §3.1

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db import create_db_and_tables
from auth import AuthMiddleware
from routes import tasks as tasks_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="Hackathon Todo API", lifespan=lifespan)

_raw = os.environ.get("ALLOWED_ORIGINS", "http://localhost:3000")
allowed_origins = [o.strip() for o in _raw.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)

app.include_router(tasks_router.router, prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}
