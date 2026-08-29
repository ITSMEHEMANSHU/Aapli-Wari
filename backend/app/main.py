from fastapi import Depends, FastAPI
from backend.app.api import admin
from backend.app.api import auth
from backend.app.api import rbac_test
from backend.app.api import users
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import channels
from backend.app.api import content
from backend.app.api import search
from backend.app.api import engagement
from backend.app.api import chat
from backend.app.api import shorts
from backend.app.api import amenities
from backend.app.api import ws_tracking
from backend.app.api import admin



app = FastAPI(
    title="Aapli Wari API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(rbac_test.router)

app.include_router(channels.router)
app.include_router(content.router)
app.include_router(search.router)
app.include_router(engagement.router)
app.include_router(chat.router)
app.include_router(shorts.router)


app.include_router(amenities.router)
app.include_router(ws_tracking.router)


@app.get("/")
def root():
    return {
        "message": "Aapli Wari API is running",
    }
