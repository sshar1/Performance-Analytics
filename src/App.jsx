import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar'; // Import the Navbar

function App() {
    return (
        <div>

            {/*<Navbar />*/}

            <main>
                <Outlet />
            </main>
        </div>
    );
}

export default App;