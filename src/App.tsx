import { createTheme, MuiThemeProvider } from "@material-ui/core";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import Login from "./components/auth/login";
import SignUp from "./components/auth/signup";
import Home from "./components/home/home";
import { ProtectedRoute } from "./utils/protected_route";

const theme = createTheme({
  palette: {
    primary: {
      light: "#FF5722",
      main: "#33c9dc",
      dark: "#d50000",
      contrastText: "#fff",
    },
  },
});

export const App = () => (
  <MuiThemeProvider theme={theme}>
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  </MuiThemeProvider>
);
