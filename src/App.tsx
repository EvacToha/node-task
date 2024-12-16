import React, { StrictMode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.scss";
import { ModalKendoPage } from "./pages/modalKendoPage";

function App() {
  return (
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ModalKendoPage />} />
        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
