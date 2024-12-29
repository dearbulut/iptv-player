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
  Button,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Search,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
  LiveTv as LiveTvIcon,
  Schedule as ScheduleIcon,
  ViewQuilt as ViewQuiltIcon,
} from '@mui/icons-material';
import EPGModal from '../components/EPGModal';
import MultiScreen from '../components/MultiScreen';
import { RootState } from '../store';
import { content } from '../services/api';
import { setLiveStreams } from '../store/slices/contentSlice';
import ContentCard from '../components/ContentCard';
import VideoPlayer from '../components/VideoPlayer';
import { ContentItem } from '../store/slices/contentSlice';

type ViewMode = 'grid' | 'list' | 'multiscreen';

const LiveTV = () => {
  const dispatch = useDispatch();
  const { liveStreams, favorites } = useSelector((state: RootState) => state.content);
  const [selectedStream, setSelectedStream] = useState<ContentItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isEpgOpen, setIsEpgOpen] = useState(false);

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
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="h4">Live TV</Typography>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          variant="outlined"
          startIcon={<ScheduleIcon />}
          onClick={() => setIsEpgOpen(true)}
        >
          TV Guide
        </Button>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && setViewMode(newMode)}
          size="small"
        >
          <ToggleButton value="grid">
            <ViewModuleIcon />
          </ToggleButton>
          <ToggleButton value="list">
            <ViewListIcon />
          </ToggleButton>
          <ToggleButton value="multiscreen">
            <ViewQuiltIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

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

      {viewMode === 'multiscreen' ? (
        <MultiScreen
          maxScreens={4}
          availableContent={filteredStreams}
          onContentSelect={(content, screenId) => {
            console.log(`Selected ${content.title} for screen ${screenId}`);
          }}
        />
      ) : (
        <Grid container spacing={2}>
          {filteredStreams.map((stream) => (
            <Grid
              item
              xs={12}
              sm={viewMode === 'list' ? 12 : 6}
              md={viewMode === 'list' ? 12 : 4}
              lg={viewMode === 'list' ? 12 : 3}
              key={stream.id}
            >
              {viewMode === 'list' ? (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    bgcolor: 'background.paper',
                    borderRadius: 1,
                  }}
                >
                  <LiveTvIcon />
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">{stream.title}</Typography>
                    {stream.category_name && (
                      <Typography variant="body2" color="text.secondary">
                        {stream.category_name}
                      </Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => handleStreamSelect(stream)}
                  >
                    Watch
                  </Button>
                </Box>
              ) : (
                <ContentCard
                  item={stream}
                  isFavorite={favorites.some(fav => fav.id === stream.id)}
                  onFavoriteClick={() => handleFavoriteClick(stream)}
                  onClick={() => handleStreamSelect(stream)}
                />
              )}
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        fullWidth
        maxWidth="md"
        open={!!selectedStream && viewMode !== 'multiscreen'}
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

      <EPGModal
        open={isEpgOpen}
        onClose={() => setIsEpgOpen(false)}
        channels={liveStreams}
        currentChannelId={selectedStream?.id}
        onChannelSelect={(channel) => {
          setSelectedStream(channel);
          setIsEpgOpen(false);
        }}
      />
    </Box>
  );
};

export default LiveTV;