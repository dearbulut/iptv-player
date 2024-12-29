import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import contentReducer from './slices/contentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    content: contentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;