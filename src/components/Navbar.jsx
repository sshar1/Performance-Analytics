import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
    return (
        <nav style={{ padding: '1rem', background: '#eee', marginBottom: '1rem' }}>
            <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
            <Link to="/login" style={{ marginRight: '1rem' }}>Login</Link>
        </nav>
    );
}

export default Navbar;