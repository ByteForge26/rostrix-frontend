import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Login from "./views/login/Login";
import { useAppSelector } from "./app/store/store";
import { ROUTES } from "./config/routes.config";
import MyProfile from "./views/profile/MyProfile";
import { usePermission } from "./hooks/usePermission";
import Home from "./views/home/Home";

function AppRoutes() {
  const { isLoggedIn, accessToken } = useAppSelector((state) => state.auth);
  const { checkForPermission, transformRoutes } = usePermission();
  const PrivateRoutes = () => {
    return isLoggedIn && accessToken ? (
      <Outlet />
    ) : (
      <Navigate to={"/login"} replace />
    );
  };
  const defaultHomePath = "/home";
  const loginPath = "login";

  return (
    <Routes>
      <Route
        path="/"
        element={
          isLoggedIn && accessToken ? (
            <Navigate to={defaultHomePath} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route
        path={loginPath}
        element={
          isLoggedIn && accessToken ? (
            <Navigate to={defaultHomePath} replace />
          ) : (
            <Login />
          )
        }
      />
      <Route path={":code"} element={<Login />} />

      <Route path="/" element={<PrivateRoutes />}>
        <Route path={"home"} element={<Home />} />
        <Route path={"my-profile"} element={<MyProfile />} />
        {transformRoutes(ROUTES).map(({ children, path }, i) => (
          <Route path={path} key={path}>
            {children
              .filter(({ permissionKey }) => checkForPermission(permissionKey))
              .map(({ path, Component, permissionKey }, j) => (
                <Route
                  path={path}
                  element={<Component />}
                  key={`${path}_${permissionKey}`}
                />
              ))}
          </Route>
        ))}
      </Route>
      <Route path="*" element={<Navigate to={defaultHomePath} replace />} />
    </Routes>
  );
}

export default AppRoutes;
