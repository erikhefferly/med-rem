import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavMenu from './components/NavMenu';
import MainScreen from './screens/MainScreen';
import MedicineManagement from './screens/MedicineManagement';
import MedicineForm from './screens/MedicineForm';
import AuditScreen from './screens/AuditScreen';
import SettingsScreen from './screens/SettingsScreen';

export default function App() {
  return (
    <BrowserRouter>
      <NavMenu />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<MainScreen />} />
          <Route path="/medicines" element={<MedicineManagement />} />
          <Route path="/medicines/:id" element={<MedicineForm />} />
          <Route path="/audit" element={<AuditScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
