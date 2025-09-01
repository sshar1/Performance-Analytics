import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import footballField from '/assets/football-field.avif'

// --- Constants ---
const FIELD_LENGTH_YARDS = 120;
const FIELD_WIDTH_YARDS = 53.33;
const SPRINT_THRESHOLD_MPH = 5;
const YARDS_PER_SEC_TO_MPH = 2.04545;
const HEATMAP_COLS = 20;
const HEATMAP_ROWS = 10;

// --- Helper Components ---

const ArrowLeftIcon = ({ className = 'h-6 w-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className} >
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
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

const ToggleSwitch = ({ label, isEnabled, onToggle }) => (
    <div className="flex items-center justify-between">
        <span className="text-gray-600 text-sm">{label}</span>
        <button
            onClick={() => onToggle(!isEnabled)}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors duration-200 focus:outline-none ${isEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}
        >
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${isEnabled ? 'translate-x-3' : '-translate-x-3'}`} />
        </button>
    </div>
);

// --- Helper Functions ---

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

    const [processedData, setProcessedData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Playback state
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [totalTime, setTotalTime] = useState(0);
    const animationFrameRef = useRef(null);
    const lastTimestampRef = useRef(performance.now());

    // UI Toggles
    const [showPath, setShowPath] = useState(true);
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [showSpeedOnPath, setShowSpeedOnPath] = useState(false);

    // Tooltip
    const [tooltip, setTooltip] = useState(null);
    const svgRef = useRef(null);

    // Data Fetching and Processing
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
                if (!response.ok) throw new Error(`Could not fetch ${fileName}.`);
                const csvText = await response.text();

                const lines = csvText.trim().split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                const rawData = lines.slice(1)
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

                if (rawData.length > 1) {
                    const dataWithStats = rawData.map((point, index) => {
                        if (index === 0) return { ...point, distance: 0, speed: 0 };
                        const prev = rawData[index - 1];
                        const dx = (point.x - prev.x) * FIELD_WIDTH_YARDS;
                        const dy = (point.y - prev.y) * FIELD_LENGTH_YARDS;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        const timeDiff = (point.timestamp - prev.timestamp) / 1000; // in seconds
                        const speed = timeDiff > 0 ? (distance / timeDiff) * YARDS_PER_SEC_TO_MPH : 0;
                        return { ...point, distance, speed };
                    });

                    setProcessedData(dataWithStats);
                    const maxTime = Math.max(...dataWithStats.map(p => p.timestamp));
                    setTotalTime(maxTime);
                } else {
                    setError("CSV file has insufficient data for analysis.");
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [location.state]);

    // Statistics Calculation
    const stats = useMemo(() => {
        if (processedData.length < 2) return null;
        const totalDistanceYards = processedData.reduce((sum, p) => sum + p.distance, 0);
        const maxSpeed = Math.max(...processedData.map(p => p.speed));
        const avgSpeed = (totalDistanceYards / (totalTime / 1000)) * YARDS_PER_SEC_TO_MPH;

        let sprints = 0;
        let inSprint = false;
        processedData.forEach(p => {
            if (p.speed > SPRINT_THRESHOLD_MPH && !inSprint) {
                inSprint = true;
                sprints++;
            } else if (p.speed <= SPRINT_THRESHOLD_MPH) {
                inSprint = false;
            }
        });

        // Mock historical data
        const historicalAvgSpeed = 10.5;
        const speedComparison = ((avgSpeed - historicalAvgSpeed) / historicalAvgSpeed) * 100;

        return {
            totalDistance: totalDistanceYards.toFixed(1),
            maxSpeed: maxSpeed.toFixed(1),
            avgSpeed: avgSpeed.toFixed(1),
            sprints,
            speedComparison: speedComparison.toFixed(0)
        };
    }, [processedData, totalTime]);

    // Heatmap Calculation
    const heatmapGrid = useMemo(() => {
        if (processedData.length < 2) return [];

        const grid = Array(HEATMAP_ROWS).fill(0).map(() => Array(HEATMAP_COLS).fill(0));
        let maxTimeInCell = 0;

        for (let i = 1; i < processedData.length; i++) {
            const prev = processedData[i - 1];
            const curr = processedData[i];

            const col = Math.floor(curr.x * HEATMAP_COLS);
            const row = Math.floor(curr.y * HEATMAP_ROWS);

            if (row >= 0 && row < HEATMAP_ROWS && col >= 0 && col < HEATMAP_COLS) {
                const timeDiff = curr.timestamp - prev.timestamp;
                grid[row][col] += timeDiff;
                if (grid[row][col] > maxTimeInCell) {
                    maxTimeInCell = grid[row][col];
                }
            }
        }

        return grid.map(row => row.map(time => maxTimeInCell > 0 ? time / maxTimeInCell : 0));

    }, [processedData]);

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
            cancelAnimationFrame(animationFrameRef.current);
        }
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [isPlaying, totalTime]);


    const handleGoBack = () => navigate('/dashboard');
    const togglePlayPause = () => {
        if (currentTime >= totalTime && totalTime > 0) setCurrentTime(0);
        setIsPlaying(!isPlaying);
    };
    const handleScrubberChange = (e) => {
        setIsPlaying(false);
        setCurrentTime(Number(e.target.value));
    };

    const handleMouseMoveOnSvg = (e) => {
        if (!svgRef.current) return;
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;

        const transformedPoint = svgPoint.matrixTransform(svgRef.current.getScreenCTM().inverse());

        let closestPoint = null;
        let minDistance = Infinity;

        visibleData.forEach(p => {
            const dx = (p.x * 100) - transformedPoint.x;
            const dy = (p.y * 100) - transformedPoint.y;
            const distance = dx * dx + dy * dy;
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = p;
            }
        });

        if (closestPoint && minDistance < 10) { // Threshold for hover detection
            setTooltip({
                x: e.clientX,
                y: e.clientY,
                data: closestPoint,
            });
        } else {
            setTooltip(null);
        }
    };

    // --- Rendering ---
    const visibleData = processedData.filter(p => p.timestamp <= currentTime);
    const maxSpeedForColor = stats ? parseFloat(stats.maxSpeed) : 1;

    const getSpeedColor = (speed) => {
        const ratio = Math.min(speed / (maxSpeedForColor * 0.8), 1); // 0.8 to make red more frequent
        const hue = (1 - ratio) * 240; // 240 is blue, 0 is red
        return `hsl(${hue}, 90%, 50%)`;
    };

    return (
        <div className="w-screen h-screen bg-gray-100 font-sans flex flex-col">
            {tooltip && (
                <div className="fixed p-2 text-xs bg-black text-white rounded-md shadow-lg z-50 pointer-events-none" style={{ left: tooltip.x + 15, top: tooltip.y }}>
                    <div>Time: {formatTime(tooltip.data.timestamp)}</div>
                    <div>Speed: {tooltip.data.speed.toFixed(1)} mph</div>
                </div>
            )}
            <header className="bg-white shadow-md w-full">
                <div className="mx-auto py-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center">
                        <button onClick={handleGoBack} className="bg-transparent p-2 rounded-full text-gray-600 hover:bg-gray-200 mr-4">
                            <ArrowLeftIcon />
                        </button>
                        <h1 className="text-2xl font-bold text-gray-900 truncate" title={publicName}>Visualizer: {publicName}</h1>
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden">
                <div className="flex-grow flex min-h-0">
                    {/* Visual Area */}
                    <div onMouseMove={handleMouseMoveOnSvg} onMouseLeave={() => setTooltip(null)} className="relative flex-grow bg-white rounded-xl shadow-lg mr-4 flex items-center justify-center overflow-hidden">
                        {isLoading ? <p className="text-gray-500">Loading data...</p> : error ? <p className="text-red-500 p-4">{error}</p> : (
                            <>
                                <img src={footballField} alt="Football Field" className="h-full w-full object-fill" />
                                {showHeatmap && (
                                    <div className="absolute top-0 left-0 w-full h-full grid grid-cols-20 grid-rows-10">
                                        {heatmapGrid.flat().map((intensity, index) => (
                                            <div
                                                key={index}
                                                className="w-full h-full"
                                                style={{ backgroundColor: `rgba(255, 0, 0, ${intensity * 0.7})` }}
                                            />
                                        ))}
                                    </div>
                                )}
                                <svg ref={svgRef} className="absolute top-0 left-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    {showPath && (
                                        <>
                                            {showSpeedOnPath ? (
                                                visibleData.map((p, i) => i > 0 && (
                                                    <line
                                                        key={i}
                                                        x1={visibleData[i-1].x * 100} y1={visibleData[i-1].y * 100}
                                                        x2={p.x * 100} y2={p.y * 100}
                                                        stroke={getSpeedColor(p.speed)}
                                                        strokeWidth="0.5"
                                                    />
                                                ))
                                            ) : (
                                                <polyline points={visibleData.map(p => `${p.x * 100},${p.y * 100}`).join(' ')} fill="none" stroke="#ef4444" strokeWidth="0.5" />
                                            )}
                                        </>
                                    )}
                                </svg>
                            </>
                        )}
                    </div>

                    {/* Right Side Panel */}
                    <aside className="w-1/4 max-w-xs bg-white rounded-xl shadow-lg p-6 flex flex-col space-y-6 overflow-y-auto">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Statistics</h2>
                            {stats ? (
                                <div className="space-y-2 text-sm">
                                    <p className="text-black flex justify-between"><span>Total Distance:</span> <strong>{stats.totalDistance} yd</strong></p>
                                    <p className="text-black flex justify-between"><span>Max Speed:</span> <strong>{stats.maxSpeed} mph</strong></p>
                                    <p className="text-black flex justify-between"><span>Average Speed:</span> <strong>{stats.avgSpeed} mph</strong></p>
                                    <p className="text-black flex justify-between"><span>Sprints:</span> <strong>{stats.sprints}</strong></p>
                                </div>
                            ) : <p className="text-sm text-gray-500">Not enough data.</p>}
                        </div>
                        <div>
                            <h3 className="text-md font-semibold text-gray-700 mb-2">Historical Comparison</h3>
                            {stats ? (
                                <p className="text-sm text-gray-600">
                                    Avg Speed is <strong className={stats.speedComparison > 0 ? 'text-green-600' : 'text-red-600'}>{Math.abs(stats.speedComparison)}% {stats.speedComparison > 0 ? 'above' : 'below'}</strong> average.
                                </p>
                            ) : <p className="text-sm text-gray-500">Not enough data.</p>}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Display Options</h2>
                            <div className="space-y-3">
                                <ToggleSwitch label="Show Path" isEnabled={showPath} onToggle={setShowPath} />
                                <ToggleSwitch label="Show Heatmap" isEnabled={showHeatmap} onToggle={setShowHeatmap} />
                                <ToggleSwitch label="Show Speed on Path" isEnabled={showSpeedOnPath} onToggle={setShowSpeedOnPath} />
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Playback Controls */}
                {!isLoading && !error && (
                    <div className="flex-shrink-0 bg-white rounded-xl shadow-lg mt-4 p-4 flex items-center space-x-4">
                        <button onClick={togglePlayPause} className="p-2 rounded-full text-gray-700 bg-gray-100 hover:bg-gray-200">
                            {isPlaying ? <PauseIcon /> : <PlayIcon />}
                        </button>
                        <span className="font-mono text-sm text-gray-600 w-20 text-center">{formatTime(currentTime)} / {formatTime(totalTime)}</span>
                        <input type="range" min="0" max={totalTime} value={currentTime} onChange={handleScrubberChange} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
                    </div>
                )}
            </main>
        </div>
    );
}

export default VisualizerPage;

