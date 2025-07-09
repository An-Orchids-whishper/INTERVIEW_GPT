import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Register from "./pages/Register";
import GenerateInterview from "./pages/GenerateInterview";
import UploadResume from './pages/UploadResume';
import VoiceInterview from "./pages/VoiceInterview"; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload-resume" element={<UploadResume />} />
        <Route path="/register" element={<Register />} />
        <Route path="/generate" element={<GenerateInterview />} />
        <Route path="/voice-interview" element={<VoiceInterview />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
