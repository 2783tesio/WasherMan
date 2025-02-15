import React, { useEffect, useState } from "react";
import { getGivenClothesForWash, deleteGivenClothForWash } from "../utils/indexedDB";

const GivenClothForWash = () => {
    const [washRecords, setWashRecords] = useState([]);

    useEffect(() => {
        loadWashedClothes();
    }, []);

    const loadWashedClothes = async () => {
        const records = await getGivenClothesForWash();
        setWashRecords(records);
    };

    const handleDelete = async (id) => {
        await deleteGivenClothForWash(id);
        setWashRecords(prevRecords => prevRecords.filter(record => record.id !== id));
    };

    return (
        <div className="max-w-lg mx-auto p-4 bg-white rounded-lg shadow-md mt-4">
            <h2 className="text-xl font-semibold text-center mb-4">📝 Clothes Given for Wash</h2>

            {washRecords.length > 0 ? (
                <div className="space-y-4">
                    {washRecords.map((record) => (
                        <div key={record.id} className="p-4 bg-yellow-100 rounded-lg shadow-sm">
                            <h3 className="font-medium text-gray-700">📅 Wash Date: {record.date}</h3>
                            <ul className="list-none pl-0 mt-2">
                                {record.clothes.map((cloth) => (
                                    <li key={cloth.id} className="text-gray-800">👕 {cloth.type} - {cloth.name}</li>
                                ))}
                            </ul>
                            <button 
                                onClick={() => handleDelete(record.id)} 
                                className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition">
                                🗑️ Delete
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-600">No clothes have been given for wash yet.</p>
            )}
        </div>
    );
};

export default GivenClothForWash;
