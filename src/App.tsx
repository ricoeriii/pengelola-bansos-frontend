import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';
import CreateReport from './pages/CreateReport';
import EditReport from './pages/EditReport';

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/create-report" element={<CreateReport />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/edit-report/:id" element={<EditReport />} />
    </Routes>
  </Router>
);

export default App;
