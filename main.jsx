import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import TradeBlueprint from './Home'
import RoofingCalculator from './Roofing'
import HVACCalculator from './HVAC'
import ElectricalCalculator from './Electrical'
import PlumbingCalculator from './Plumbing'
import ConcreteCalculator from './Concrete'
import PaintingCalculator from './Painting'
import FencingCalculator from './Fencing'
import LandscapingCalculator from './Landscaping'
import SolarCalculator from './Solar'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TradeBlueprint />} />
        <Route path="/roofing" element={<RoofingCalculator />} />
        <Route path="/hvac" element={<HVACCalculator />} />
        <Route path="/electrical" element={<ElectricalCalculator />} />
        <Route path="/plumbing" element={<PlumbingCalculator />} />
        <Route path="/concrete" element={<ConcreteCalculator />} />
        <Route path="/painting" element={<PaintingCalculator />} />
        <Route path="/fencing" element={<FencingCalculator />} />
        <Route path="/landscaping" element={<LandscapingCalculator />} />
        <Route path="/solar" element={<SolarCalculator />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
