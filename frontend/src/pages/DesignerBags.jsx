import React, {useState, useEffect }from 'react'
import ProductCard from '../components/ProductCard';
// import bagproducts from "../js/bagproducts"

function DesignerBags() {

const [data, setData] = useState([]) 

const getdata =  async () =>{
  const response = await fetch(`http://127.0.0.1:8000/bags`)
  .then(response => response.json())
  setData(response)
}
useEffect(() =>  {
 getdata(); 
}, []);

  return (
    <div className="executive-page">
      <h1><b>DESIGNER BAGS - STYLEVERSE</b></h1>
      <section id="designerbags" className="workwear-women">
        <section className="product-section">
          {data.map(b => <ProductCard key={b.id} product={b} />)}
        </section>
      </section>
    </div>
  );

}
export default DesignerBags
