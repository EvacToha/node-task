import React, { StrictMode } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.scss";
import { ModalKendoPage } from "./pages/modalKendoPage";
import PrivateRoute from "./PrivateRoute";
import LoginPage from "./pages/loginPage";

function App() {
  return (
    <StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route path="/" element={<PrivateRoute />}>
            <Route path="/modal-nodes" element={<ModalKendoPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </StrictMode>
  );
}

export default App;
