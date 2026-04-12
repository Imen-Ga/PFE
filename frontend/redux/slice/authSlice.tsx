import { createSlice } from '@reduxjs/toolkit'
const initialState = {
  userInfo: null,
}
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    addCurrentUserInfo: (state, action) => {
      state.userInfo = action.payload
    },
    logout: (state) => {
      state.userInfo = null
    }
  }
})
// Export des actions
export const { addCurrentUserInfo, logout } = authSlice.actions
// Export du reducer
export default authSlice.reducer
