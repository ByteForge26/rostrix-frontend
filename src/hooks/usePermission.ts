import { useLocation, useNavigate } from "react-router-dom";
import { store, useAppDispatch, useAppSelector } from "../app/store/store";
import {
  IPermissionResponse,
  IRoute,
  IUserTransformedPermissions,
} from "../helper/Interface";
import { updateRedirectPath } from "../app/slice/root.slice";
import { ROUTES } from "../config/routes.config";
import { useEffect } from "react";

const usePermission = () => {
  const { userTransformedPermissions } = useAppSelector((state) => state.auth);
  const { pathname, state } = useLocation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  useEffect(() => {
    if (pathname.split("/").length > 2) {
      dispatch(updateRedirectPath(pathname));
    }
  }, [pathname]);
  useEffect(() => {
    const redirectPath = store?.getState()?.root?.redirectPath;
    if (
      userTransformedPermissions?.length &&
      pathname !== redirectPath &&
      pathname === "/home" &&
      !state
    ) {
      let isActivePath = false;

      if (redirectPath) {
        transformRoutes(ROUTES).forEach(({ children, path: parentPath }) => {
          if (children?.length && !isActivePath) {
            children.forEach(({ path }) => {
              if (`/${parentPath}/${path}` === redirectPath && !isActivePath) {
                isActivePath = true;
              }
            });
          }
        });
        if (isActivePath) {
          navigate(redirectPath);
        }
        dispatch(updateRedirectPath(""));
      }
    }
  }, [userTransformedPermissions]);
  const migratePermissions = (permissions: IPermissionResponse[]) => {
    const data: Record<string, Record<string, Record<string, string>>> = {};
    if (permissions?.length) {
      permissions.forEach(({ category, name, subCategory }) => {
        if (!data[category]) {
          data[category] = {
            [subCategory]: {
              [name]: `${category}_${subCategory}_${name}`,
            },
          };
        } else if (!data[category][subCategory]) {
          data[category][subCategory] = {
            [name]: `${category}_${subCategory}_${name}`,
          };
        } else {
          data[category][subCategory][name] =
            `${category}_${subCategory}_${name}`;
        }
      });
    }
    console.log(data);
  };
  const filterPermission = (arr: IPermissionResponse[]) => {
    return arr.filter(
      ({ name, subCategory }) => name !== "All" && subCategory !== "All",
    );
  };
  const transformPermissions = (permissions: IPermissionResponse[]) => {
    let finalPermissions: IUserTransformedPermissions[] = [];
    if (permissions?.length) {
      filterPermission(permissions).forEach(
        ({ category, subCategory, name, id }) => {
          const indexOfCategory = finalPermissions.findIndex(
            (obj) => obj.category === category,
          );
          if (indexOfCategory >= 0) {
            const indexOfSubCategory = finalPermissions[
              indexOfCategory
            ].subCategories.findIndex((obj) => obj.subCategory === subCategory);
            if (indexOfSubCategory >= 0) {
              finalPermissions[indexOfCategory].subCategories[
                indexOfSubCategory
              ].permissions.push({
                id,
                name,
              });
            } else {
              finalPermissions[indexOfCategory].subCategories.push({
                permissions: [{ id, name }],
                subCategory,
              });
            }
          } else {
            finalPermissions.push({
              category,
              subCategories: [
                {
                  permissions: [{ id, name }],
                  subCategory,
                },
              ],
            });
          }
        },
      );
    }

    return finalPermissions;
  };
  const checkForPermission = (
    key: string,
    userTransformedPermissionsTemp?: IUserTransformedPermissions[],
  ) => {
    const permissions =
      userTransformedPermissionsTemp || userTransformedPermissions;
    const [category, subCategory, name] = key.split("_");
    let isAuthorise = false;
    if (permissions?.length) {
      let permissionObj = permissions.find((obj) => obj.category === category);
      if (permissionObj) {
        // if (permissionObj.isGlobalPermissionForCategory) {
        //   isAuthorise = true;
        // } else {
        const permissionSubCategoriesObj = permissionObj.subCategories.find(
          (obj) => obj.subCategory === subCategory,
        );
        if (permissionSubCategoriesObj) {
          // if (permissionSubCategoriesObj.isGlobalPermissionForSubCategory) {
          //   isAuthorise = true;
          // } else {
          isAuthorise =
            permissionSubCategoriesObj.permissions.findIndex(
              (obj) => obj.name.toLowerCase() === name.toLowerCase(),
            ) >= 0;
        }
        // }
        // }
      }
    }
    return isAuthorise;
  };
  const transformRoutes = (routes: IRoute[]) => {
    return routes.filter(({ children }) => {
      return children
        .filter(({ isActive }) => isActive)
        .filter(({ permissionKey }) => checkForPermission(permissionKey))
        .length;
    });
  };
  return {
    transformPermissions,
    checkForPermission,
    migratePermissions,
    transformRoutes,
    filterPermission,
  };
};
export { usePermission };
