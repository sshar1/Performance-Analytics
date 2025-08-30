import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import './index.css'
import App from './App.jsx'
import SignupPage from "./pages/SignupPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import VisualizerPage from "./pages/VisualizerPage.jsx";

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        children: [
            {
                path: '/',
                element: <HomePage />
            },
            {
                path: '/login',
                element: <LoginPage />
            },
            {
                path: '/signup',
                element: <SignupPage />
            },
            {
                path: '/dashboard',
                element: <DashboardPage />
            },
            {
                path: '/visualizer/:fileName',
                element: <VisualizerPage />
            }
        ]
    }
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);