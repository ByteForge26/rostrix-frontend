import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ChakraProvider } from "@chakra-ui/react";
import { persistStore } from "redux-persist";
import { store } from "./app/store/store";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastProvider } from "react-toast-notifications";
import "../src/style/style.scss";
import theme from "./helper/theme";
import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
const persistor = persistStore(store);
root.render(
  <ChakraProvider theme={theme}>
    <ToastProvider autoDismiss autoDismissTimeout={6500}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <DndProvider backend={HTML5Backend}>
            <App />
          </DndProvider>
        </PersistGate>
      </Provider>
    </ToastProvider>
  </ChakraProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
