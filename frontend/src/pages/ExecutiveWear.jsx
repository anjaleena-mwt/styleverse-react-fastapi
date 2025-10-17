import React, {useState, useEffect} from 'react';
import ProductCard from '../components/ProductCard';
// import dressproducts from "../js/dressproducts"

function ExecutiveWear() {

const [data, setData] = useState([]) 

const getdata =  async () =>{
  const response = await fetch(`http://127.0.0.1:8000/dresses`)
  .then(response => response.json())
  setData(response)
}
useEffect(() => {
  getdata();

}, []);
  return (
    <div className="executive-page">
      <h1><b>ELEGANT WORKWEAR FOR WOMEN - STYLEVERSE</b></h1>
      <section id="dresses" className="workwear-women">
        <section className="product-section">
          {data.map(p => <ProductCard key={p.id} product={p} />)}
        </section>
      </section>
    </div>
  );
}

export default ExecutiveWear;
