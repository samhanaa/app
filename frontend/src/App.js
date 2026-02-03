import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { Homepage } from "./pages/Homepage";
import { Registry } from "./pages/Registry";

function App() {
  return (
    <>
      <Toaster position="top-center" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/registry" element={<Registry />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
