import React from 'react';
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom';
import Dock from '../components/Dock';
import { VscHome, VscArchive, VscAccount, VscSettingsGear } from "react-icons/vsc";

const dockItems = [
    { icon: <VscHome size={18} />, label: 'Dashboard', onClick: () => alert('Home!') },
    { icon: <VscArchive size={18} />, label: 'Archive', onClick: () => alert('Archive!') },
    { icon: <VscAccount size={18} />, label: 'Profile', onClick: () => alert('Profile!') },
    { icon: <VscSettingsGear size={18} />, label: 'Settings', onClick: () => alert('Settings!') },
];

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

const PlusIcon = ({ className = 'h-12 w-12' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);


// --- Dashboard Component ---

function DashboardPage() {
    const [files, setFiles] = useState([]);
    const [editingFileId, setEditingFileId] = useState(null);
    const [newName, setNewName] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetch('/file-manifest.json')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => setFiles(data))
            .catch(error => console.error('Error fetching the file manifest:', error));
    }, []);

    const handleDelete = (fileId) => {
        setFiles(files.filter((file) => file.id !== fileId));
    };

    const handleEdit = (file) => {
        setEditingFileId(file.id);
        setNewName(file.publicName);
    };

    const handleSave = (fileId) => {
        setFiles(
            files.map((file) =>
                file.id === fileId ? { ...file, publicName : newName } : file
            )
        );
        setEditingFileId(null);
        setNewName('');
    };

    const handleAddFileClick = () => {
        fileInputRef.current.click();
    };

    const handleFileSelected = (event) => {
        const file = event.target.files[0];
        if (file) {
            console.log('Selected file:', file.name);
            // TODO add file processing logic
            event.target.value = null;
        }
    };

    return (
        <div className="bg-gray-100 h-screen w-screen font-sans">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelected}
                accept=".csv"
                className="hidden"
            />
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
                                <Link to={`/visualizer/${file.fileName}`}>
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
                                                <p className="text-gray-800 font-semibold truncate" title={file.publicName}>
                                                    {file.publicName}
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
                        <div
                            onClick={handleAddFileClick}
                            className="bg-gray-50 rounded-xl shadow-lg overflow-hidden flex items-center justify-center cursor-pointer transform hover:scale-105 transition-transform duration-300 group"
                        >
                            <div className="w-full h-full p-4 flex flex-col items-center justify-center border-4 border-dashed border-gray-300 rounded-xl group-hover:border-blue-500 group-hover:bg-blue-50 transition-colors">
                                <PlusIcon className="h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                <p className="mt-2 text-sm font-semibold text-gray-500 group-hover:text-blue-600 transition-colors">Add New File</p>
                            </div>
                        </div>
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