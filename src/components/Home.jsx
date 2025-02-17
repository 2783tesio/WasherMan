import React, { useEffect, useState } from "react";
import { getUsers, addClothForWash } from "../utils/indexedDB";

const Home = () => {
    const [clothes, setClothes] = useState([]);
    const [selectedClothes, setSelectedClothes] = useState([]);
    const [washDate, setWashDate] = useState("");

    useEffect(() => {
        loadClothes();
    }, []);

    const loadClothes = async () => {
        const users = await getUsers();
        if (users.length > 0) {
            setClothes(users[0].userCloth || []);
        }
    };

    const handleCheckboxChange = (clothId) => {
        setSelectedClothes((prevSelected) =>
            prevSelected.includes(clothId)
                ? prevSelected.filter((id) => id !== clothId)
                : [...prevSelected, clothId]
        );
    };

    const handleAddToWash = async () => {
        if (selectedClothes.length === 0) {
            alert("Please select at least one cloth to wash.");
            return;
        }
        if (!washDate) {
            alert("Please select a wash date.");
            return;
        }

        const selectedClothData = clothes.filter((cloth) => selectedClothes.includes(cloth.id));
        await addClothForWash({ date: washDate, clothes: selectedClothData });

        alert(`Clothes added to wash on ${washDate}!`);
        
        setSelectedClothes([]); 
        setWashDate(""); 
    };

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-center text-blue-600">👕 WasherMan App</h2>
            
            <h3 className="text-lg font-semibold mt-4 text-gray-700">Clothes List</h3>

            {clothes.length > 0 ? (
                <ul className="w-full max-w-sm bg-white shadow-md rounded-lg p-4 mt-2">
                    {clothes.map((cloth) => (
                        <li key={cloth.id} className="flex items-center gap-2 py-2 border-b">
                            <input
                                type="checkbox"
                                checked={selectedClothes.includes(cloth.id)}
                                onChange={() => handleCheckboxChange(cloth.id)}
                                className="w-5 h-5"
                            />
                            <span className="text-gray-800">{cloth.name} - {cloth.type}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 mt-2">No clothes added yet.</p>
            )}

            <label className="mt-4 text-gray-700 font-medium">📅 Select Wash Date:</label>
            <input
                type="date"
                value={washDate}
                onChange={(e) => setWashDate(e.target.value)}
                className="mt-2 p-2 w-full max-w-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
                onClick={handleAddToWash}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition" style={{hover: "bg-blue-700"}}
            >
                🧺 Add to Wash
            </button>
        </div>
    );
};

export default Home;
