import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./redux/store.js";

import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { ToastContainer } from "react-toastify";
import { SocketProvider } from "./context/SocketContext.jsx";

let persistor = persistStore(store);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <PersistGate loading={null} persistor={persistor}>
      <Provider store={store}>
        <SocketProvider>
          <App />
          <ToastContainer />
        </SocketProvider>
      </Provider>
    </PersistGate>
  </StrictMode>
);
