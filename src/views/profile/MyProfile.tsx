import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import AppHeader from "../../components/AppHeader";
import { Flex, useBoolean } from "@chakra-ui/react";
import BasicDetails from "./BasicDetails";
import RolesDetails from "./RolesDetails";
import { useApi } from "../../hooks/useApi";
import { IUserResponse } from "../../helper/Interface";
import { ENDPOINT } from "../../config/endpoint.config";
import { useAppSelector } from "../../app/store/store";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";

function MyProfile() {
  const { get } = useApi();
  const [userDetails, setUserDetails] = useState<IUserResponse>();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const getEmployeeDetails = async (empId: string) => {
    onLoading();
    const res = await get<IUserResponse>(
      ENDPOINT["/user"][""] + `/${empId}?empId=${true}`
    );
    offLoading();
    if (res?.empId) {
      setUserDetails(res);
    } else {
      setUserDetails(undefined);
    }
  };
  useEffect(() => {
    if (user?.empId) {
      getEmployeeDetails(user.empId);
    }
  }, [user]);

  return (
    <AppContainer heading="My Profile">
      <AppHeader></AppHeader>
      <Flex direction={"column"}>
        {userDetails?.empId ? (
          <>
            <BasicDetails userDetails={userDetails} />
            <RolesDetails
              userRolesDetails={userDetails.userRolesDetails ?? []}
              userId={userDetails.userId}
              viewOnly={true}
            />
          </>
        ) : isLoading ? (
          <AppLoader />
        ) : (
          <AppNoData />
        )}
      </Flex>
    </AppContainer>
  );
}

export default MyProfile;
