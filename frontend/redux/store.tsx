// store/index.js
import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/slice/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,      // Gère l'état utilisateur
  }
})
