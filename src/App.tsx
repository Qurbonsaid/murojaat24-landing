import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Statistics from "@/pages/Statistics";
import SubmitRequest from "@/pages/SubmitRequest";
import TrackRequest from "@/pages/TrackRequest";

// Inner component to handle routing logic with access to useNavigate hook
const AppRoutes = () => {
  const navigate = useNavigate();

  useEffect(() => {
    try {
      if (location.hostname === "/murojaat-yuborish") {
        const requestId = new URLSearchParams(location.search).get("id");
        if (requestId) {
          navigate(`/kuzatish?id=${encodeURIComponent(requestId)}`);
        }
      }
    } catch (error) {
      // Safely ignore errors when outside Telegram
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/murojaat-yuborish" element={<SubmitRequest />} />
      <Route path="/kuzatish" element={<TrackRequest />} />
      <Route path="/statistika" element={<Statistics />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

export default App;
