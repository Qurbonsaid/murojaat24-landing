import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Index from "@/pages/Index";
import NotFound from "@/pages/NotFound";
import Statistics from "@/pages/Statistics";
import SubmitRequest from "@/pages/SubmitRequest";
import TrackRequest from "@/pages/TrackRequest";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/murojaat-yuborish" element={<SubmitRequest />} />
        <Route path="/kuzatish" element={<TrackRequest />} />
        <Route path="/statistika" element={<Statistics />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
