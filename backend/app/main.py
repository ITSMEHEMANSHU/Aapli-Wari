from fastapi import Depends, FastAPI
https://github.com/ITSMEHEMANSHU/Aapli-Wari/pull/5/conflict?name=backend%252Fapp%252Fmain.py&ancestor_oid=c49e7da5702e8b87f07de1a06330bbcc3e333667&base_oid=94529bb26bcae5b358e2585e63b1b124dabcddd3&head_oid=4745dcd25d453b18f0647b8e50c572360d0eee65
from backend.app.api import admin
from backend.app.api import auth
from backend.app.api import rbac_test
from backend.app.api import users
from backend.app.core.security import authorize_request
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api import channels
from backend.app.api import content
from backend.app.api import search
from backend.app.api import engagement
from backend.app.api import chat
from backend.app.api import shorts


from backend.app.api import amenities



app = FastAPI(
    title="Aapli Wari API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(
    rbac_test.router,
    dependencies=[Depends(authorize_request)],
)

app.include_router(channels.router)
app.include_router(content.router)
app.include_router(search.router)
app.include_router(engagement.router)
app.include_router(chat.router)
app.include_router(shorts.router)


app.include_router(amenities.router)


@app.get("/")
def root():
    return {
        "message": "Aapli Wari API is running",
    }
