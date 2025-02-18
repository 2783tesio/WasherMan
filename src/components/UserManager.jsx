import React, { useState, useEffect } from "react";
import {
  addUser,
  getUsers,
  addClothToUser,
  updateUserClothes
} from "../utils/indexedDB";

const UserManager = ({ clothesdetail }) => {
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCloth, setSelectedCloth] = useState(null);
  const [clothName, setClothName] = useState("");
<<<<<<< HEAD
  const [categorizedClothes, setCategorizedClothes] = useState(clothesdetail);
  const [selectedSeeCategory, setSelectedSeeCategory] = useState('');
=======
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

>>>>>>> 9acb74c607d893cb3dd2965f75d6bd99e0ec50b4

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const storedUsers = await getUsers();
    if (storedUsers.length > 0) {
      setUser(storedUsers[0]);
      //AddNewUpdateInUserClothes(storedUsers[0]);
    }
    // debugger;
    // setCategorizedClothes(props.Cloth);
  };

  // const AddNewUpdateInUserClothes = async (currentUser) => {
  //   if (!currentUser || !currentUser.userCloth) return;

  //   const userClothMap = new Map(currentUser.userCloth.map(cloth => [cloth.type, cloth]));

  //   let userUpdateCloth = [];

  //   Object.entries(categorizedClothes).forEach(([category, clothes]) => {
  //     clothes.forEach(cloth => {
  //       if (userClothMap.has(cloth.type)) {
  //         const userCloth = userClothMap.get(cloth.type);
  //         userUpdateCloth.push({
  //           id: userCloth.id,
  //           type: userCloth.type,
  //           name: userCloth.name,
  //           category: category,
  //           ClothCount: 1
  //         });
  //       }
  //     });
  //   });

  //   await updateUserClothes(currentUser.id, userUpdateCloth);
  //   setUser(prevUser => ({
  //     ...prevUser,
  //     userCloth: userUpdateCloth
  //   }));
  //   //redirect("/");
  // };

  const handleAddUser = async () => {
    if (!userName.trim()) {
      alert("Please enter a user name!");
      return;
    }
    await addUser(userName, []);
    setUserName("");
    loadUser();
  };

<<<<<<< HEAD
  const handleAddCloth = async () => {
=======
 const handleAddCloth = async () => {
>>>>>>> 9acb74c607d893cb3dd2965f75d6bd99e0ec50b4
    if (!user || !selectedCloth || !clothName.trim() || !selectedCategory) {
      alert("Please fill all fields!");
      return;
    }
    await addClothToUser(user.id, {
      id: Date.now(),
      type: selectedCloth,
      name: clothName,
      category: selectedCategory,
      ClothCount: 1
    });

    setClothName("");
    loadUser();
  };

  const handleDeleteCloth = async clothId => {
    if (!user) return;
    const updatedClothes = user.userCloth.filter(cloth => cloth.id !== clothId);
    await updateUserClothes(user.id, updatedClothes);
    setUser(prevUser => ({
      ...prevUser,
      userCloth: updatedClothes
    }));
  };
<<<<<<< HEAD
=======
const handleCategoryChange = e => {
    setSelectedCategory(e.target.value);
    setSelectedCloth("");
};
>>>>>>> 9acb74c607d893cb3dd2965f75d6bd99e0ec50b4

  const handleCategoryChange = e => {
    setSelectedCategory(e.target.value);
    setSelectedCloth("");
  };

  const handleSeeCategoryChange = (category) => {
    setSelectedSeeCategory(category);
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

          {/* Category Dropdown */}
          <div className="mt-4">
            <label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Select Category
            </label>
            <select
              id="category"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              onChange={e => handleSeeCategoryChange(e.target.value)}
            >
              <option value="">All</option>
              {Object.keys(categorizedClothes).map(category =>
                <option key={category} value={category}>
                  {category}
                </option>
              )}
            </select>
          </div>

          <ul className="mt-2 space-y-2">
<<<<<<< HEAD
            {user.userCloth
              .filter(
                cloth => !selectedSeeCategory || cloth.category === selectedSeeCategory
              )
              .map(cloth =>
                <li
                  key={cloth.id}
                  className="p-2 bg-gray-100 rounded flex justify-between items-center"
=======
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
>>>>>>> 9acb74c607d893cb3dd2965f75d6bd99e0ec50b4
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
