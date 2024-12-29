import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Typography,
  Dialog,
  DialogContent,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { RootState } from '../store';
import { content } from '../services/api';
import { setLiveStreams } from '../store/slices/contentSlice';
import ContentCard from '../components/ContentCard';
import VideoPlayer from '../components/VideoPlayer';
import { ContentItem } from '../store/slices/contentSlice';

const LiveTV = () => {
  const dispatch = useDispatch();
  const { liveStreams, favorites } = useSelector((state: RootState) => state.content);
  const [selectedStream, setSelectedStream] = useState<ContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const fetchStreams = async () => {
      try {
        const response = await content.getLiveStreams();
        dispatch(setLiveStreams(response.data));

        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map((stream: ContentItem) => stream.category_name))];
        setCategories(['all', ...uniqueCategories.filter(Boolean)]);
      } catch (error) {
        console.error('Error fetching live streams:', error);
      }
    };

    fetchStreams();
  }, [dispatch]);

  const handleStreamSelect = (stream: ContentItem) => {
    setSelectedStream(stream);
  };

  const handleClosePlayer = () => {
    setSelectedStream(null);
  };

  const handleFavoriteClick = async (stream: ContentItem) => {
    try {
      const isFavorite = favorites.some(fav => fav.id === stream.id);
      if (isFavorite) {
        await content.removeFromFavorites(stream.id);
      } else {
        await content.addToFavorites({
          content_id: stream.id,
          content_type: 'live',
          title: stream.title,
          poster_url: stream.poster_url,
        });
      }
      // Refresh favorites
      const favoritesResponse = await content.getFavorites();
      dispatch(setFavorites(favoritesResponse.data));
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const filteredStreams = liveStreams.filter(stream => {
    const matchesSearch = stream.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = category === 'all' || stream.category_name === category;
    return matchesSearch && matchesCategory;
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Live TV
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search channels..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat === 'all' ? 'All Categories' : cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {filteredStreams.map((stream) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={stream.id}>
            <ContentCard
              item={stream}
              isFavorite={favorites.some(fav => fav.id === stream.id)}
              onFavoriteClick={() => handleFavoriteClick(stream)}
              onClick={() => handleStreamSelect(stream)}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog
        fullWidth
        maxWidth="md"
        open={!!selectedStream}
        onClose={handleClosePlayer}
      >
        <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
          {selectedStream && (
            <VideoPlayer
              src={selectedStream.stream_url}
              type="application/x-mpegURL"
              autoplay
              controls
              fluid
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LiveTV;