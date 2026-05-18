import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";
import { useLaunchParams } from "@tma.js/sdk-react";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Statistics from "@/pages/Statistics";
import SubmitRequest from "@/pages/SubmitRequest";
import TrackRequest from "@/pages/TrackRequest";

// Inner component to handle routing logic with access to useNavigate hook
const AppRoutes = () => {
  const navigate = useNavigate();
  const launch = useLaunchParams(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (!launch) {
      setInitialized(true);
      return;
    }

    const startParam: string | undefined = launch.tgWebAppStartParam;

    if (startParam) {
      const requestIdMatch = startParam.match(/requestId=(.+)/i);
      const requestId = requestIdMatch ? requestIdMatch[1] : startParam;
      if (requestId) {
        navigate(`/kuzatish?id=${encodeURIComponent(requestId)}`);
      }
    }

    setInitialized(true);
  }, [launch, navigate]);

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
