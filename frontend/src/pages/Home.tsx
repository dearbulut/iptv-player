import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
} from '@mui/material';
import { LiveTv, Movie, Tv } from '@mui/icons-material';
import { RootState } from '../store';
import { content } from '../services/api';
import {
  setLiveStreams,
  setMovies,
  setSeries,
  setWatchHistory,
} from '../store/slices/contentSlice';

const Home = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { watchHistory } = useSelector((state: RootState) => state.content);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [liveRes, moviesRes, seriesRes, historyRes] = await Promise.all([
          content.getLiveStreams(),
          content.getMovies(),
          content.getSeries(),
          content.getWatchHistory(),
        ]);

        dispatch(setLiveStreams(liveRes.data));
        dispatch(setMovies(moviesRes.data));
        dispatch(setSeries(seriesRes.data));
        dispatch(setWatchHistory(historyRes.data));
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchData();
  }, [dispatch]);

  const sections = [
    {
      title: 'Live TV',
      icon: <LiveTv sx={{ fontSize: 40 }} />,
      path: '/live',
      color: '#1976d2',
    },
    {
      title: 'Movies',
      icon: <Movie sx={{ fontSize: 40 }} />,
      path: '/movies',
      color: '#dc004e',
    },
    {
      title: 'Series',
      icon: <Tv sx={{ fontSize: 40 }} />,
      path: '/series',
      color: '#388e3c',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome back, {user?.username}!
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {sections.map((section) => (
          <Grid item xs={12} sm={4} key={section.title}>
            <Card
              sx={{
                height: '100%',
                bgcolor: section.color,
                color: 'white',
              }}
            >
              <CardActionArea
                onClick={() => navigate(section.path)}
                sx={{ height: '100%' }}
              >
                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    py: 4,
                  }}
                >
                  {section.icon}
                  <Typography variant="h6" sx={{ mt: 2 }}>
                    {section.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {watchHistory.length > 0 && (
        <>
          <Typography variant="h5" gutterBottom>
            Continue Watching
          </Typography>
          <Grid container spacing={2}>
            {watchHistory.slice(0, 6).map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                <Card>
                  <CardActionArea>
                    <CardContent>
                      <Typography variant="h6" noWrap>
                        {item.title}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Home;