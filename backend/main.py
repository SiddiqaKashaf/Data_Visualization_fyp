from fastapi import FastAPI, HTTPException, Form, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy import Column, Integer, String, DateTime, LargeBinary, Text, create_engine, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base, relationship
import bcrypt
from datetime import datetime
import json

# --- Models & DB setup ---
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    documents = relationship("Document", back_populates="owner")

class Document(Base):
    __tablename__ = "documents"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    filename = Column(String, index=True)
    file_data = Column(LargeBinary)
    file_type = Column(String)  # csv, json, xlsx
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    row_count = Column(Integer, default=0)
    col_count = Column(Integer, default=0)
    doc_metadata = Column(Text)  # JSON string with column info
    owner = relationship("User", back_populates="documents")

DATABASE_URL = "sqlite:///./users.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
Session = sessionmaker(bind=engine)
Base.metadata.create_all(bind=engine)

def get_db():
    db = Session()
    try:
        yield db
    finally:
        db.close()

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# --- Pydantic schemas ---
class LoginData(BaseModel):
    email: EmailStr
    password: str

class DocumentMetadata(BaseModel):
    id: int
    filename: str
    file_type: str
    created_at: str
    updated_at: str
    row_count: int
    col_count: int

class DocumentCreate(BaseModel):
    filename: str
    file_type: str
    row_count: int
    col_count: int

# --- Endpoints ---
@app.post("/signup")
def signup(
    name: str = Form(...),
    email: EmailStr = Form(...),
    password: str = Form(...),
    db = Depends(get_db)
):
    if db.query(User).filter_by(email=email).first():
        raise HTTPException(400, "Email already exists")
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()
    user = User(name=name, email=email, hashed_password=hashed)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"success": True, "message": "User created"}


@app.post("/login")
def login(
    email: EmailStr = Form(...),
    password: str = Form(...),
    db = Depends(get_db)
):
    user = db.query(User).filter_by(email=email).first()
    if not user or not bcrypt.checkpw(password.encode(), user.hashed_password.encode()):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {
        "success": True,
        "message": "Login successful",
        "name": user.name,
        "email": user.email,
        "user_id": user.id
    }


# --- Document Management Endpoints ---
@app.post("/documents/save")
async def save_document(
    email: EmailStr = Form(...),
    filename: str = Form(...),
    file_type: str = Form(...),
    row_count: int = Form(...),
    col_count: int = Form(...),
    file: UploadFile = File(...),
    db = Depends(get_db)
):
    """Save uploaded file to database"""
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(401, "User not found")
    
    # Check if document with same filename already exists for this user
    existing_doc = db.query(Document).filter_by(
        user_id=user.id,
        filename=filename
    ).first()
    
    if existing_doc:
        # Update existing document instead of creating duplicate
        content = await file.read()
        existing_doc.file_data = content
        existing_doc.file_type = file_type
        existing_doc.row_count = row_count
        existing_doc.col_count = col_count
        existing_doc.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_doc)
        return {
            "success": True,
            "document_id": existing_doc.id,
            "message": "Document updated successfully"
        }
    
    content = await file.read()
    doc = Document(
        user_id=user.id,
        filename=filename,
        file_data=content,
        file_type=file_type,
        row_count=row_count,
        col_count=col_count
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return {
        "success": True,
        "document_id": doc.id,
        "message": "Document saved successfully"
    }


@app.get("/documents/list")
def list_documents(email: str, db = Depends(get_db)):
    """List all documents for a user"""
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(401, "User not found")
    
    docs = db.query(Document).filter_by(user_id=user.id).order_by(Document.created_at.desc()).all()
    return {
        "documents": [
            {
                "id": d.id,
                "filename": d.filename,
                "file_type": d.file_type,
                "created_at": d.created_at.isoformat(),
                "updated_at": d.updated_at.isoformat(),
                "row_count": d.row_count,
                "col_count": d.col_count
            }
            for d in docs
        ]
    }


@app.get("/documents/{document_id}/download")
def download_document(document_id: int, email: str, db = Depends(get_db)):
    """Download a document by ID"""
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(401, "User not found")
    
    doc = db.query(Document).filter_by(id=document_id, user_id=user.id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    
    return {
        "filename": doc.filename,
        "file_data": doc.file_data.hex(),
        "file_type": doc.file_type
    }


@app.delete("/documents/{document_id}")
def delete_document(document_id: int, email: str, db = Depends(get_db)):
    """Delete a document"""
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(401, "User not found")
    
    doc = db.query(Document).filter_by(id=document_id, user_id=user.id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    
    db.delete(doc)
    db.commit()
    return {"success": True, "message": "Document deleted"}


@app.put("/documents/{document_id}/rename")
def rename_document(document_id: int, new_name: str, email: str, db = Depends(get_db)):
    """Rename a document"""
    user = db.query(User).filter_by(email=email).first()
    if not user:
        raise HTTPException(401, "User not found")
    
    doc = db.query(Document).filter_by(id=document_id, user_id=user.id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    
    doc.filename = new_name
    db.commit()
    return {"success": True, "message": "Document renamed"}