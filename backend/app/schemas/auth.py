from pydantic import BaseModel, EmailStr


class SignupRequest(BaseModel):

    username: str | None = None

    full_name: str

    email: EmailStr

    password: str

    role: str


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


class TokenResponse(BaseModel):

    message: str

    access_token: str

    refresh_token: str

    user_id: str

    role: str