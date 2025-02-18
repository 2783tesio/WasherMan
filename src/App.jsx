import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UserManager from "./components/UserManager";
import Home from "./components/Home";
import GivenClothForWash from "./components/GivenClothForWash";

function App() {

    const LoadCloth = {
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
      };

    return (
        <Router>
            <div className="min-h-screen bg-gray-100 flex flex-col ">
                {/* Navigation Bar */}
                <nav className="bg-white-600 text-blue py-3 px-4 flex justify-center gap-4 shadow-md text-sm">
                    <Link to="/" className="hover:text-blue-800 transition">🏠 Home</Link>
                    <Link to="/user-manager" className="hover:text-blue-800 transition" >👤 User Manager</Link>
                    <Link to="/wash" className="hover:text-blue-800 transition">🧺 Clothes for Wash</Link>
                </nav>

                {/* Main Content */}
                <div className="p-4">
                    <Routes>
                        <Route path="/" element={<Home clothesdetail={LoadCloth}/>} />
                        <Route path="/user-manager" element={<UserManager clothesdetail={LoadCloth}/>} />
                        <Route path="/wash" element={<GivenClothForWash />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
