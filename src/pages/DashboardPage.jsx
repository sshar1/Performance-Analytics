import React from 'react';
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import Dock from '../components/Dock';
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc";

const dockItems = [
    { icon: <VscHome size={18} />, label: 'Dashboard', onClick: () => alert('Home!') },
    { icon: <VscArchive size={18} />, label: 'Archive', onClick: () => alert('Archive!') },
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => alert('Profile!') },
    { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => alert('Settings!') },
];


// --- Mock Data ---
// const initialFiles = [
//     { id: 1, name: 'sales_data_2023' },
//     { id: 2, name: 'user_demographics' },
//     { id: 3, name: 'inventory_levels' },
//     { id: 4, name: 'marketing_campaign_q1' },
//     { id: 5, name: 'website_traffic_logs' },
//     { id: 6, name: 'customer_feedback' },
// ];

// --- SVG Icons ---
const EditIcon = ({ className = 'h-5 w-5' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
    >
        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
        <path
            fillRule="evenodd"
            d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
            clipRule="evenodd"
        />
    </svg>
);

const TrashIcon = ({ className = 'h-5 w-5' }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
    >
        <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
            clipRule="evenodd"
        />
    </svg>
);


// --- Dashboard Component ---

function DashboardPage() {
    //const [files, setFiles] = useState(initialFiles);
    const [files, setFiles] = useState([]);
    const [editingFileId, setEditingFileId] = useState(null);
    const [newName, setNewName] = useState('');

    // useEffect hook to fetch the file list when the component mounts.
    useEffect(() => {
        // We fetch the manifest file from the public folder.
        fetch('/file-manifest.json')
            .then(response => {
                // Check if the network response is ok
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Set the component's state with the fetched file data.
                setFiles(data);
            })
            .catch(error => {
                // Log any errors to the console.
                console.error('Error fetching the file manifest:', error);
            });
    }, []); // The empty dependency array ensures this effect runs only once.

    /**
     * Deletes a file from the list based on its ID.
     * @param {number} fileId - The ID of the file to delete.
     */
    const handleDelete = (fileId) => {
        // Filter out the file with the matching ID
        setFiles(files.filter((file) => file.id !== fileId));
    };

    /**
     * Handles the start of an edit action.
     * @param {object} file - The file object to be edited.
     */
    const handleEdit = (file) => {
        setEditingFileId(file.id);
        setNewName(file.name);
    };

    /**
     * Saves the new name for a file.
     * @param {number} fileId - The ID of the file to save.
     */
    const handleSave = (fileId) => {
        // Map over the files and update the name of the one with the matching ID
        setFiles(
            files.map((file) =>
                file.id === fileId ? { ...file, name: newName } : file
            )
        );
        // Reset editing state
        setEditingFileId(null);
        setNewName('');
    };

    return (
        <div className="bg-gray-100 h-screen w-screen font-sans">
            <header className="bg-white shadow-md">
                <div className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                </div>
            </header>
            <main>
                <div className="mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {files.map((file) => (
                            <div
                                key={file.id}
                                className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300"
                            >
                                {/* Image Placeholder */}
                                <Link to={`/visualizer`}>
                                    <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                                        <span className="text-gray-500">Image Placeholder</span>
                                    </div>
                                </Link>

                                <div className="p-4">
                                    {editingFileId === file.id ? (
                                        <div>
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                className="text-black w-full px-2 py-1 border border-gray-300 rounded-md"
                                            />
                                            <button
                                                onClick={() => handleSave(file.id)}
                                                className="mt-2 w-full bg-blue-600 text-white py-1 rounded-md hover:bg-blue-700"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-between items-center">
                                            <a href={`#/dashboard/file/${file.id}`} className="flex-grow min-w-0">
                                                <p className="text-gray-800 font-semibold truncate" title={file.name}>
                                                    {file.name}
                                                </p>
                                            </a>
                                            <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
                                                <button
                                                    onClick={() => handleEdit(file)}
                                                    className="text-gray-500 hover:text-blue-600"
                                                >
                                                    <EditIcon />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(file.id)}
                                                    className="text-gray-500 hover:text-red-600"
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <Dock
                        items={dockItems}
                        panelHeight={68}
                        baseItemSize={50}
                        magnification={70}
                    />
                </div>
            </main>
        </div>
    );
}

export default DashboardPage;