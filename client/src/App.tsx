import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './components/ui/theme-provider';
import { Toaster } from './components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { Roster } from './pages/Roster';
import { RosterHistory } from './pages/RosterHistory';
import { Holidays } from './pages/Holidays';
import { HolidayRequest } from './pages/HolidayRequest';
import { PendingHolidays } from './pages/PendingHolidays';
import { Profile } from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <ThemeProvider defaultTheme="light" storageKey="ui-theme">
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="employees" element={<Employees />} />
              <Route path="roster" element={<Roster />} />
              <Route path="roster/history" element={<RosterHistory />} />
              <Route path="holidays" element={<Holidays />} />
              <Route path="holidays/request" element={<HolidayRequest />} />
              <Route path="holidays/pending" element={<PendingHolidays />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;