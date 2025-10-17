import React from 'react';
import ShopByCategory from '../components/ShopByCategory';

function Home() {
  return (
    <>
      <section className="centimg">
        <div className="centerimg">
          <div className="video-container">
            <video autoPlay muted loop src="/assets/videos/dressbag.mp4" />
          </div>

          <div className="overlay-text">
            <h1>Elegance Collection</h1>
            <p>Discover exquisite dresses and sophisticated bags crafted for the modern woman</p>
            <div className="button-group">
              <a className="btn-primary" href="/executivewear">Shop Dresses</a>
              <a className="btn-outline" href="/designerbags">View Bags</a>
            </div>
          </div>
        </div>
      </section>

      <ShopByCategory/>
    </>
  );
}
export default Home;