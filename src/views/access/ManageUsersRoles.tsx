import { useState } from "react";
import AppContainer from "../../components/AppContainer";
import {
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Spinner,
  Text,
  useBoolean,
} from "@chakra-ui/react";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import { IUserResponse } from "../../helper/Interface";
import AppHeader from "../../components/AppHeader";
import { BsSearch } from "react-icons/bs";
import { useToasts } from "react-toast-notifications";
import BasicDetails from "../profile/BasicDetails";
import RolesDetails from "../profile/RolesDetails";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSION } from "../../config/permission.config";
import { employeeSearchImage } from "../../helper/Images";
import AppLoader from "../../components/AppLoader";

function ManageUsersRoles() {
  const { get } = useApi();
  const { addToast } = useToasts();
  const { checkForPermission } = usePermission();
  const [empId, setEmpId] = useState("");
  const [isLoading, { on, off }] = useBoolean();
  const [userDetails, setUserDetails] = useState<IUserResponse>();

  const getEmployeeDetails = async () => {
    setUserDetails(undefined);
    on();
    const res = await get<IUserResponse>(
      ENDPOINT["/user"][""] + `/${empId}?empId=${true}`
    );
    off();
    if (res?.empId) {
      setUserDetails(res);
    } else {
      setUserDetails(undefined);
      addToast("User Not Found!", { appearance: "error", autoDismiss: true });
    }
  };

  return (
    <AppContainer
      heading="Users & Roles"
      info="View user info by entering employee id."
    >
      <AppHeader></AppHeader>
      <Flex direction={"column"} overflow={"auto"}>
        <Flex mb={"4"}>
          <form
            onSubmit={(e) => {
              getEmployeeDetails();
              e.preventDefault();
            }}
            style={{
              display: "flex",
            }}
          >
            <InputGroup width={"fit-content"} mr={"4"}>
              <InputLeftElement pointerEvents="none">
                <BsSearch color="gray.300" />
              </InputLeftElement>
              <Input
                value={empId}
                onChange={(e) => setEmpId(e.target.value)}
                placeholder="Enter Employee Id"
                width={"fit-content"}
              />
            </InputGroup>
            <Button type="submit" isDisabled={!empId}>
              {isLoading ? <Spinner size={"sm"} /> : "SEARCH"}
            </Button>
          </form>
        </Flex>
        {userDetails?.empId ? (
          <>
            <BasicDetails userDetails={userDetails} />
            <RolesDetails
              userRolesDetails={userDetails.userRolesDetails ?? []}
              userId={userDetails.userId}
              getEmployeeDetails={getEmployeeDetails}
              viewOnly={
                !checkForPermission(
                  PERMISSION.Access["Manage User Roles"].Update
                )
              }
            />
          </>
        ) : isLoading ? (
          <AppLoader />
        ) : (
          <Flex
            direction={"column"}
            maxWidth={"420px"}
            margin={"auto"}
            justifyContent={"center"}
            minHeight={"70vh"}
          >
            <Flex>
              <img src={employeeSearchImage} alt="" />
            </Flex>

            <Text fontSize={"14px"} textAlign={"center"} fontWeight={"medium"}>
              On your mark, get set, search!
            </Text>
          </Flex>
        )}
      </Flex>
    </AppContainer>
  );
}

export default ManageUsersRoles;
