import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Button,
} from '@mui/material';
import { Close as CloseIcon, PlayArrow as PlayArrowIcon } from '@mui/icons-material';
import EPGGuide from './EPGGuide';
import { ContentItem } from '../store/slices/contentSlice';

interface EPGModalProps {
  open: boolean;
  onClose: () => void;
  channels: ContentItem[];
  currentChannelId?: string;
  onChannelSelect?: (channel: ContentItem) => void;
}

const EPGModal: React.FC<EPGModalProps> = ({
  open,
  onClose,
  channels,
  currentChannelId,
  onChannelSelect,
}) => {
  // Transform channels data for EPG format
  const epgChannels = channels.map(channel => ({
    id: channel.id,
    name: channel.title,
    icon: channel.icon_url,
    programs: channel.epg_data || [],
  }));

  const handleProgramClick = (program: any) => {
    const channel = channels.find(c => c.id === program.channel_id);
    if (channel) {
      onChannelSelect?.(channel);
    }
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">TV Guide</Typography>
          <IconButton edge="end" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ height: 'calc(100vh - 64px)' }}>
          <EPGGuide
            channels={epgChannels}
            onProgramClick={handleProgramClick}
            currentChannelId={currentChannelId}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default EPGModal;