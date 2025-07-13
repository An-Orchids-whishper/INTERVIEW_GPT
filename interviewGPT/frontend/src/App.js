import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UploadResume from "./pages/UploadResume";
import GenerateInterview from "./pages/GenerateInterview";
import VoiceInterview from "./pages/VoiceInterview";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />                {/* New landing page */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload-resume" element={<UploadResume />} />
        <Route path="/generate" element={<GenerateInterview />} />
        <Route path="/voice-interview" element={<VoiceInterview />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
