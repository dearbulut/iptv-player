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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        <Grid item xs={12}>
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