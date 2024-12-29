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
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Collapse,
  Stack,
  Chip,
} from '@mui/material';
import {
  Search,
  Close,
  ExpandLess,
  ExpandMore,
  PlayArrow,
} from '@mui/icons-material';
import { RootState } from '../store';
import { content } from '../services/api';
import { setSeries, setWatchHistory } from '../store/slices/contentSlice';
import ContentCard from '../components/ContentCard';
import VideoPlayer from '../components/VideoPlayer';
import { ContentItem } from '../store/slices/contentSlice';

interface Episode {
  id: string;
  title: string;
  episode: number;
  stream_url: string;
  duration?: number;
}

interface Season {
  season_number: number;
  episodes: Episode[];
}

interface SeriesInfo extends ContentItem {
  seasons: Season[];
  plot?: string;
  cast?: string;
  director?: string;
  genre?: string;
  release_date?: string;
  rating?: string;
}

const Series = () => {
  const dispatch = useDispatch();
  const { series, favorites, watchHistory } = useSelector((state: RootState) => state.content);
  const [selectedSeries, setSelectedSeries] = useState<SeriesInfo | null>(null);
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('title');
  const [expandedSeasons, setExpandedSeasons] = useState<number[]>([]);
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const response = await content.getSeries();
        dispatch(setSeries(response.data));

        // Extract unique categories
        const uniqueCategories = [...new Set(response.data.map((show: ContentItem) => show.category_name))];
        setCategories(['all', ...uniqueCategories.filter(Boolean)]);
      } catch (error) {
        console.error('Error fetching series:', error);
      }
    };

    fetchSeries();
  }, [dispatch]);

  const handleSeriesSelect = async (show: ContentItem) => {
    try {
      const response = await content.getSeriesInfo(show.id);
      setSelectedSeries({ ...show, ...response.data });
      // Expand the first season by default
      if (response.data.seasons?.length > 0) {
        setExpandedSeasons([response.data.seasons[0].season_number]);
      }
    } catch (error) {
      console.error('Error fetching series info:', error);
    }
  };

  const handleClose = () => {
    setSelectedSeries(null);
    setSelectedEpisode(null);
    setExpandedSeasons([]);
    setCurrentTab(0);
  };

  const handleFavoriteClick = async (show: ContentItem) => {
    try {
      const isFavorite = favorites.some(fav => fav.id === show.id);
      if (isFavorite) {
        await content.removeFromFavorites(show.id);
      } else {
        await content.addToFavorites({
          content_id: show.id,
          content_type: 'series',
          title: show.title,
          poster_url: show.poster_url,
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
    if (selectedSeries && selectedEpisode) {
      try {
        await content.updateWatchHistory({
          content_id: selectedEpisode.id,
          content_type: 'series',
          title: `${selectedSeries.title} S${selectedSeries.seasons.find(s => 
            s.episodes.some(e => e.id === selectedEpisode.id)
          )?.season_number}E${selectedEpisode.episode}`,
          watched_duration: currentTime,
          total_duration: duration,
          season_number: selectedSeries.seasons.find(s => 
            s.episodes.some(e => e.id === selectedEpisode.id)
          )?.season_number,
          episode_number: selectedEpisode.episode,
          poster_url: selectedSeries.poster_url,
        });
        
        // Refresh watch history
        const historyResponse = await content.getWatchHistory();
        dispatch(setWatchHistory(historyResponse.data));
      } catch (error) {
        console.error('Error updating watch history:', error);
      }
    }
  };

  const toggleSeason = (seasonNumber: number) => {
    setExpandedSeasons(prev =>
      prev.includes(seasonNumber)
        ? prev.filter(num => num !== seasonNumber)
        : [...prev, seasonNumber]
    );
  };

  const filteredAndSortedSeries = series
    .filter(show => {
      const matchesSearch = show.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = category === 'all' || show.category_name === category;
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
        TV Series
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search series..."
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
        {filteredAndSortedSeries.map((show) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={show.id}>
            <ContentCard
              item={show}
              isFavorite={favorites.some(fav => fav.id === show.id)}
              onFavoriteClick={() => handleFavoriteClick(show)}
              onClick={() => handleSeriesSelect(show)}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog
        fullWidth
        maxWidth="md"
        open={!!selectedSeries}
        onClose={handleClose}
      >
        {selectedSeries && (
          <>
            <DialogTitle>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6">{selectedSeries.title}</Typography>
                <IconButton onClick={handleClose}>
                  <Close />
                </IconButton>
              </Box>
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                {selectedSeries.release_date && (
                  <Chip label={new Date(selectedSeries.release_date).getFullYear()} />
                )}
                {selectedSeries.rating && (
                  <Chip label={`Rating: ${selectedSeries.rating}`} />
                )}
                {selectedSeries.genre && (
                  <Chip label={selectedSeries.genre} />
                )}
              </Stack>
            </DialogTitle>
            <DialogContent>
              {selectedEpisode ? (
                <Box sx={{ bgcolor: 'black' }}>
                  <VideoPlayer
                    src={selectedEpisode.stream_url}
                    type="application/x-mpegURL"
                    autoplay
                    controls
                    fluid
                    onTimeUpdate={handleTimeUpdate}
                  />
                  <Box sx={{ mt: 2 }}>
                    <IconButton onClick={() => setSelectedEpisode(null)}>
                      <Close />
                    </IconButton>
                  </Box>
                </Box>
              ) : (
                <>
                  <Tabs
                    value={currentTab}
                    onChange={(_, newValue) => setCurrentTab(newValue)}
                    sx={{ mb: 2 }}
                  >
                    <Tab label="Episodes" />
                    <Tab label="Details" />
                  </Tabs>

                  {currentTab === 0 && (
                    <List>
                      {selectedSeries.seasons?.map((season) => (
                        <Box key={season.season_number}>
                          <ListItemButton onClick={() => toggleSeason(season.season_number)}>
                            <ListItemText primary={`Season ${season.season_number}`} />
                            {expandedSeasons.includes(season.season_number) ? <ExpandLess /> : <ExpandMore />}
                          </ListItemButton>
                          <Collapse in={expandedSeasons.includes(season.season_number)}>
                            <List component="div" disablePadding>
                              {season.episodes.map((episode) => (
                                <ListItem
                                  key={episode.id}
                                  secondaryAction={
                                    <IconButton edge="end" onClick={() => setSelectedEpisode(episode)}>
                                      <PlayArrow />
                                    </IconButton>
                                  }
                                  sx={{ pl: 4 }}
                                >
                                  <ListItemText
                                    primary={`Episode ${episode.episode}: ${episode.title}`}
                                    secondary={episode.duration ? `${Math.floor(episode.duration / 60)}min` : undefined}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Collapse>
                        </Box>
                      ))}
                    </List>
                  )}

                  {currentTab === 1 && (
                    <Box>
                      {selectedSeries.plot && (
                        <>
                          <Typography variant="h6" gutterBottom>Plot</Typography>
                          <Typography paragraph>{selectedSeries.plot}</Typography>
                        </>
                      )}
                      {selectedSeries.cast && (
                        <>
                          <Typography variant="h6" gutterBottom>Cast</Typography>
                          <Typography paragraph>{selectedSeries.cast}</Typography>
                        </>
                      )}
                      {selectedSeries.director && (
                        <>
                          <Typography variant="h6" gutterBottom>Director</Typography>
                          <Typography paragraph>{selectedSeries.director}</Typography>
                        </>
                      )}
                    </Box>
                  )}
                </>
              )}
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Series;