import {
  Button,
  Checkbox,
  Flex,
  FormControl,
  FormLabel,
  Text,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import { uniq } from "lodash";
import { useEffect, useState } from "react";
import { useToasts } from "react-toast-notifications";
import { store } from "../../app/store/store";
import AppContainer from "../../components/AppContainer";
import AppFloatingButton from "../../components/AppFloatingButton";
import AppHeader from "../../components/AppHeader";
import AppLoader from "../../components/AppLoader";
import AppNoData from "../../components/AppNoData";
import AppRightDrawer from "../../components/AppRightDrawer";
import AppSelect from "../../components/AppSelect";
import { ENDPOINT } from "../../config/endpoint.config";
import { PERMISSION } from "../../config/permission.config";
import {
  IPermissionResponse,
  IRoleResponse,
  IUserTransformedPermissions,
} from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";

function ManageRolesPermissions() {
  const { get, post } = useApi();
  const { addToast } = useToasts();
  const { transformPermissions, migratePermissions, filterPermission } =
    usePermission();
  const { checkForPermission } = usePermission();
  const [isLoading, { on: onLoading, off: offLoading }] = useBoolean(true);
  const [allPermissions, setAllPermissions] = useState<
    IUserTransformedPermissions[]
  >([]);
  const [allRoles, setAllRoles] = useState<IRoleResponse[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState(0);
  const [rolePermissionMap, setRolePermissionMap] = useState<number[]>([]);
  const [isAnyChange, setIsAnyChange] = useState(false);
  const {
    isOpen: isFilterOpen,
    onClose: onFilterClose,
    onOpen: onFilterOpen,
  } = useDisclosure();
  useEffect(() => {
    getAllRoles();
    getAllPermissions();
  }, []);
  const getAllRoles = async () => {
    onLoading();
    const res = await get<IRoleResponse[]>(ENDPOINT["/access"]["/roles"]);
    offLoading();
    if (res?.length) {
      setAllRoles(res);
      setSelectedRoleId(
        res
          .filter(({ level }) => level > (store.getState().auth.roleLevel ?? 0))
          .sort((a, b) => a.name.localeCompare(b.name))[0].id,
      );
    } else {
      setAllRoles([]);
      setSelectedRoleId(0);
    }
  };

  const getAllPermissions = async () => {
    onLoading();
    const res = await get<IPermissionResponse[]>(
      ENDPOINT["/access"]["/permissions"],
    );
    offLoading();
    if (res?.length) {
      migratePermissions(res);
      setAllPermissions(transformPermissions(res));
    } else {
      migratePermissions([]);
      setAllPermissions(transformPermissions([]));
    }
  };

  useEffect(() => {
    if (selectedRoleId) {
      setIsAnyChange(false);
      getRolePermissions();
    }
  }, [selectedRoleId]);
  const getRolePermissions = async () => {
    setRolePermissionMap([]);
    onLoading();
    const res = await get<IRoleResponse[]>(
      ENDPOINT["/access"]["/roles/permissions"] + `?ids=${selectedRoleId}`,
    );
    offLoading();
    let rolePermissionMapTemp: number[] = [];
    if (res?.length) {
      res.forEach(({ permissions }) => {
        if (permissions?.length) {
          filterPermission(permissions).forEach(({ id: permissionId }) => {
            rolePermissionMapTemp.push(permissionId);
          });
        }
      });
      setRolePermissionMap(rolePermissionMapTemp);
    } else {
      setRolePermissionMap([]);
    }
  };
  const isAllSelected = (ids: number[]) => {
    return ids.every((item) => rolePermissionMap.includes(item));
  };

  const onChangeAllPermission = (ids: number[], checked: boolean) => {
    setIsAnyChange(true);
    setRolePermissionMap((prev) => {
      if (checked) {
        return uniq([...prev, ...ids]);
      }
      return prev.filter((v) => !ids.includes(v));
    });
  };

  const onChangePermission = (id: number) => {
    setIsAnyChange(true);
    setRolePermissionMap((prev) => {
      const index = prev.indexOf(id);
      if (index >= 0) {
        return prev.filter((item) => item !== id);
      }
      return uniq([...prev, id]);
    });
  };

  const onSaveChanges = async () => {
    const res = await post<{
      message: string;
      success: boolean;
    }>(ENDPOINT["/access"]["/roles"] + `/${selectedRoleId}/permissions`, {
      data: {
        permissionIds: rolePermissionMap,
      },
    });
    if (res.success) {
      addToast(res.message, { appearance: "success", autoDismiss: true });
      setIsAnyChange(false);
      getRolePermissions();
    } else {
      addToast(res.message, { appearance: "error", autoDismiss: true });
    }
  };
  const isDisabled = !checkForPermission(
    PERMISSION.Access["Manage Role Permission"].Update,
  );

  return (
    <AppContainer
      heading="Roles & Permissions"
      info="Manage access to different features and areas of the roster system by defining permissions to roles or individual users."
    >
      <AppHeader justifyContentLeft>
        <AppSelect
          value={selectedRoleId}
          onChange={(value) => setSelectedRoleId(value)}
          options={
            allRoles?.length
              ? allRoles
                  .filter(
                    ({ level }) =>
                      level > (store.getState().auth.roleLevel ?? 0),
                  )
                  .sort((a, b) => a.name.localeCompare(b.name))
                  .map(({ name, id }) => ({
                    label: name,
                    value: id,
                  }))
              : []
          }
        />
      </AppHeader>
      {allPermissions.length ? (
        <Flex direction={"column"} overflow={"auto"}>
          {allPermissions.map(({ category, subCategories }, i) => (
            <Flex
              key={category}
              direction={"column"}
              style={{
                background: "#b6b6b61a",
                marginBottom: 16,
                borderRadius: 4,
                border: "1px solid lightgrey",
                overflow: "hidden",
              }}
            >
              <Flex
                style={{
                  padding: "6px 10px",
                  borderBottom: "1px solid lightgrey",
                }}
              >
                <Text
                  fontWeight={"bold"}
                  style={{
                    padding: "4px 12px",
                  }}
                  minWidth={"21%"}
                >
                  {category}
                </Text>
                <Checkbox
                  isDisabled={isDisabled}
                  size={"lg"}
                  isChecked={isAllSelected(
                    subCategories.flatMap(({ permissions }) =>
                      permissions.map((p) => p.id),
                    ),
                  )}
                  onChange={(e) =>
                    onChangeAllPermission(
                      subCategories.flatMap(({ permissions }) =>
                        permissions.map((p) => p.id),
                      ),
                      e.target.checked,
                    )
                  }
                >
                  <Text fontSize={"sm"}>All Permissions</Text>
                </Checkbox>
              </Flex>

              <Flex direction={"column"}>
                {subCategories.map(({ permissions, subCategory }, j) => (
                  <Flex
                    key={`${subCategory}`}
                    alignItems={"center"}
                    style={{
                      background: "white",
                      padding: "6px 10px",
                      borderTop: "1px solid #F2F2F2",
                    }}
                  >
                    <Flex
                      minWidth={"45%"}
                      borderRight={"1px solid #F2F2F2"}
                      pl={"2"}
                    >
                      <Text fontSize={"sm"} minWidth={"45%"} padding={"4px 0"}>
                        {j + 1}. {subCategory}{" "}
                      </Text>

                      <Checkbox
                        isDisabled={isDisabled}
                        pl={"2"}
                        isChecked={isAllSelected(
                          permissions.map(({ id }) => id),
                        )}
                        onChange={(e) =>
                          onChangeAllPermission(
                            permissions.map(({ id }) => id),
                            e.target.checked,
                          )
                        }
                      >
                        <Text fontSize={"sm"}>Full Access</Text>
                      </Checkbox>
                    </Flex>

                    <Flex flexWrap={"wrap"} width={"55%"}>
                      {permissions.map(({ name, id }, k) => (
                        <Flex
                          key={`${name}_${id}`}
                          style={{
                            padding: "4px 8px",
                          }}
                          minWidth={"25%"}
                        >
                          <Checkbox
                            isDisabled={isDisabled}
                            mr={"2"}
                            isChecked={rolePermissionMap?.includes(id)}
                            onChange={() => onChangePermission(id)}
                          >
                            <Text fontSize={"sm"}>{name}</Text>
                          </Checkbox>
                        </Flex>
                      ))}
                    </Flex>
                  </Flex>
                ))}
              </Flex>
            </Flex>
          ))}
        </Flex>
      ) : isLoading ? (
        <AppLoader />
      ) : (
        <AppNoData />
      )}
      <AppRightDrawer
        heading="Filter"
        isOpen={isFilterOpen}
        onClose={onFilterClose}
      >
        <Flex direction={"column"} height={"full"} py={"3"}>
          <FormControl mb={"4"}>
            <FormLabel>Role</FormLabel>
            <AppSelect
              value={selectedRoleId}
              onChange={(value) => setSelectedRoleId(value)}
              options={
                allRoles?.length
                  ? allRoles
                      .filter(
                        ({ level }) =>
                          level > (store.getState().auth.roleLevel ?? 0),
                      )
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map(({ name, id }) => ({
                        label: name,
                        value: id,
                      }))
                  : []
              }
            />
          </FormControl>

          <Button mt={"auto"} onClick={onFilterClose}>
            Close
          </Button>
        </Flex>
      </AppRightDrawer>
      {isAnyChange ? (
        <AppFloatingButton label="SAVE" onClick={onSaveChanges} />
      ) : null}
    </AppContainer>
  );
}

export default ManageRolesPermissions;
