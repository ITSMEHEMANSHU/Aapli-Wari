from fastapi import Depends, FastAPI

from backend.app.api import admin
from backend.app.api import auth
from backend.app.api import rbac_test
from backend.app.api import users
from backend.app.core.security import authorize_request
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Aapli Wari API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
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


@app.get("/")
def root():
    return {
        "message": "Aapli Wari API is running",
    }