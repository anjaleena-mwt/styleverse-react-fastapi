import React, { useState, useEffect } from 'react'
import ProductCard from '../components/ProductCard';
// import jewproducts from "../js/jewproducts"

function Jewellery() {

  const [data, setData] = useState([]) 

  const getdata =  async () =>{
    const response = await fetch(`http://127.0.0.1:8000/jewellery`)
    .then(response => response.json())
    setData(response)
  }  
  useEffect(() =>  {
    getdata(); 
  }, []);

  return (
    <div className="executive-page">
      <h1><b>JEWELLERY - STYLEVERSE</b></h1>
      <section id="jewellery" className="workwear-women">
        <section className="product-section">
          {data.map(j => <ProductCard key={j.id} product={j} />)}
        </section>
      </section>
    </div>   
  );
}

export default Jewellery