import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/store/store";
import {
  FEDID_CLIENTID,
  FEDID_REDIRECT_URI,
  FEDID_RESPONSE_TYPE,
} from "../config/auth.config";
import { useToasts } from "react-toast-notifications";
import { defaultErrorMessage, useApi } from "./useApi";
import { ENDPOINT } from "../config/endpoint.config";
import { AUTHORITY_URL } from "../helper/Constant";
import jwt_decode from "jwt-decode";
import {
  IAuthResponse,
  IContractTypeResponse,
  ICostCenter,
  ICostCenterResponse,
  IEcoMobility,
  IPayrollConfig,
  IPermissionResponse,
  IRoleResponse,
  ITokenExchangeResponse,
  IUserResponse,
} from "../helper/Interface";
import {
  updateAccessToken,
  updateExpiresIn,
  updateUserTransformedPermissions,
  updateRefreshToken,
  updateRoleLevel,
  updateRoles,
  updateSelectedCostCenterName,
  updateUser,
  updateUserRoles,
  updateContractTypes,
  updateEcoMobilitySubmission,
  updateEcoModalOpen,
} from "../app/slice/auth.slice";
import { useState } from "react";
import { useBoolean } from "@chakra-ui/react";
import { usePermission } from "./usePermission";
import { updateDrawerIndex } from "../app/slice/root.slice";
import _, { cloneDeep, uniq } from "lodash";
import { PERMISSION } from "../config/permission.config";
import moment from "moment";

const useLogin = () => {
  const {
    refreshToken,
    selectedCostCenterName,
    userRoles,
    roleLevel,
    ecoMobility,
  } = useAppSelector((state) => state.auth);
  const [isLoading, { on, off }] = useBoolean();
  const { checkForPermission } = usePermission();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { addToast } = useToasts();
  const { get, post } = useApi();
  const { transformPermissions } = usePermission();
  const [email, setEmail] = useState("");
  const onLogin = () => {
    const url =
      AUTHORITY_URL +
      ENDPOINT["/as"]["/authorization.oauth2"] +
      `?client_id=${FEDID_CLIENTID}&response_type=${FEDID_RESPONSE_TYPE}&redirect_uri=${FEDID_REDIRECT_URI}&scope=openid profile email`;
    window.location.href = url;
  };

  const getToken = async (code: string) => {
    const params = new URLSearchParams();
    params.append("grant_type", "authorization_code");
    params.append("client_id", process.env.REACT_APP_FEDID_CLIENTID ?? "");
    params.append("code", code);
    params.append("redirect_uri", FEDID_REDIRECT_URI as string);

    const authRes = await post<IAuthResponse>(
      ENDPOINT["/as"]["/token.oauth2"],
      {
        data: params,
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        baseURL: AUTHORITY_URL,
      }
    );
    if (authRes?.access_token) {
      onTokenExchange(authRes.access_token);
    } else {
      navigate("/", { replace: true });
    }
  };
  const onTokenExchange = async (
    access_token: IAuthResponse["access_token"]
  ) => {
    const tokenExchangeResponse = await get<ITokenExchangeResponse>(
      ENDPOINT["/auth"]["/token-exchange"],
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    if (tokenExchangeResponse?.success) {
      dispatch(updateDrawerIndex(-1));
      getUser({
        accessToken: tokenExchangeResponse.accessToken,
        refreshToken: tokenExchangeResponse.refreshToken,
      });
    } else {
      addToast(tokenExchangeResponse.message, {
        appearance: "error",
      });
    }
  };
  const getUser = async (props: {
    accessToken: string;
    refreshToken: string;
    loginWithRefreshToken?: boolean;
  }) => {
    const { accessToken, refreshToken, loginWithRefreshToken } = props;
    const decode: {
      sub: string;
      roles: Record<string, number[]>;
      iss: string;
      fedID: string;
      jti: string;
      iat: number;
      exp: number;
    } = jwt_decode(accessToken);
    if (decode?.sub) {
      const user = await get<IUserResponse>(
        ENDPOINT["/user"][""] + `/${decode.sub}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      ).catch(() => {
        navigate("/", { replace: true });
      });
      if (user?.userId) {
        let costCenterName =
          loginWithRefreshToken && selectedCostCenterName
            ? selectedCostCenterName
            : Object.keys(user.userRoles) && Object.keys(user.userRoles).length
            ? Object.keys(user.userRoles).includes(user.costCentreName)
              ? user.costCentreName
              : Object.keys(user.userRoles)[0]
            : "";
        if (costCenterName) {
          if (!loginWithRefreshToken) {
            setUser({
              accessToken,
              expiresIn: decode.exp,
              refreshToken,
              user,
            });
            addToast("Login Successful!", {
              appearance: "success",
            });
          }
          if (
            !selectedCostCenterName ||
            selectedCostCenterName !== costCenterName
          ) {
            dispatch(updateSelectedCostCenterName(costCenterName));
          }
          let tempUser = cloneDeep(user);
          if (
            Object.keys(user.userRoles).includes("ALL") &&
            user.userRoles["ALL"] &&
            user.userRoles["ALL"].length
          ) {
            const res = await get<ICostCenterResponse>(
              ENDPOINT["/master"]["/cost-centre"],
              {
                headers: accessToken
                  ? {
                      Authorization: `Bearer ${accessToken}`,
                    }
                  : {},
              }
            );
            let costCenters =
              res?.costCenters && res?.costCenters?.length
                ? res.costCenters.filter(({ disabled }) => !disabled)
                : [];
            tempUser = getUserAsAdmin({
              costCenters,
              user,
            }).tempUser;
            costCenterName = getUserAsAdmin({
              costCenters,
              user,
            }).costCentreName;
            if (
              !selectedCostCenterName ||
              costCenters.findIndex(
                (obj) => obj.costCentreName === selectedCostCenterName
              ) === -1
            ) {
              dispatch(updateSelectedCostCenterName(costCenterName));
            }
          }
          setUser({
            accessToken,
            expiresIn: decode.exp,
            refreshToken,
            user: tempUser,
          });
          const roles = await getRoles(accessToken);
          dispatch(updateRoles(roles));
          const contractTypes = await getContractTypes(accessToken);
          dispatch(updateContractTypes(contractTypes));
          getPermissions(
            tempUser.userRoles[costCenterName],
            accessToken,
            roles,
            tempUser.empId,
            tempUser.costCentreName
          );
        } else {
          addToast("Cost Center not found!", {
            appearance: "error",
          });
        }
      } else {
        addToast("User not found!", {
          appearance: "error",
        });
      }
    } else {
      addToast("User ID not found!", {
        appearance: "error",
      });
    }
  };
  const getRoles = async (accessToken: string) => {
    const res = await get<IRoleResponse[]>(ENDPOINT["/access"]["/roles"], {
      headers: accessToken
        ? {
            Authorization: `Bearer ${accessToken}`,
          }
        : {},
    });
    return res;
  };
  const getContractTypes = async (accessToken: string) => {
    const res = await get<IContractTypeResponse[]>(
      ENDPOINT["/master"]["/contract-type"],
      {
        headers: accessToken
          ? {
              Authorization: `Bearer ${accessToken}`,
            }
          : {},
      }
    );
    return res;
  };
  const setUser = async (props: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user?: IUserResponse;
  }) => {
    const { accessToken, expiresIn, refreshToken, user } = props;
    dispatch(updateAccessToken(accessToken));
    dispatch(updateRefreshToken(refreshToken));
    dispatch(updateExpiresIn(expiresIn));
    if (user) {
      dispatch(updateUser(user));
    }
  };
  const getUserAsAdmin = (props: {
    user: IUserResponse;
    costCenters: ICostCenter[];
  }) => {
    const { costCenters, user } = props;
    const ids = user.userRoles["ALL"];
    const tempUser = cloneDeep(user);
    tempUser.userRoles = {};
    tempUser["costCentreDisplayNameMap"] = {};
    costCenters
      .filter(({ disabled }) => !disabled)
      .filter(({ costCentreName }) => costCentreName)
      .forEach(({ costCentreName, displayName }) => {
        if (displayName) {
          tempUser["costCentreDisplayNameMap"][costCentreName] = displayName;
        }
        if (
          user.userRoles[costCentreName] &&
          user.userRoles[costCentreName].length
        ) {
          tempUser.userRoles[costCentreName] = uniq([
            ...ids,
            ...user.userRoles[costCentreName],
          ]);
        } else {
          tempUser.userRoles[costCentreName] = ids;
        }
      });
    let costCentreName = "";
    if (costCenters && costCenters.length) {
      costCentreName = costCenters[0].costCentreName;
    }

    return { tempUser, costCentreName };
  };
  const getPermissions = async (
    roleIds: number[],
    accessToken: string,
    roles: IRoleResponse[],
    empId: string,
    cc: string
  ) => {
    if (roleIds?.length) {
      setRoleLevel(roleIds, roles);
      const rolesResponse = await get<IRoleResponse[]>(
        ENDPOINT["/access"]["/roles/permissions"],
        {
          params: {
            ids: roleIds.toString(),
          },
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {},
        }
      );
      let allPermissions: IPermissionResponse[] = [];
      if (rolesResponse?.length) {
        rolesResponse.forEach(({ permissions }) => {
          if (permissions?.length) {
            allPermissions = [...allPermissions, ...permissions];
          }
        });
      }
      if (allPermissions.length) {
        const transformedPermissions = transformPermissions(allPermissions);
        let samePermissions = true;
        if (userRoles?.length) {
          const arr1 = rolesResponse.map((obj) => ({
            ...obj,
            permissions: _.sortBy(obj.permissions, ({ id }) => id),
          }));
          const arr2 = userRoles.map((obj) => ({
            ...obj,
            permissions: _.sortBy(obj.permissions, ({ id }) => id),
          }));
          samePermissions = _.isEqual(
            _.sortBy(arr1, ({ id }) => id),
            _.sortBy(arr2, ({ id }) => id)
          );
        } else {
          samePermissions = false;
        }
        if (!samePermissions) {
          dispatch(updateUserTransformedPermissions(transformedPermissions));
          dispatch(updateUserRoles(rolesResponse || []));
        }
        if (
          checkForPermission(
            PERMISSION["Eco Mobility"]["My Eco Mobility"].Add,
            transformedPermissions
          ) &&
          empId !== "1"
        ) {
          const payrollRes = await get<IPayrollConfig>(
            ENDPOINT["/hours"]["/payroll-config"],
            {
              headers: accessToken
                ? {
                    Authorization: `Bearer ${accessToken}`,
                  }
                : {},
            }
          );
          if (payrollRes.currentPStartDateTime) {
            const currentPStartDate = moment(
              payrollRes.currentPStartDateTime
            ).format("YYYY-MM-DD");
            const currentPEndDate = moment(
              payrollRes.currentPEndDateTime
            ).format("YYYY-MM-DD");
            const currentDate = moment().format("YYYY-MM-DD");
            let submitted = false;
            let alertRequired = false;
            if (
              ecoMobility &&
              ecoMobility.currentPStartDate === currentPStartDate &&
              ecoMobility.empId === empId
            ) {
              if (ecoMobility.submitted) {
                submitted = true;
              } else if (ecoMobility.currentDate !== currentDate) {
                const dataPresent = await getEcoStatus({
                  accessToken,
                  currentPStartDate,
                  empId,
                  cc,
                });
                if (dataPresent) {
                  submitted = true;
                } else {
                  alertRequired = true;
                }
                dispatch(
                  updateEcoMobilitySubmission({
                    currentDate,
                    currentPStartDate,
                    currentPEndDate,
                    submitted,
                    empId,
                  })
                );
              }
            } else {
              const dataPresent = await getEcoStatus({
                accessToken,
                currentPStartDate,
                empId,
                cc,
              });
              if (dataPresent) {
                submitted = true;
              } else {
                alertRequired = true;
              }
              dispatch(
                updateEcoMobilitySubmission({
                  currentDate,
                  currentPStartDate,
                  currentPEndDate,
                  submitted,
                  empId,
                })
              );
            }
            if (alertRequired) {
              dispatch(updateEcoModalOpen(true));
            }
          }
        }
      } else {
        addToast("No Permissions found with this user!", {
          appearance: "error",
        });
        dispatch(updateUserTransformedPermissions([]));
        dispatch(updateUserRoles([]));
      }
    } else {
      addToast("No Roles found with this user!", {
        appearance: "error",
      });
      dispatch(updateUserTransformedPermissions([]));
      dispatch(updateUserRoles([]));
    }
  };
  const getEcoStatus = (props: {
    empId: string;
    currentPStartDate: string;
    accessToken: string;
    cc: string;
  }) => {
    const { accessToken, currentPStartDate, empId, cc } = props;
    return get<IEcoMobility[]>(ENDPOINT["/eco-mobility"][""] + `/${empId}`, {
      params: {
        fromDate: currentPStartDate,
        toDate: currentPStartDate,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
        cc,
      },
    }).then((value) => value.length > 0);
  };
  const setRoleLevel = (roleIds: number[], roles: IRoleResponse[]) => {
    let minLevel = 0;
    if (roles?.length) {
      roleIds.forEach((id) => {
        const level = roles.find((obj) => obj.id === id)?.level ?? 0;

        if (minLevel === 0 || level < minLevel) {
          minLevel = level;
        }
      });
      if (minLevel && minLevel !== roleLevel) {
        dispatch(updateRoleLevel(minLevel));
      }
    }
  };

  const reLoginWithRefreshToken = async () => {
    const res = await post<ITokenExchangeResponse>(
      ENDPOINT["/auth"]["/refresh-tokens"],
      {
        data: {
          refreshToken: refreshToken,
        },
      }
    ).catch(() => {
      navigate("/", { replace: true });
    });
    if (res?.success) {
      const { accessToken, refreshToken } = res;
      dispatch(updateAccessToken(accessToken));
      dispatch(updateRefreshToken(refreshToken));
      getUser({
        accessToken,
        refreshToken,
        loginWithRefreshToken: true,
      });
    }
  };
  const onEmailLogin = async () => {
    if (email) {
      on();
      post<ITokenExchangeResponse>(
        ENDPOINT["/auth"]["/direct-token"] + `/${email}`
      )
        .then((emailLogin) => {
          if (emailLogin?.success) {
            dispatch(updateDrawerIndex(-1));
            const { accessToken, refreshToken } = emailLogin;
            getUser({
              accessToken,
              refreshToken,
            });
          } else {
            addToast(emailLogin.message || defaultErrorMessage, {
              appearance: "error",
            });
          }
        })
        .catch((error) => {
          navigate("/", { replace: true });
        })
        .finally(() => {
          off();
        });
    } else {
      addToast("Please Enter Email!", {
        appearance: "error",
      });
    }
  };
  return {
    getToken,
    onLogin,
    reLoginWithRefreshToken,
    onEmailLogin,
    email,
    setEmail,
    getPermissions,
    isLoading,
  };
};
export { useLogin };
