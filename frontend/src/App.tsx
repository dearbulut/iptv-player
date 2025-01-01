import { Routes, Route, Navigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import Layout from './components/Layout';
import XtreamLogin from './components/XtreamLogin';
import Home from './pages/Home';
import LiveTV from './pages/LiveTV';
import Movies from './pages/Movies';
import Series from './pages/Series';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import { RootState } from './store';

function App() {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Routes>
        {!user ? (
          <Route path="*" element={<XtreamLogin />} />
        ) : (
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="live" element={<LiveTV />} />
            <Route path="movies" element={<Movies />} />
            <Route path="series" element={<Series />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </Box>
  );
}

export default App;