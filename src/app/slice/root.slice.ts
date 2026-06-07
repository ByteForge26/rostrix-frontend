import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface IRoot {
  drawerIndex: number;
  redirectPath: string;
}

const initialState: IRoot = {
  drawerIndex: -1,
  redirectPath: "",
};
const rootSlice = createSlice({
  name: "root",
  initialState: initialState,
  reducers: {
    resetRoot: (state) => {
      state.drawerIndex = -1;
    },
    updateDrawerIndex: (state, action: PayloadAction<number>) => {
      state.drawerIndex = action.payload;
    },
    updateRedirectPath: (state, action: PayloadAction<string>) => {
      state.redirectPath = action.payload;
    },
  },
});

const { reducer } = rootSlice;
const { resetRoot, updateDrawerIndex, updateRedirectPath } = rootSlice.actions;

export {
  reducer as rootReducer,
  resetRoot,
  updateDrawerIndex,
  updateRedirectPath,
};
