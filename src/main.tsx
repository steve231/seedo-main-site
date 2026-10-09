
  import { createRoot } from "react-dom/client";
  import { BrowserRouter, Routes, Route } from "react-router";
  import App from "./app/App.tsx";
  import FretApp from "./app/FretApp.tsx";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FretApp />} />
        <Route path="/colis" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
