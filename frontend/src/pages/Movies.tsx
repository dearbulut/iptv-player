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
  DialogTitle,
  IconButton,
  Chip,
  Stack,
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';
import { RootState } from '../store';
import { content } from '../services/api';
import { setMovies, setWatchHistory } from '../store/slices/contentSlice';
import ContentCard from '../components/ContentCard';
import VideoPlayer from '../components/VideoPlayer';
import { ContentItem } from '../store/slices/contentSlice';

const Movies = () => {
  const dispatch = useDispatch();
  const { movies, favorites, watchHistory } = useSelector((state: RootState) => state.content);
  const [selectedMovie, setSelectedMovie] = useState<ContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('title');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await content.getMovies();
        dispatch(setMovies(response.data));

        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map((movie: ContentItem) => movie.category_name))];
        setCategories(['all', ...uniqueCategories.filter(Boolean)]);
      } catch (error) {
        console.error('Error fetching movies:', error);
      }
    };

    fetchMovies();
  }, [dispatch]);

  const handleMovieSelect = (movie: ContentItem) => {
    setSelectedMovie(movie);
  };

  const handleClosePlayer = () => {
    setSelectedMovie(null);
  };

  const handleFavoriteClick = async (movie: ContentItem) => {
    try {
      const isFavorite = favorites.some(fav => fav.id === movie.id);
      if (isFavorite) {
        await content.removeFromFavorites(movie.id);
      } else {
        await content.addToFavorites({
          content_id: movie.id,
          content_type: 'movie',
          title: movie.title,
          poster_url: movie.poster_url,
        });
      }
      // Refresh favorites
      const favoritesResponse = await content.getFavorites();
      dispatch(setFavorites(favoritesResponse.data));
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleTimeUpdate = async (currentTime: number, duration: number) => {
    if (selectedMovie) {
      try {
        await content.updateWatchHistory({
          content_id: selectedMovie.id,
          content_type: 'movie',
          title: selectedMovie.title,
          watched_duration: currentTime,
          total_duration: duration,
          poster_url: selectedMovie.poster_url,
        });
        
        // Refresh watch history
        const historyResponse = await content.getWatchHistory();
        dispatch(setWatchHistory(historyResponse.data));
      } catch (error) {
        console.error('Error updating watch history:', error);
      }
    }
  };

  const filteredAndSortedMovies = movies
    .filter(movie => {
      const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || movie.category_name === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'releaseDate':
          return new Date(b.release_date || 0).getTime() - new Date(a.release_date || 0).getTime();
        case 'rating':
          return (Number(b.rating) || 0) - (Number(a.rating) || 0);
        default:
          return 0;
      }
    });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Movies
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search movies..."
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
        <Grid item xs={12} md={4}>
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
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="releaseDate">Release Date</MenuItem>
              <MenuItem value="rating">Rating</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {filteredAndSortedMovies.map((movie) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={movie.id}>
            <ContentCard
              item={movie}
              isFavorite={favorites.some(fav => fav.id === movie.id)}
              onFavoriteClick={() => handleFavoriteClick(movie)}
              onClick={() => handleMovieSelect(movie)}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog
        fullWidth
        maxWidth="md"
        open={!!selectedMovie}
        onClose={handleClosePlayer}
      >
        {selectedMovie && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">{selectedMovie.title}</Typography>
                <IconButton onClick={handleClosePlayer}>
                  <Close />
                </IconButton>
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {selectedMovie.release_date && (
                  <Chip label={new Date(selectedMovie.release_date).getFullYear()} />
                )}
                {selectedMovie.rating && (
                  <Chip label={`Rating: ${selectedMovie.rating}`} />
                )}
                {selectedMovie.duration && (
                  <Chip label={`${Math.floor(selectedMovie.duration / 60)}min`} />
                )}
              </Stack>
            </DialogTitle>
            <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
              <VideoPlayer
                src={selectedMovie.stream_url}
                type="application/x-mpegURL"
                autoplay
                controls
                fluid
                onTimeUpdate={handleTimeUpdate}
              />
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Movies;