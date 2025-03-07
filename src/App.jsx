
import './App.css'

import { BrowserRouter, Routes, Route } from "react-router-dom";
import NavBar from './Navbar'
import ListerPage from './ListerPage'
import ClaimerPage from './ClaimerPage'
import Login from './login';
import HomePage from './HomePage';
function App() {
  return (
      <div className="App">
          <BrowserRouter>
              <NavBar />
              <Routes>
                <Route exact path="/HomePage" element={<HomePage/>} />
                <Route exact path="/ListerPage" element={<ListerPage />} />
                <Route exact path="/ClaimerPage" element={<ClaimerPage />} />
                <Route path="/login" element={<Login/>} />
              </Routes>
          </BrowserRouter>
      </div>
  )
}
export default App
