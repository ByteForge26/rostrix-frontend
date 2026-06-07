import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";
import {
  authPersistConfig,
  rootPersistConfig,
} from "../../config/store.config";
import { authReducer } from "../slice/auth.slice";
import { rosterReducer } from "../slice/roster.slice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { rootReducer } from "../slice/root.slice";
import { filterReducer } from "../slice/filter.slice";

const reducers = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  root: rootReducer,
  roster: rosterReducer,
  filter: filterReducer,
});

const persistedReducer = persistReducer(rootPersistConfig, reducers);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (gDM) => gDM({ serializableCheck: false }),
  devTools: process.env.NODE_ENV !== "production",
});

type AppDispatch = typeof store.dispatch;
type RootState = ReturnType<typeof store.getState>;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
