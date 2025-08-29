import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
    return (
        <div>
            <h1>Welcome to the Home Page!</h1>
            <p>This is the main page of our application.</p>
            <nav>
                <Link to="/login">Go to Login</Link>
            </nav>
        </div>
    );
}

export default HomePage;