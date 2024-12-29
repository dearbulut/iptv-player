import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  Paper,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from '@mui/material';
import { Delete } from '@mui/icons-material';
import { RootState } from '../store';
import { auth, content } from '../services/api';
import { setUser } from '../store/slices/authSlice';
import { setWatchHistory } from '../store/slices/contentSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { watchHistory } = useSelector((state: RootState) => state.content);
  const [xtreamCredentials, setXtreamCredentials] = useState({
    xtream_username: user?.xtream_username || '',
    xtream_password: user?.xtream_password || '',
    xtream_url: user?.xtream_url || '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCredentialsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setXtreamCredentials({
      ...xtreamCredentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await auth.updateXtreamCredentials(xtreamCredentials);
      dispatch(setUser(response.data.user));
      setSuccess('Xtream credentials updated successfully');
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error updating credentials');
      setSuccess('');
    }
  };

  const handleAdultContentToggle = async () => {
    try {
      const response = await auth.toggleAdultContent();
      dispatch(setUser(response.data.user));
      setSuccess('Adult content settings updated successfully');
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error updating settings');
      setSuccess('');
    }
  };

  const handleClearHistory = async () => {
    try {
      await content.clearWatchHistory();
      const response = await content.getWatchHistory();
      dispatch(setWatchHistory(response.data));
      setSuccess('Watch history cleared successfully');
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error clearing watch history');
      setSuccess('');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Profile Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Xtream Credentials
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            <form onSubmit={handleCredentialsSubmit}>
              <TextField
                fullWidth
                margin="normal"
                label="Xtream Username"
                name="xtream_username"
                value={xtreamCredentials.xtream_username}
                onChange={handleCredentialsChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Xtream Password"
                name="xtream_password"
                type="password"
                value={xtreamCredentials.xtream_password}
                onChange={handleCredentialsChange}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Xtream URL"
                name="xtream_url"
                value={xtreamCredentials.xtream_url}
                onChange={handleCredentialsChange}
                placeholder="http://example.com:port"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                sx={{ mt: 2 }}
              >
                Update Credentials
              </Button>
            </form>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={user?.adult_content_enabled || false}
                  onChange={handleAdultContentToggle}
                  color="primary"
                />
              }
              label="Enable Adult Content"
            />

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Watch History
            </Typography>
            {watchHistory.length > 0 ? (
              <>
                <List>
                  {watchHistory.slice(0, 5).map((item) => (
                    <ListItem key={item.id}>
                      <ListItemText
                        primary={item.title}
                        secondary={`Watched: ${Math.round((item.watched_duration / item.total_duration) * 100)}%`}
                      />
                    </ListItem>
                  ))}
                </List>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleClearHistory}
                  startIcon={<Delete />}
                >
                  Clear Watch History
                </Button>
              </>
            ) : (
              <Typography color="textSecondary">
                No watch history available
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;