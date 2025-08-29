import React from 'react';
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom';

const LockIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-16 w-16 text-gray-400"
    >
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
);

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [isFormValid, setIsFormValid] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        setIsFormValid(username.trim() !== '' && password.trim() !== '');
    }, [username, password]);

    /**
     * Handles the form submission.
     * This function is called when the form is submitted, either by clicking the button or pressing Enter.
     * @param {React.FormEvent<HTMLFormElement>} e - The form event.
     */
    const handleSubmit = (e) => {
        e.preventDefault();

        if (isFormValid) {
            console.log('Login attempt with:', { username, password });
            navigate('/dashboard');
        } else {
            console.log('Submission blocked: Form is invalid.');
        }
    };

    return (
        <div className="h-screen w-screen bg-gray-100 font-sans flex justify-center items-center relative overflow-hidden">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                <div className="flex flex-col items-center">
                    <LockIcon />
                    <h1 className="text-3xl font-bold text-gray-800 mt-4">Welcome Back</h1>
                    <p className="text-gray-600">Please sign in to continue</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className="text-sm font-semibold text-gray-700 block mb-2"
                        >
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="your.username"
                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="password"
                            className="text-sm font-semibold text-gray-700 block mb-2"
                        >
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-4 py-2 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={!isFormValid}
                            className={`w-full px-4 py-3 font-semibold text-white rounded-lg transition-colors duration-300 ${
                                isFormValid
                                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
                                    : 'bg-gray-400 cursor-not-allowed'
                            }`}
                        >
                            Login
                        </button>
                    </div>
                </form>
                <p className="flex-col text-center text-gray-600">Don't have an account? <Link to="/signup"> Sign up!</Link></p>
                <p className="flex-col text-center text-gray-600"><Link to="/">Forgot password?</Link></p>
            </div>
        </div>
    );
}

export default LoginPage;