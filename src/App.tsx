import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import PortfolioDashboard from "./pages/PortfolioDashboard";

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<PortfolioDashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default App;
