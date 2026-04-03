import { createSlice } from '@reduxjs/toolkit'
const initialState = {
  userInfo: null,
}
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    loginSuccess: (state, action) => {
      state.userInfo = action.payload
    },
    logout: (state) => {
      state.userInfo = null
    }
  }
})
// Export des actions
export const { loginSuccess, logout } = userSlice.actions
// Export du reducer
export default userSlice.reducer
