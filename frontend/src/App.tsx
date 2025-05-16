import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

const App = () => {
  return (
    <div className="bg-zinc-900 text-white min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-3xl">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/register" element={<Register />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </div>
  );
};

export default App;
