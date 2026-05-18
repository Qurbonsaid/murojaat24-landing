import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { isTMA } from "@tma.js/sdk-react";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Statistics from "@/pages/Statistics";
import SubmitRequest from "@/pages/SubmitRequest";
import TrackRequest from "@/pages/TrackRequest";

// Inner component to handle routing logic with access to useNavigate hook
const AppRoutes = () => {
  const navigate = useNavigate();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!isTMA()) {
      setInitialized(true);
      return;
    }

    if (location.search) {
      const requestId = new URLSearchParams(location.search).get("id");
      if (requestId) {
        navigate(`/kuzatish?id=${encodeURIComponent(requestId)}`);
      }
    }

    setInitialized(true);
  }, [navigate]);

  if (!initialized) return null;

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
