import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  styled,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  Today,
  AccessTime,
} from '@mui/icons-material';
import { format, addHours, subHours, isWithinInterval } from 'date-fns';

interface Program {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  channel_id: string;
}

interface Channel {
  id: string;
  name: string;
  icon?: string;
  programs: Program[];
}

interface EPGGuideProps {
  channels: Channel[];
  onProgramClick?: (program: Program) => void;
  currentChannelId?: string;
}

const HOURS_TO_SHOW = 4;
const PROGRAM_MIN_WIDTH = 120;
const CHANNEL_WIDTH = 200;
const TIME_SLOT_HEIGHT = 60;

const EPGContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  overflow: 'hidden',
  backgroundColor: theme.palette.background.paper,
}));

const TimelineHeader = styled(Box)(({ theme }) => ({
  position: 'sticky',
  top: 0,
  zIndex: 2,
  backgroundColor: theme.palette.background.paper,
  borderBottom: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
}));

const ChannelList = styled(Box)(({ theme }) => ({
  position: 'sticky',
  left: 0,
  zIndex: 1,
  backgroundColor: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.divider}`,
  width: CHANNEL_WIDTH,
}));

const ProgramsGrid = styled(Box)({
  position: 'relative',
  overflow: 'auto',
  flex: 1,
});

const Program = styled(Paper, {
  shouldForwardProp: (prop) => prop !== 'isLive' && prop !== 'width',
})<{ isLive?: boolean; width: number }>(({ theme, isLive, width }) => ({
  position: 'absolute',
  height: TIME_SLOT_HEIGHT - 4,
  width: Math.max(width, PROGRAM_MIN_WIDTH),
  margin: 2,
  padding: theme.spacing(1),
  cursor: 'pointer',
  transition: 'transform 0.2s',
  backgroundColor: isLive ? theme.palette.primary.dark : theme.palette.background.default,
  '&:hover': {
    transform: 'scale(1.02)',
    zIndex: 1,
  },
}));

const EPGGuide: React.FC<EPGGuideProps> = ({
  channels,
  onProgramClick,
  currentChannelId,
}) => {
  const [startTime, setStartTime] = useState(new Date());
  const [nowIndicatorLeft, setNowIndicatorLeft] = useState(0);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateNowIndicator = () => {
      const now = new Date();
      const diffInMinutes = (now.getTime() - startTime.getTime()) / (1000 * 60);
      const pixelsPerMinute = (PROGRAM_MIN_WIDTH * HOURS_TO_SHOW * 60) / (HOURS_TO_SHOW * 60);
      setNowIndicatorLeft(diffInMinutes * pixelsPerMinute);
    };

    updateNowIndicator();
    const interval = setInterval(updateNowIndicator, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [startTime]);

  const handleTimeNavigate = (direction: 'back' | 'forward') => {
    setStartTime(prev =>
      direction === 'back' ? subHours(prev, HOURS_TO_SHOW) : addHours(prev, HOURS_TO_SHOW)
    );
  };

  const handleJumpToNow = () => {
    setStartTime(new Date());
    if (gridRef.current) {
      gridRef.current.scrollLeft = nowIndicatorLeft - CHANNEL_WIDTH;
    }
  };

  const getTimeSlots = () => {
    const slots = [];
    for (let i = 0; i < HOURS_TO_SHOW; i++) {
      const time = addHours(startTime, i);
      slots.push(time);
    }
    return slots;
  };

  const getProgramStyle = (program: Program) => {
    const start = new Date(program.start_time);
    const end = new Date(program.end_time);
    const timelineStart = startTime;
    const timelineEnd = addHours(startTime, HOURS_TO_SHOW);

    if (end < timelineStart || start > timelineEnd) {
      return null;
    }

    const startPosition = Math.max(0, (start.getTime() - timelineStart.getTime()) / (1000 * 60));
    const duration = (end.getTime() - start.getTime()) / (1000 * 60);
    const pixelsPerMinute = (PROGRAM_MIN_WIDTH * HOURS_TO_SHOW * 60) / (HOURS_TO_SHOW * 60);

    return {
      left: startPosition * pixelsPerMinute,
      width: duration * pixelsPerMinute,
    };
  };

  const isLiveProgram = (program: Program) => {
    const now = new Date();
    return isWithinInterval(now, {
      start: new Date(program.start_time),
      end: new Date(program.end_time),
    });
  };

  return (
    <EPGContainer>
      <TimelineHeader>
        <Box sx={{ width: CHANNEL_WIDTH, p: 1, display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => handleTimeNavigate('back')}>
            <NavigateBefore />
          </IconButton>
          <IconButton onClick={handleJumpToNow}>
            <Today />
          </IconButton>
          <IconButton onClick={() => handleTimeNavigate('forward')}>
            <NavigateNext />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', flex: 1, borderLeft: 1, borderColor: 'divider' }}>
          {getTimeSlots().map((time, index) => (
            <Box
              key={index}
              sx={{
                width: PROGRAM_MIN_WIDTH * 2,
                p: 1,
                borderRight: 1,
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography variant="body2">
                {format(time, 'HH:mm')}
              </Typography>
            </Box>
          ))}
        </Box>
      </TimelineHeader>

      <Box sx={{ display: 'flex', height: 'calc(100% - 48px)' }}>
        <ChannelList>
          {channels.map((channel) => (
            <Box
              key={channel.id}
              sx={{
                height: TIME_SLOT_HEIGHT,
                p: 1,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                bgcolor: channel.id === currentChannelId ? 'action.selected' : 'inherit',
              }}
            >
              {channel.icon && (
                <Box
                  component="img"
                  src={channel.icon}
                  alt={channel.name}
                  sx={{ width: 24, height: 24, mr: 1 }}
                />
              )}
              <Typography noWrap>{channel.name}</Typography>
            </Box>
          ))}
        </ChannelList>

        <ProgramsGrid ref={gridRef}>
          <Box sx={{ position: 'relative', height: channels.length * TIME_SLOT_HEIGHT }}>
            {/* Now indicator line */}
            {nowIndicatorLeft > 0 && (
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: nowIndicatorLeft,
                  width: 2,
                  height: '100%',
                  bgcolor: 'error.main',
                  zIndex: 1,
                }}
              />
            )}

            {channels.map((channel, channelIndex) => (
              <Box
                key={channel.id}
                sx={{
                  position: 'absolute',
                  top: channelIndex * TIME_SLOT_HEIGHT,
                  left: 0,
                  right: 0,
                  height: TIME_SLOT_HEIGHT,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                {channel.programs.map((program) => {
                  const style = getProgramStyle(program);
                  if (!style) return null;

                  return (
                    <Program
                      key={program.id}
                      width={style.width}
                      isLive={isLiveProgram(program)}
                      sx={{ left: style.left }}
                      onClick={() => onProgramClick?.(program)}
                    >
                      <Tooltip title={program.description || program.title}>
                        <Box>
                          <Typography variant="subtitle2" noWrap>
                            {program.title}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {format(new Date(program.start_time), 'HH:mm')} -{' '}
                            {format(new Date(program.end_time), 'HH:mm')}
                          </Typography>
                          {isLiveProgram(program) && (
                            <LinearProgress
                              variant="determinate"
                              value={
                                ((new Date().getTime() - new Date(program.start_time).getTime()) /
                                  (new Date(program.end_time).getTime() -
                                    new Date(program.start_time).getTime())) *
                                100
                              }
                              sx={{ mt: 1 }}
                            />
                          )}
                        </Box>
                      </Tooltip>
                    </Program>
                  );
                })}
              </Box>
            ))}
          </Box>
        </ProgramsGrid>
      </Box>
    </EPGContainer>
  );
};

export default EPGGuide;