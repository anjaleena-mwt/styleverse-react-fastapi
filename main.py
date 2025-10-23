import re
from fastapi import FastAPI, HTTPException, Depends, status # Depends is used for dependency injection, status is a helper that provides HTTP status code constants
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware # CORS middleware enables / configures Cross-Origin Resource Sharing (lets the React app at localhost:3000 call the API at 127.0.0.1:8000)
from database import session, engine
from database_models import Base, User
from models import UserCreate, UserLogin
from products import categories, dressproducts, bagproducts, jewproducts

from fastapi import Body
from typing import List, Dict, Any
import uuid

phone_re = re.compile(r'^\+?\d{7,15}$')

# create DB tables if not present
Base.metadata.create_all(bind=engine)

# create the FastAPI application object
app = FastAPI()

# CORS: allow React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# DB dependency
def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()

# ---------------- REGISTER ----------------
@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing = db.query(User).filter(
        (User.username == user.username) | (User.user_email == user.user_email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    # manual password match check (if you removed pydantic validator)
    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    # manual phone validation (if you removed pydantic validator)
    if not phone_re.match(user.phone_number):
        raise HTTPException(status_code=400, detail="Invalid phone number")

    db_user = User(
        username=user.username,
        user_email=user.user_email,
        password=user.password,
        address=user.address,          
        phone_number=user.phone_number 
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return {
        "message": "User registered successfully", 
        "user_id": db_user.id,
        "username": db_user.username,
        "user_email": db_user.user_email,
        "address": db_user.address,
        "phone_number": db_user.phone_number
    }

# ---------------- LOGIN ----------------
@app.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_email == payload.user_email).first()
    if not user or user.password != payload.password:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {"message": "Login successful", 
    "username": user.username, 
    "user_id": user.id,
    "user_email": user.user_email, 
    "address": user.address,  
    "phone_number": user.phone_number}

# ---------------- endpoints ----------------
@app.get("/")
def greet():
    return {"message": "Welcome to StyleVerse"}

@app.get("/categories")
def get_categories():
    return categories

@app.get("/dresses")
def get_dress_products():
    return dressproducts

@app.get("/bags")
def get_bag_products():
    return bagproducts

@app.get("/jewellery")
def get_jewellery_products():
    return jewproducts


# --- ADMIN product management endpoints ---

# helper: find product list by category id
def _get_product_list(category: str):
    if category == "dresses":
        return dressproducts
    if category == "bags":
        return bagproducts
    if category == "jewellery":
        return jewproducts
    return None

# GET all admin products combined (for admin UI convenience)
@app.get("/admin/products")
def admin_list_products():
    # return categories with products
    return {
        "dresses": dressproducts,
        "bags": bagproducts,
        "jewellery": jewproducts
    }

# POST add a product to a category
@app.post("/admin/products", status_code=201)
def admin_add_product(payload: Dict[str, Any] = Body(...)):
    """
    payload example:
    { "category":"dresses", "title":"New", "img":"/assets/images/x.jpg", "price": 99, "reviews": 0 }
    """
    category = payload.get("category")
    lst = _get_product_list(category)
    if lst is None:
        raise HTTPException(status_code=400, detail="Invalid category")
    # create new id - ensure unique
    new_id = f"{category[:2]}_{uuid.uuid4().hex[:6]}"
    product = {
        "id": payload.get("id", new_id),
        "title": payload.get("title", "Untitled"),
        "img": payload.get("img", "/assets/images/default.jpg"),
        "price": payload.get("price", 0),
        "reviews": payload.get("reviews", 0)
    }
    lst.append(product)
    return {"message": "created", "product": product}

# PUT update product by id (search all categories)
@app.put("/admin/products/{product_id}")
def admin_update_product(product_id: str, payload: Dict[str, Any] = Body(...)):
    # search and update
    for lst in (dressproducts, bagproducts, jewproducts):
        for i, p in enumerate(lst):
            if p.get("id") == product_id:
                # update fields present in payload
                p["title"] = payload.get("title", p["title"])
                p["img"] = payload.get("img", p["img"])
                p["price"] = payload.get("price", p["price"])
                p["reviews"] = payload.get("reviews", p["reviews"])
                lst[i] = p
                return {"message": "updated", "product": p}
    raise HTTPException(status_code=404, detail="Product not found")

# DELETE product by id
@app.delete("/admin/products/{product_id}")
def admin_delete_product(product_id: str):
    for lst in (dressproducts, bagproducts, jewproducts):
        for i, p in enumerate(lst):
            if p.get("id") == product_id:
                lst.pop(i)
                return {"message": "deleted", "product_id": product_id}
    raise HTTPException(status_code=404, detail="Product not found")
