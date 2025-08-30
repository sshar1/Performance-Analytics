import React, {useEffect, useState} from 'react';
import {useNavigate, useParams } from 'react-router-dom';
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
    const navigate = useNavigate();
    const { fileName } = useParams();

    const [plotData, setPlotData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!fileName) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch the specified CSV file from the public/csv directory
                const response = await fetch(`/csv/${fileName}`);
                if (!response.ok) {
                    throw new Error(`Could not fetch ${fileName}. Please ensure it exists in the public/csv folder.`);
                }
                const csvText = await response.text();

                // --- Simple CSV Parsing Logic ---
                const lines = csvText.trim().split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                // Filter out any empty lines that might result from extra newlines in the CSV
                const data = lines.slice(1).filter(line => line.trim() !== '').map(line => {
                    const values = line.split(',');
                    return headers.reduce((obj, header, index) => {
                        obj[header] = parseFloat(values[index]); // Convert values to numbers
                        return obj;
                    }, {});
                });

                setPlotData(data);
            } catch (err) {
                setError(err.message);
                console.error("Failed to load or parse CSV data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [fileName]); // This effect re-runs whenever the fileName in the URL changes.

    const handleGoBack = () => {
        navigate('/dashboard');
    };

    return (
        <div className="w-screen h-full bg-gray-100 font-sans flex flex-col">
            {/* Top Bar */}
            <header className="bg-white shadow-md w-full">
                <div className="mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0">
                            <button
                                onClick={handleGoBack}
                                className="bg-transparent p-2 rounded-full text-gray-600 hover:bg-gray-200 transition-colors duration-200 mr-4"
                                aria-label="Go back to dashboard"
                            >
                                <ArrowLeftIcon />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 truncate" title={fileName}>
                                Visualizer: {fileName}
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex p-4 sm:p-6 lg:p-8">
                {/* Football Field Area */}
                <div className="relative flex-grow bg-white rounded-xl shadow-lg mr-4 flex items-center justify-center overflow-hidden">
                    {isLoading ? (
                        <p className="text-gray-500">Loading csv data...</p>
                    ) : error ? (
                        <p className="text-red-500 p-4">{error}</p>
                    ) : (
                        <>
                            <img
                                src={footballField}
                                alt="Football Field Area"
                                className="h-full w-full object-fill"
                            />
                            <svg
                                className="absolute top-0 left-0 w-full h-full"
                                // viewBox creates a 100x100 coordinate system for our path
                                viewBox="0 0 100 100"
                                // This allows the SVG coordinate system to stretch with the container
                                preserveAspectRatio="none"
                            >
                                <polyline
                                    // Generate the points string from your plot data
                                    points={plotData.map(p => `${p.x * 100},${p.y * 100}`).join(' ')}
                                    fill="none"
                                    stroke="#ef4444" // A nice red color
                                    strokeWidth="0.5" // Adjust for desired thickness
                                />
                            </svg>
                        </>
                    )}
                </div>

                {/* Right Side Panel */}
                <aside className="w-1/4 max-w-xs bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                        Information
                    </h2>
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            Total Points: <strong>{plotData.length}</strong>
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