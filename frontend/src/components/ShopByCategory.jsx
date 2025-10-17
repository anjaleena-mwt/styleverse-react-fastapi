import React, {useState, useEffect }from 'react'
import { Link } from "react-router-dom";
// import categories from "../js/categories";

function ShopByCategory() {

const [data, setData] = useState([]) 

const getdata =  async () =>{
  const response = await fetch(`http://127.0.0.1:8000/categories`)
  .then(response => response.json())
  setData(response)
}
useEffect(() =>{
  getdata();

}, []);
 

  return (
    <main className="home-page">
      <section className="shop-category" id="shop-category">
        <h2 className="section-title">Shop by Category</h2>

        <div className="category-container">
          {data.map((cat) => (
            <section className="category-card" key={cat.id}>
              <div className="image-wrap">
                <img
                  src={cat.img}
                  alt={cat.title}
                  loading="lazy"
                  className="category-image"
                />
              </div>

              <div className="category-info">
                <h3 className="category-title">{cat.title}</h3>
                <p className="category-sub">{cat.subtitle}</p>

                <Link to={cat.link} className="btn-link">
                  {cat.cta}
                </Link>
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  )
}

export default ShopByCategory
