import React, { useEffect, useState } from "react";
import { getUsers, addClothForWash } from "../utils/indexedDB";
import { useNavigate } from "react-router-dom";
import { Snackbar } from "@mui/material";

const Home = ({ clothesdetail }) => {
  const [clothes, setClothes] = useState([]);
  const [selectedClothes, setSelectedClothes] = useState([]);
  const [washDate, setWashDate] = useState("");
  const [categorizedClothes, setCategorizedClothes] = useState(clothesdetail);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  useEffect(() => {
    loadClothes();
  }, []);

  const loadClothes = async () => {
    const users = await getUsers();
    if (users.length > 0) {
      setClothes(users[0].userCloth || []);
    } else {
      navigate("/user-manager");
    }

    setWashDate(new Date().toISOString().split("T")[0]);
  };

  const handleCheckboxChange = clothId => {
    setSelectedClothes(
      prevSelected =>
        prevSelected.includes(clothId)
          ? prevSelected.filter(id => id !== clothId)
          : [...prevSelected, clothId]
    );
    alert(`Clothes added to wash on ${washDate}!`);

    setSelectedClothes([]);
    setWashDate("");
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

    const selectedClothData = clothes.filter(cloth =>
      selectedClothes.includes(cloth.id)
    );
    await addClothForWash({ date: washDate, clothes: selectedClothData });
    setOpen(true);

    // <ClothesWashComponent washDate={washDate} />;

    setSelectedClothes([]);
    //setWashDate("");
    setWashDate(new Date().toISOString().split("T")[0]);
  };

  const handleCategoryChange = category => {
    setSelectedCategory(category);
  };

  const handleClothCountChange = (clothId, count) => {
    setClothes(prevClothes =>
      prevClothes.map(
        cloth =>
          cloth.id === clothId ? { ...cloth, ClothCount: count } : cloth
      )
    );
  };

  const removeCount = (clothId, count) => {
    if (count <= 1) {
      return;
    }
    handleClothCountChange(clothId, count - 1);
  };

  const addCount = (clothId, count) => {
    if (count < 1) {
      return;
    }
    handleClothCountChange(clothId, count + 1);
  };
  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center bg-grey-400">
      <h2 className="text-2xl font-bold text-center text-blue-600">
        👕 WasherMan App
      </h2>

      <h3 className="text-lg font-semibold mt-4 text-gray-700">Clothes List</h3>
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
          onChange={e => handleCategoryChange(e.target.value)}
        >
          <option value="">All</option>
          {Object.keys(categorizedClothes).map(category =>
            <option key={category} value={category}>
              {category}
            </option>
          )}
        </select>
      </div>
      {clothes.length > 0
        ? <ul className="w-full max-w-sm bg-white shadow-md rounded-lg p-4 mt-2">
            {clothes
              .filter(
                cloth =>
                  !selectedCategory || cloth.category === selectedCategory
              )
              .map(cloth =>
                <li
                  key={cloth.id}
                  className="flex items-center gap-2 py-2 border-b"
                >
                  <input
                    type="checkbox"
                    checked={selectedClothes.includes(cloth.id)}
                    onChange={() => handleCheckboxChange(cloth.id)}
                    className="w-5 h-5"
                  />
                  <span className="text-gray-800 text-xl">
                    {cloth.name} - {cloth.type}
                  </span>
                  <span className="text-gray-500 text-xl border-1  border-solid border-gray rounded-lg ml-4 flex items-center">
                    <button
                      className="mx-1 px-1 w-6 text-xl text-black rounded"
                      onClick={() => removeCount(cloth.id, cloth.ClothCount)}
                    >
                      -
                    </button>
                    {cloth.ClothCount}
                    <button
                      className="mx-1 px-1 w-6 text-xl text-black rounded"
                      onClick={() => addCount(cloth.id, cloth.ClothCount)}
                    >
                      +
                    </button>
                  </span>
                </li>
              )}
          </ul>
        : <p className="text-gray-500 mt-2">No clothes added yet.</p>}

      <label className="mt-4 text-gray-700 font-medium">
        📅 Select Wash Date:
      </label>
      <input
        type="date"
        value={washDate}
        onChange={e => setWashDate(e.target.value)}
        className="mt-2 p-2 w-full max-w-sm border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleAddToWash}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
        style={{ hover: "bg-blue-700" }}
      >
        🧺 Add to Wash
      </button>
      {open &&
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={open}
          onClose={() => setOpen(false)}
          message="Clothes have been added to wash successfully!"
          autoHideDuration={2000}
        />}
    </div>
  );
};

export default Home;
