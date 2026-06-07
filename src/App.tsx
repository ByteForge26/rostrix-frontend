import AppRoutes from "./AppRoutes";
import { BrowserRouter as Router } from "react-router-dom";
import AppUtility from "./components/AppUtility";

function App() {
  return (
    <Router>
      <AppUtility />
      <AppRoutes />
    </Router>
  );
}

export default App;
