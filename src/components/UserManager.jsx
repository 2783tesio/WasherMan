import React, { useState, useEffect } from "react";
import {
  addUser,
  getUsers,
  addClothToUser,
  updateUserClothes
} from "../utils/indexedDB";

const defaultClothes = [
  { id: 1, type: "Jeans" },
  { id: 2, type: "T-Shirt" },
  { id: 3, type: "Jacket" },
  { id: 4, type: "Shorts" }
];

const UserManager = () => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCloth, setSelectedCloth] = useState(null);
  const [clothName, setClothName] = useState("");
  const [categorizedClothes, setCategorizedClothes] = useState({
    Tops: [
      { id: 1, type: "T-Shirt" },
      { id: 2, type: "Shirt" },
      { id: 3, type: "Sweater" },
      { id: 4, type: "Hoodie" },
      { id: 5, type: "Jacket" },
      { id: 6, type: "Blazer" }
    ],
    Bottoms: [
      { id: 7, type: "Jeans" },
      { id: 8, type: "Shorts" },
      { id: 9, type: "Trouser" },
      { id: 10, type: "Pant" }
    ],
    Traditional: [
      { id: 11, type: "Saree" },
      { id: 12, type: "Kurta" },
      { id: 13, type: "Lehenga" },
      { id: 14, type: "Anarkali" },
      { id: 15, type: "Kurti" }
    ],
    Accessories: [{ id: 18, type: "Scarf" }, { id: 47, type: "Towel" }],
    Footwear: [
      { id: 23, type: "Shoes" },
      { id: 24, type: "Slippers" },
      { id: 25, type: "Sandals" },
      { id: 26, type: "Boots" }
    ],
    HomeLinen: [
      { id: 48, type: "Bed Linen" },
      { id: 51, type: "Cushion Cover" },
      { id: 52, type: "Blanket" },
      { id: 53, type: "Quilt" },
      { id: 54, type: "Pillow" },
      { id: 55, type: "Mattress" }
    ]
  });


  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const storedUsers = await getUsers();
    if (storedUsers.length > 0) {
      setUser(storedUsers[0]);
    }
  };

  const handleAddUser = async () => {
    if (!userName.trim()) {
      alert("Please enter a user name!");
      return;
    }
    await addUser(userName, []);
    setUserName("");
    loadUser();
  };

 const handleAddCloth = async () => {
    if (!user || !selectedCloth || !clothName.trim() || !selectedCategory) {
      alert("Please fill all fields!");
      return;
    }
    await addClothToUser(user.id, {
      id: Date.now(),
      type: selectedCloth,
      name: clothName
    });

    setClothName("");
    loadUser();
  };


  const handleDeleteCloth = async (clothId) => {
    if (!user) return;

    // Filter out the deleted cloth
    const updatedClothes = user.userCloth.filter(cloth => cloth.id !== clothId);

    // ✅ Update IndexedDB properly
    await updateUserClothes(user.id, updatedClothes);

    // ✅ Update React state (to re-render the UI)
    setUser(prevUser => ({
        ...prevUser,
        userCloth: updatedClothes
    }));
  };
const handleCategoryChange = e => {
    setSelectedCategory(e.target.value);
    setSelectedCloth("");
};


  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded-lg shadow-md mt-4">
      <h2 className="text-xl font-semibold text-center mb-4">
        👤 Manage User & Clothes
      </h2>

      {!user
        ? <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-medium">➕ Add User</h3>
            <input
              type="text"
              placeholder="Enter user name"
              value={userName}
              onChange={e => setUserName(e.target.value)}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddUser}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              Add User
            </button>
          </div>
        : <div className="flex flex-col space-y-3">
            <h3 className="text-lg font-medium">👕 Add Clothes</h3>
            <select
              onChange={handleCategoryChange}
              value={selectedCategory}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Category</option>
              {Object.keys(categorizedClothes).map(category =>
                <option key={category} value={category}>
                  {category}
                </option>
              )}
            </select>
            <select
              onChange={e => setSelectedCloth(e.target.value)}
              value={selectedCloth}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={!selectedCategory}
            >
              <option value="">Select Cloth Type</option>
              {selectedCategory &&
                categorizedClothes[selectedCategory].map(cloth =>
                  <option key={cloth.id} value={cloth.type}>
                    {cloth.type}
                  </option>
                )}
            </select>
            <input
              type="text"
              placeholder="Cloth Name (e.g. Black Pant)"
              value={clothName}
              onChange={e => setClothName(e.target.value)}
              className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              disabled={!selectedCloth}
            />
            <button
              onClick={handleAddCloth}
              className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-900 transition"
              disabled={!selectedCloth || !clothName}
            >
              Add Cloth
            </button>
          </div>}

      {user &&
        <div className="mt-4">
          <h3 className="text-lg font-medium">
            {user.userName}'s Clothes
          </h3>
          <ul className="mt-2 space-y-2">
            {user.userCloth.map(cloth =>
              <li
                key={cloth.id}
                className="p-2 bg-gray-100 rounded flex justify-between items-center"
              >
                <span>
                  {cloth.name} - {cloth.type}
                </span>
                <button
                  onClick={() => handleDeleteCloth(cloth.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-700 transition"
                >
                  ❌
                </button>
              </li>
            )}
          </ul>
        </div>}
    </div>
  );
};

export default UserManager;
