import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import UserManager from "./components/UserManager";
import Home from "./components/Home";
import GivenClothForWash from "./components/GivenClothForWash";

function App() {
    return (
        <Router>
            <div className="min-h-screen bg-gray-100 flex flex-col">
                {/* Navigation Bar */}
                <nav className="bg-white-600 text-blue py-3 px-4 flex justify-center gap-4 shadow-md text-sm">
                    <Link to="/" className="hover:text-blue-800 transition">🏠 Home</Link>
                    <Link to="/user-manager" className="hover:text-blue-800 transition">👤 User Manager</Link>
                    <Link to="/wash" className="hover:text-blue-800 transition">🧺 Clothes for Wash</Link>
                </nav>

                {/* Main Content */}
                <div className="p-4">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/user-manager" element={<UserManager />} />
                        <Route path="/wash" element={<GivenClothForWash />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
}

export default App;
