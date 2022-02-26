import { Navigate, Route } from "react-router-dom";

import Login from "../components/auth/login";

export const ProtectedRoute = (props: any) => {
  const isUserLoggedIn = Boolean(localStorage.getItem("AuthToken"));
  return isUserLoggedIn ? <Route {...props} /> : <Navigate to={"/login"} />;
};
