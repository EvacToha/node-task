import React from 'react';
import {BrowserRouter, Routes, Route} from 'react-router-dom'

import './App.scss';
import {ModalKendoPage} from "./pages/modalKendoPage";

function App() {



  return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ModalKendoPage/>} />
        </Routes>
      </BrowserRouter>

  );
}

export default App;
