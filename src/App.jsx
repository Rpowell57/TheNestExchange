import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from './Navbar'
import ListerPage from './ListerPage'
import ClaimerPage from './ClaimerPage'
import HomePage from './HomePage'
function App() {
    const goToNewScreen = () => {
        console.log("Button Clicked");
        <ListerPage />
      };
  return (
      <div className="App">

          <BrowserRouter>
              <NavBar />
              <Routes>
                  <Route exact path="/ListerPage" element={<ListerPage />} />
                  <Route exact path="/ClaimerPage" element={<ClaimerPage />} />
                  <Route exact path="/Home" element={<HomePage />} />

              </Routes>
          </BrowserRouter>
      </div>
  )
}
export default App
