import storageSession from "redux-persist/lib/storage/session";
import storageLocal from "redux-persist/lib/storage";
const DB_VERSION = "0.1.0";

export const rootPersistConfig = {
  key: `ROOT_${process.env.REACT_APP_ENV}_${DB_VERSION}`,
  storage: storageSession,
};
export const authPersistConfig = {
  key: `AUTH_${process.env.REACT_APP_ENV}_${DB_VERSION}`,
  storage: storageLocal,
};
