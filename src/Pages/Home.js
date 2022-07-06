import React from 'react';
import { Navigate } from 'react-router-dom';
import "./Home.css";

const Home = () => {
    return (
        <div>
            <Navigate to="/login" replace />
            {/* <h1>Home Page</h1> */}
        </div>
    );
}
 
export default Home;