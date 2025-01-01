import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import { auth } from '../services/api';
import { setCredentials } from '../store/slices/authSlice';

const XtreamLogin = () => {
  const dispatch = useDispatch();
  const [credentials, setCredentials] = useState({
    xtream_username: '',
    xtream_password: '',
    xtream_url: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await auth.loginXtream(credentials);
      dispatch(setCredentials(response.data));
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Invalid Xtream credentials or server error');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5" gutterBottom>
          IPTV Player
        </Typography>
        <Typography component="h2" variant="h6" gutterBottom color="textSecondary">
          Enter your Xtream credentials
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            name="xtream_url"
            label="Xtream Server URL"
            placeholder="http://example.com:port"
            value={credentials.xtream_url}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="xtream_username"
            label="Username"
            value={credentials.xtream_username}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="xtream_password"
            label="Password"
            type="password"
            value={credentials.xtream_password}
            onChange={handleChange}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Connect
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default XtreamLogin;