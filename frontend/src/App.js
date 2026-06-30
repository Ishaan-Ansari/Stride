import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import About from "@/pages/About";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <div className="App min-h-screen bg-[#0A0A0A] text-white">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="top-right" />
    </div>
  );
}

export default App;
