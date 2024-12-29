import { useState, useCallback } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  styled,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
  Fullscreen as FullscreenIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import VideoPlayer from './VideoPlayer';
import { ContentItem } from '../store/slices/contentSlice';

interface Screen {
  id: string;
  content?: ContentItem;
}

interface MultiScreenProps {
  maxScreens?: number;
  availableContent: ContentItem[];
  onContentSelect?: (content: ContentItem, screenId: string) => void;
}

const ScreenContainer = styled(Paper)(({ theme }) => ({
  position: 'relative',
  aspectRatio: '16/9',
  backgroundColor: theme.palette.background.default,
  overflow: 'hidden',
}));

const ScreenControls = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  right: 0,
  padding: theme.spacing(1),
  display: 'flex',
  gap: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  opacity: 0,
  transition: 'opacity 0.2s',
  '&:hover': {
    opacity: 1,
  },
}));

const EmptyScreen = styled(Box)(({ theme }) => ({
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  cursor: 'pointer',
}));

const MultiScreen: React.FC<MultiScreenProps> = ({
  maxScreens = 4,
  availableContent,
  onContentSelect,
}) => {
  const [screens, setScreens] = useState<Screen[]>([{ id: '1' }]);
  const [activeScreen, setActiveScreen] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [isLayoutDialogOpen, setIsLayoutDialogOpen] = useState(false);
  const [fullscreenScreen, setFullscreenScreen] = useState<string | null>(null);

  const handleAddScreen = useCallback(() => {
    if (screens.length < maxScreens) {
      setScreens(prev => [...prev, { id: String(prev.length + 1) }]);
    }
  }, [screens.length, maxScreens]);

  const handleRemoveScreen = useCallback((screenId: string) => {
    setScreens(prev => prev.filter(screen => screen.id !== screenId));
    if (activeScreen === screenId) {
      setActiveScreen(null);
    }
  }, [activeScreen]);

  const handleScreenClick = useCallback((screenId: string) => {
    setActiveScreen(screenId);
  }, []);

  const handleContentSelect = useCallback((content: ContentItem) => {
    if (activeScreen) {
      setScreens(prev =>
        prev.map(screen =>
          screen.id === activeScreen
            ? { ...screen, content }
            : screen
        )
      );
      onContentSelect?.(content, activeScreen);
      setActiveScreen(null);
    }
    setAnchorEl(null);
  }, [activeScreen, onContentSelect]);

  const handleLayoutChange = useCallback((layout: number) => {
    const newScreens: Screen[] = Array.from({ length: layout }, (_, i) => ({
      id: String(i + 1),
      content: screens[i]?.content,
    }));
    setScreens(newScreens);
    setIsLayoutDialogOpen(false);
  }, [screens]);

  const getGridConfig = useCallback((totalScreens: number) => {
    switch (totalScreens) {
      case 1:
        return { cols: 1, rows: 1 };
      case 2:
        return { cols: 2, rows: 1 };
      case 3:
      case 4:
        return { cols: 2, rows: 2 };
      default:
        return { cols: 1, rows: 1 };
    }
  }, []);

  const renderScreen = useCallback((screen: Screen) => {
    if (!screen.content) {
      return (
        <EmptyScreen onClick={() => handleScreenClick(screen.id)}>
          <AddIcon sx={{ fontSize: 40, mb: 1 }} />
          <Typography variant="body2">Click to add content</Typography>
        </EmptyScreen>
      );
    }

    return (
      <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
        <VideoPlayer
          src={screen.content.stream_url}
          type="application/x-mpegURL"
          autoplay
          controls
          fluid
        />
        <ScreenControls>
          <IconButton
            size="small"
            onClick={() => setFullscreenScreen(screen.id)}
          >
            <FullscreenIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => handleRemoveScreen(screen.id)}
          >
            <CloseIcon />
          </IconButton>
        </ScreenControls>
      </Box>
    );
  }, [handleRemoveScreen]);

  const { cols, rows } = getGridConfig(screens.length);

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
        {screens.length < maxScreens && (
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleAddScreen}
          >
            Add Screen
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<SettingsIcon />}
          onClick={() => setIsLayoutDialogOpen(true)}
        >
          Change Layout
        </Button>
      </Box>

      <Grid container spacing={1} sx={{ aspectRatio: '16/9' }}>
        {screens.map((screen) => (
          <Grid
            key={screen.id}
            item
            xs={12 / cols}
            sx={{ height: `${100 / rows}%` }}
          >
            <ScreenContainer>
              {renderScreen(screen)}
            </ScreenContainer>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {availableContent.map((content) => (
          <MenuItem
            key={content.id}
            onClick={() => handleContentSelect(content)}
          >
            {content.title}
          </MenuItem>
        ))}
      </Menu>

      <Dialog
        open={isLayoutDialogOpen}
        onClose={() => setIsLayoutDialogOpen(false)}
      >
        <DialogTitle>Choose Layout</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {[1, 2, 4].map((layout) => (
              <Grid item xs={4} key={layout}>
                <Paper
                  sx={{
                    p: 2,
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                  onClick={() => handleLayoutChange(layout)}
                >
                  <Typography>{layout} Screen{layout > 1 ? 's' : ''}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsLayoutDialogOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullScreen
        open={!!fullscreenScreen}
        onClose={() => setFullscreenScreen(null)}
      >
        <DialogContent sx={{ p: 0, bgcolor: 'black' }}>
          {fullscreenScreen && (
            <Box sx={{ height: '100%' }}>
              {renderScreen(
                screens.find(s => s.id === fullscreenScreen) || { id: '1' }
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default MultiScreen;