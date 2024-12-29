import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  Tab,
  Tabs,
  Alert,
} from '@mui/material';
import { RootState } from '../store';
import { content } from '../services/api';
import { setFavorites } from '../store/slices/contentSlice';
import ContentCard from '../components/ContentCard';
import { ContentItem } from '../store/slices/contentSlice';

const Favorites = () => {
  const dispatch = useDispatch();
  const { favorites } = useSelector((state: RootState) => state.content);
  const [currentTab, setCurrentTab] = useState('all');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const response = await content.getFavorites();
        dispatch(setFavorites(response.data));
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    };

    fetchFavorites();
  }, [dispatch]);

  const handleFavoriteClick = async (item: ContentItem) => {
    try {
      await content.removeFromFavorites(item.id);
      const response = await content.getFavorites();
      dispatch(setFavorites(response.data));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const filteredFavorites = favorites.filter(item => 
    currentTab === 'all' || item.content_type === currentTab
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Favorites
      </Typography>

      <Tabs
        value={currentTab}
        onChange={(_, newValue) => setCurrentTab(newValue)}
        sx={{ mb: 3 }}
      >
        <Tab label="All" value="all" />
        <Tab label="Live TV" value="live" />
        <Tab label="Movies" value="movie" />
        <Tab label="Series" value="series" />
      </Tabs>

      {filteredFavorites.length === 0 ? (
        <Alert severity="info">
          No favorites found. Add some content to your favorites to see them here.
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {filteredFavorites.map((item) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
              <ContentCard
                item={item}
                isFavorite={true}
                onFavoriteClick={() => handleFavoriteClick(item)}
                onClick={() => {
                  // Handle navigation based on content type
                  // This should be implemented based on your routing structure
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Favorites;