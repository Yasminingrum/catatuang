import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddEdit from "./pages/AddEdit";
import Targets from "./pages/Targets";
import Tabungan from "./pages/Tabungan";
import Budget from "./pages/Budget";
import Laporan from "./pages/Laporan";
import DummyData from "./pages/DummyData";

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (!currentUser || !currentUser.emailVerified) return <Navigate to="/" replace />;
  return children;
};
const PublicRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser && currentUser.emailVerified) return <Navigate to="/dashboard" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/add" element={<PrivateRoute><AddEdit /></PrivateRoute>} />
      <Route path="/edit/:id" element={<PrivateRoute><AddEdit /></PrivateRoute>} />
      <Route path="/targets" element={<PrivateRoute><Targets /></PrivateRoute>} />
      <Route path="/tabungan" element={<PrivateRoute><Tabungan /></PrivateRoute>} />
      <Route path="/budget" element={<PrivateRoute><Budget /></PrivateRoute>} />
      <Route path="/laporan" element={<PrivateRoute><Laporan /></PrivateRoute>} />
      <Route path="/dummy" element={<PrivateRoute><DummyData /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
