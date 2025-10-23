# main.py
import re
from fastapi import FastAPI, HTTPException, Depends, status, Body
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import session, engine
from database_models import Base, User, Product
from models import UserCreate, UserLogin, ProductCreate
from products import categories, dressproducts, bagproducts, jewproducts
from typing import List, Dict, Any
import uuid

phone_re = re.compile(r'^\+?\d{7,15}$')

# create DB tables if not present
Base.metadata.create_all(bind=engine)

app = FastAPI()

# allow dev React to call API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = session()
    try:
        yield db
    finally:
        db.close()

# ---------------- helpers ----------------
def serialize_product(p: Product) -> Dict[str, Any]:
    return {
        "id": p.id,
        "product_id": p.product_id,
        "title": p.title,
        "img": p.img,
        "price": p.price,
        "category": p.category
    }

# ---------------- AUTH (unchanged) ----------------
@app.post("/register", status_code=status.HTTP_201_CREATED)
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(
        (User.username == user.username) | (User.user_email == user.user_email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already exists")

    if user.password != user.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

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

@app.post("/login")
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.user_email == payload.user_email).first()
    if not user or user.password != payload.password:
        raise HTTPException(status_code=400, detail="Invalid email or password")

    return {
        "message": "Login successful",
        "username": user.username,
        "user_id": user.id,
        "user_email": user.user_email,
        "address": user.address,
        "phone_number": user.phone_number
    }

# ---------------- SEED / CLEAR ----------------
@app.post("/admin/seed-products")
def seed_products(db: Session = Depends(get_db)):
    """
    Safe to re-run:
      - updates any existing product (by product_id) with latest fields
      - inserts new products
    """
    all_products = (
        [(p, "dresses") for p in dressproducts] +
        [(p, "bags") for p in bagproducts] +
        [(p, "jewellery") for p in jewproducts]
    )

    inserted = 0
    updated = 0
    for p, cat in all_products:
        pid = p.get("id")
        title = p.get("title")
        price = p.get("price")
        img = p.get("img", "")

        if not pid or title is None or price is None:
            print("Skipping malformed product:", p)
            continue

        existing = db.query(Product).filter_by(product_id=pid).first()
        if existing:
            existing.title = title
            existing.img = img
            existing.price = price
            existing.category = cat
            updated += 1
        else:
            product = Product(
                product_id=pid,
                title=title,
                img=img,
                price=price,
                category=cat
            )
            db.add(product)
            inserted += 1

    db.commit()
    return {"message": f"{inserted} products inserted, {updated} products updated"}

@app.post("/admin/clear-products")
def clear_products(db: Session = Depends(get_db)):
    db.query(Product).delete()
    db.commit()
    return {"message": "All products cleared"}

# ---------------- public product endpoints ----------------
@app.get("/")
def greet():
    return {"message": "Welcome to StyleVerse"}

@app.get("/categories")
def get_categories():
    return categories

@app.get("/dresses")
def get_dress_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.category == "dresses").all()
    return [serialize_product(p) for p in products]

@app.get("/bags")
def get_bag_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.category == "bags").all()
    return [serialize_product(p) for p in products]

@app.get("/jewellery")
def get_jewellery_products(db: Session = Depends(get_db)):
    products = db.query(Product).filter(Product.category == "jewellery").all()
    return [serialize_product(p) for p in products]

# ---------------- admin endpoints (DB-backed) ----------------
@app.get("/admin/products")
def admin_list_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    grouped = {"dresses": [], "bags": [], "jewellery": [], "other": []}
    for p in products:
        item = serialize_product(p)
        cat = (p.category or "").lower()
        if cat in grouped:
            grouped[cat].append(item)
        else:
            grouped["other"].append(item)
    return grouped

@app.post("/admin/products", status_code=201)
def admin_add_product(payload: ProductCreate, db: Session = Depends(get_db)):
    existing = db.query(Product).filter_by(product_id=payload.product_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product already exists")

    product = Product(
        product_id=payload.product_id,
        title=payload.title,
        img=payload.img,
        price=payload.price,
        category=payload.category
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    return {"message": "Product added", "product": serialize_product(product)}

@app.put("/admin/products/{product_id}")
def admin_update_product(product_id: str, payload: ProductCreate, db: Session = Depends(get_db)):
    product = db.query(Product).filter_by(product_id=product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.title = payload.title
    product.img = payload.img
    product.price = payload.price
    product.category = payload.category
    db.commit()
    db.refresh(product)
    return {"message": "Product updated", "product": serialize_product(product)}

@app.delete("/admin/products/{product_id}")
def admin_delete_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(Product).filter_by(product_id=product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {"message": "deleted", "product_id": product_id}
