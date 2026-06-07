import React from "react";
import { store, useAppDispatch, useAppSelector } from "../app/store/store";
import { useLogin } from "../hooks/useLogin";
import { Flex } from "@chakra-ui/react";
import AppSelect from "./AppSelect";
import { updateSelectedCostCenterName } from "../app/slice/auth.slice";

function AppSelectCostCenter() {
  const { getPermissions } = useLogin();
  const dispatch = useAppDispatch();
  const { user, selectedCostCenterName } = useAppSelector(
    (state) => state.auth
  );
  return (
    <>
      {user?.userRoles && Object.values(user.userRoles).length ? (
        <AppSelect
          value={selectedCostCenterName}
          onChange={(value) => {
            dispatch(updateSelectedCostCenterName(value));
            getPermissions(
              user.userRoles[value],
              "",
              store.getState().auth.roles ?? [],
              user.empId,
              value
            );
          }}
          options={Object.keys(user.userRoles).map((key) => ({
            label:
              user.costCentreDisplayNameMap &&
              user.costCentreDisplayNameMap[key]
                ? `${user.costCentreDisplayNameMap[key]} (${key})`
                : key,
            value: key,
          }))}
        />
      ) : null}
    </>
  );
}

export default AppSelectCostCenter;
