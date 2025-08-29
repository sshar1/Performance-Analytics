import React from 'react';
import { useNavigate } from 'react-router-dom';
import footballField from '/assets/football-field.avif'

const ArrowLeftIcon = ({ className = 'h-6 w-6' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className={className}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
    </svg>
);

// --- Visualizer Component ---

function VisualizerPage() {
    // The useNavigate hook from react-router-dom allows for programmatic navigation.
    const navigate = useNavigate();

    /**
     * Navigates the user back to the dashboard page.
     */
    const handleGoBack = () => {
        // We specify the route we want to navigate to.
        navigate('/dashboard');
    };

    return (
        <div className="w-screen h-screen bg-gray-100 font-sans flex flex-col">
            {/* Top Bar */}
            <header className="bg-white shadow-md w-full">
                <div className="mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={handleGoBack}
                                className="bg-transparent p-2 text-gray-600 hover:bg-gray-200 transition-colors duration-200 mr-4"
                                aria-label="Go back to dashboard"
                            >
                                <ArrowLeftIcon />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Visualizer</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex p-4 sm:p-6 lg:p-8">
                {/* Football Field Area */}
                <div className="flex-grow bg-white rounded-xl shadow-lg mr-4 flex items-center justify-center overflow-hidden">
                    <img className="h-full object-contain" src={footballField} alt="Football Field Area" />
                </div>

                {/* Right Side Panel */}
                <aside className="w-1/4 max-w-xs bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                        Information
                    </h2>
                    <div className="space-y-4">
                        {/* Placeholder content for the side panel */}
                        <p className="text-gray-600">
                            This panel will display various pieces of information.
                        </p>
                        <div className="bg-gray-200 h-24 rounded-md"></div>
                        <div className="bg-gray-200 h-16 rounded-md"></div>
                    </div>
                </aside>
            </main>
        </div>
    );
}

export default VisualizerPage;