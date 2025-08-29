import React from 'react';
import { Link } from 'react-router-dom';

function SignupPage() {
    return (
        <div className="h-screen w-screen bg-black text-white flex flex-col items-center text-center relative overflow-hidden">
            <div className="z-10 absolute top-3/10 w-full max-w-3/10">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 to-white animate-fade-in-down">
                    Sign up
                </h1>
                <div className="max-w-9/10 mx-auto my-5">
                    <form>
                        <div className="flex md:flex-col gap-3">
                            <input type="email" placeholder="Email" required className="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-white transition-colors"/>
                            <input type="text" placeholder="Username" required className="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-white transition-colors"/>
                            <input type="password" placeholder="Password" required className="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-white transition-colors"/>
                            <input type="password" placeholder="Confirm password" required className="w-full p-4 bg-gray-900 border-2 border-gray-700 rounded-lg focus:outline-none focus:border-white transition-colors"/>
                        </div>
                    </form>
                </div>
                <p>Have an account? <Link to="/login"> Sign in!</Link></p>
            </div>
        </div>
    );
}

export default SignupPage;