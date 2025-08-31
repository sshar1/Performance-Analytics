import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
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

const PlayIcon = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.648c1.295.742 1.295 2.545 0 3.286L7.279 20.99c-1.25.717-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
    </svg>
);

const PauseIcon = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0a.75.75 0 01.75-.75h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
    </svg>
);

// --- Time Formatting Helper ---
const formatTime = (ms) => {
    if (isNaN(ms) || ms < 0) return "0:00";
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// --- Visualizer Component ---
function VisualizerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { publicName } = useParams();

    const [plotData, setPlotData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const animationFrameRef = useRef(null);
    const lastTimestampRef = useRef(performance.now());

    useEffect(() => {
        const fileName = location.state?.fileName;
        if (!fileName) {
            setError("File path not provided. Please navigate from the dashboard.");
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/csv/${fileName}`);
                if (!response.ok) {
                    throw new Error(`Could not fetch ${fileName}.`);
                }
                const csvText = await response.text();

                const lines = csvText.trim().split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                const data = lines.slice(1)
                    .filter(line => line.trim() !== '')
                    .map(line => {
                        const values = line.split(',');
                        const entry = {};
                        headers.forEach((header, index) => {
                            entry[header] = parseFloat(values[index]);
                        });
                        return entry;
                    })
                    .filter(p => !isNaN(p.timestamp) && !isNaN(p.x) && !isNaN(p.y));


                if (data.length > 0) {
                    setPlotData(data);
                    // Use Math.max to reliably find the highest timestamp
                    const maxTime = Math.max(...data.map(p => p.timestamp));
                    setTotalTime(maxTime);
                } else {
                    setError("CSV file is empty or invalid.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [location.state]);

    // Animation loop for playback
    useEffect(() => {
        const animate = (now) => {
            const elapsedTime = now - lastTimestampRef.current;
            lastTimestampRef.current = now;

            setCurrentTime(prevTime => {
                const newTime = prevTime + elapsedTime;
                if (newTime >= totalTime) {
                    setIsPlaying(false);
                    return totalTime;
                }
                return newTime;
            });
            animationFrameRef.current = requestAnimationFrame(animate);
        };

        if (isPlaying) {
            lastTimestampRef.current = performance.now();
            animationFrameRef.current = requestAnimationFrame(animate);
        } else {
            // Ensure the animation is cancelled when paused
            cancelAnimationFrame(animationFrameRef.current);
        }

        return () => {
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [isPlaying, totalTime]);

    const handleGoBack = () => navigate('/dashboard');
    const togglePlayPause = () => {
        // Reset to the beginning if playback is finished
        if (currentTime >= totalTime && totalTime > 0) {
            setCurrentTime(0);
        }
        setIsPlaying(!isPlaying);
    };
    const handleScrubberChange = (e) => {
        setIsPlaying(false);
        setCurrentTime(Number(e.target.value));
    };

    // Filter data based on the correct 'timestamp' field
    const visibleData = plotData.filter(p => p.timestamp <= currentTime);

    return (
        <div className="w-screen h-screen bg-gray-100 font-sans flex flex-col">
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
                            <h1 className="text-2xl font-bold text-gray-900 truncate" title={publicName}>
                                Visualizer: {publicName}
                            </h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-grow flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden">
                <div className="flex-grow flex">
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
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                >
                                    <polyline
                                        points={visibleData.map(p => `${p.x * 100},${p.y * 100}`).join(' ')}
                                        fill="none"
                                        stroke="#ef4444"
                                        strokeWidth="0.5"
                                        strokeLinejoin="round"
                                        strokeLinecap="round"
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
                        </div>
                    </aside>
                </div>

                {/* Playback Controls */}
                {!isLoading && !error && (
                    <div className="flex-shrink-0 bg-white rounded-xl shadow-lg mt-4 p-4 flex items-center space-x-4">
                        <button onClick={togglePlayPause} className="p-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <span className="font-mono text-sm text-gray-600 w-20 text-center">
                            {formatTime(currentTime)} / {formatTime(totalTime)}
                        </span>
                        <input
                            type="range"
                            min="0"
                            max={totalTime}
                            value={currentTime}
                            onChange={handleScrubberChange}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                )}
            </main>
        </div>
    );
}

export default VisualizerPage;

