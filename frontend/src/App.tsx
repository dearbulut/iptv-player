import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import LiveTV from './pages/LiveTV';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<Home />} />
          <Route path="live" element={<LiveTV />} />
          <Route path="movies" element={<Movies />} />
          <Route path="series" element={<Series />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Box>
  );
}

export default App;