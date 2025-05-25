from fastapi import FastAPI, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import bcrypt

# --- Models & DB setup ---
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)                      # ← new
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Session = sessionmaker(bind=engine)
db = Session()
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# --- Pydantic schemas ---
class LoginData(BaseModel):
    email: EmailStr
    password: str

# --- Endpoints ---
@app.post("/signup")
def signup(
    name: str = Form(...),                # ← accept name
    email: EmailStr = Form(...),
    password: str = Form(...)
):
    if db.query(User).filter_by(email=email).first():
        raise HTTPException(400, "Email already exists")
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(name=name, email=email, hashed_password=hashed)
    db.add(user); db.commit()
    return {"success": True, "message": "User created"}


@app.post("/login")
def login(
    email: EmailStr = Form(...),
    password: str = Form(...)
):
    user = db.query(User).filter_by(email=email).first()
    if not user or not bcrypt.checkpw(password.encode(), user.hashed_password.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "success": True,
        "message": "Login successful",
        "name": user.name,
        "email": user.email
    }