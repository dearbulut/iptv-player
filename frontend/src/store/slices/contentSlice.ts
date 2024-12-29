import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ContentItem {
  id: string;
  title: string;
  poster_url: string;
  content_type: 'live' | 'movie' | 'series';
  category_name?: string;
  description?: string;
  duration?: number;
  rating?: string;
  release_date?: string;
}

interface ContentState {
  liveStreams: ContentItem[];
  movies: ContentItem[];
  series: ContentItem[];
  favorites: ContentItem[];
  watchHistory: ContentItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ContentState = {
  liveStreams: [],
  movies: [],
  series: [],
  favorites: [],
  watchHistory: [],
  isLoading: false,
  error: null,
};

const contentSlice = createSlice({
  name: 'content',
  initialState,
  reducers: {
    setLiveStreams: (state, action: PayloadAction<ContentItem[]>) => {
      state.liveStreams = action.payload;
    },
    setMovies: (state, action: PayloadAction<ContentItem[]>) => {
      state.movies = action.payload;
    },
    setSeries: (state, action: PayloadAction<ContentItem[]>) => {
      state.series = action.payload;
    },
    setFavorites: (state, action: PayloadAction<ContentItem[]>) => {
      state.favorites = action.payload;
    },
    setWatchHistory: (state, action: PayloadAction<ContentItem[]>) => {
      state.watchHistory = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearContent: (state) => {
      state.liveStreams = [];
      state.movies = [];
      state.series = [];
      state.favorites = [];
      state.watchHistory = [];
    },
  },
});

export const {
  setLiveStreams,
  setMovies,
  setSeries,
  setFavorites,
  setWatchHistory,
  setLoading,
  setError,
  clearContent,
} = contentSlice.actions;

export default contentSlice.reducer;