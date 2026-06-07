import {
  Badge,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import React from "react";
import { BsCheck2Square, BsSearch } from "react-icons/bs";
import {
  IContractTypeResponse,
  IMyTeamInfo,
  IUserResponse,
} from "../../../helper/Interface";

function MyTeamEmployees(props: {
  searchKey: string;
  setSearchKey: (value: React.SetStateAction<string>) => void;
  user?: IUserResponse;
  myTeamEmp: IMyTeamInfo["userBasicInfoDTOList"];
  selectedEmpId: string;
  onChangeSelectedEmpId: (empId: string) => void;
  contractTypes?: IContractTypeResponse[];
}) {
  const {
    searchKey,
    setSearchKey,
    user,
    myTeamEmp,
    selectedEmpId,
    onChangeSelectedEmpId,
    contractTypes,
  } = props;
  return (
    <Flex
      width={"full"}
      direction={"column"}
      border={"1px solid #eaeaea"}
      rounded={"md"}
      background={"white"}
    >
      <Text
        m={"2"}
        textAlign={"center"}
        background={"#F2F2F2"}
        p={"2"}
        rounded={"md"}
      >
        Employees
      </Text>
      <Flex p={"2"} pt={"0"}>
        <InputGroup width={"fit-content"}>
          <InputLeftElement pointerEvents="none">
            <BsSearch color="gray.300" />
          </InputLeftElement>
          <Input
            background={"white"}
            value={searchKey}
            onChange={(e) => setSearchKey(e.target.value)}
            placeholder="Search here"
            width={"fit-content"}
          />
        </InputGroup>
      </Flex>

      {user && myTeamEmp?.length ? (
        <Flex
          direction={"column"}
          width={"full"}
          maxHeight={"570px"}
          overflow={"auto"}
        >
          {myTeamEmp
            .sort((a, b) => {
              if (a.empId === user.empId && b.empId !== user.empId) return -1;
              if (a.empId !== user.empId && b.empId === user.empId) return 1;

              return a.firstName.localeCompare(b.firstName);
            })
            .filter(
              ({ firstName, empId }) =>
                firstName
                  .trim()
                  .toLowerCase()
                  .includes(searchKey.trim().toLowerCase()) ||
                empId
                  .trim()
                  .toLowerCase()
                  .includes(searchKey.trim().toLowerCase()),
            )
            .map(({ firstName, lastName, empId, contractTypeId }, i) => {
              return (
                <Flex
                  key={empId}
                  direction={"column"}
                  px={"3"}
                  py={"2"}
                  background={i % 2 === 0 ? "#f5f5f6" : "white"}
                  cursor={"pointer"}
                  border={"1px solid"}
                  borderLeft={"4px solid"}
                  borderColor={
                    selectedEmpId === empId ? "#027DBC" : "transparent"
                  }
                  borderRadius={"4"}
                  onClick={() => {
                    onChangeSelectedEmpId(empId);
                  }}
                >
                  <Flex
                    alignItems={"center"}
                    justifyContent={"space-between"}
                    pr={"2"}
                  >
                    <Tooltip
                      hasArrow
                      label={`${firstName} ${lastName}`}
                      openDelay={500}
                    >
                      <Flex alignItems={"center"}>
                        <Text
                          fontSize={"sm"}
                          fontWeight={"medium"}
                          width={"fit-content"}
                          mr={"1"}
                        >
                          {`${firstName}`}
                        </Text>
                        {user && user.empId === empId ? (
                          <Badge fontSize={"10px"} ml={"1"} color={"#027DBC"}>
                            You
                          </Badge>
                        ) : null}
                      </Flex>
                    </Tooltip>
                    {selectedEmpId === empId ? (
                      <BsCheck2Square color="#027DBC" data-testid="my-check" />
                    ) : null}
                  </Flex>

                  <Flex alignItems={"center"} wrap={"wrap"}>
                    <Text fontSize={"xs"} color={"gray.600"}>
                      {empId}
                    </Text>
                    <Flex
                      width={"1"}
                      height={"1"}
                      background={"gray.600"}
                      rounded={"full"}
                      mx={"1"}
                    ></Flex>
                    <Text fontSize={"xs"} color={"gray.600"}>{`${
                      contractTypes?.length
                        ? contractTypes.find(({ id }) => id === contractTypeId)
                            ?.name
                        : ""
                    }`}</Text>
                  </Flex>
                </Flex>
              );
            })}
        </Flex>
      ) : (
        <Flex
          alignItems={"center"}
          minHeight={"100px"}
          justifyContent={"center"}
        >
          <Text fontSize={"sm"} color={"gray.500"} textAlign={"center"}>
            No Employees Found!
          </Text>
        </Flex>
      )}
    </Flex>
  );
}

export default MyTeamEmployees;
