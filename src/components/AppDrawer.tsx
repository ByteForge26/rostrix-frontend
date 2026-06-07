import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
  Image,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { effiMateLogoWhite } from "../helper/Images";
import { DRAWER_WIDTH, NAV_HEIGHT } from "../helper/Constant";
import { useAppDispatch, useAppSelector } from "../app/store/store";
import { updateDrawerIndex } from "../app/slice/root.slice";
import { ROUTES } from "../config/routes.config";
import { usePermission } from "../hooks/usePermission";

function AppDrawer({
  isOpen,
  onToggle,
}: {
  readonly isOpen: boolean;
  readonly onToggle: () => void;
}) {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { checkForPermission, transformRoutes } = usePermission();
  const { drawerIndex } = useAppSelector((state) => state.root);
  const isSelected = (route: string) => {
    return window.location.pathname === "/" + route;
  };
  const onNavigate = (route: string) => {
    navigate("/" + route);
  };
  const onDrawerIndexChange = (index: number) => {
    dispatch(updateDrawerIndex(index));
  };

  return (
    <Box position={"fixed"} zIndex={2} background={"#013F5E"}>
      <Box
        bg="#013F5E"
        h="100vh"
        width={!isOpen ? 0 : DRAWER_WIDTH}
        position="fixed"
        zIndex={3}
        top="0"
        boxShadow="md"
        left="0"
        style={{
          transition: "0.3s",
          overflowX: "hidden",
        }}
        display={"flex"}
        flexDirection={"column"}
      >
        <Flex
          justifyContent={"left"}
          alignItems={"center"}
          height={`${NAV_HEIGHT}px`}
        >
          <Image
            display="block"
            src={effiMateLogoWhite}
            maxHeight={"90%"}
            maxWidth={"100%"}
            p={"4"}
            pl={"6"}
            cursor={"pointer"}
            onClick={() => {
              navigate("/home", {
                state: {
                  click: true,
                },
              });
              dispatch(updateDrawerIndex(-1));
            }}
          />
        </Flex>
        <Box>
          <Divider />
        </Box>
        <Box p="2">
          <Accordion
            allowToggle
            index={drawerIndex}
            onChange={onDrawerIndexChange}
            // allowMultiple
          >
            {transformRoutes(ROUTES).map(
              ({ label, icon, children, path: parentPath }, i) => (
                <AccordionItem key={parentPath} border={"none"}>
                  <AccordionButton
                    color={"white"}
                    style={{
                      paddingLeft: "6px",
                      paddingRight: "6px",
                    }}
                  >
                    <Box
                      as="span"
                      flex="1"
                      textAlign="left"
                      fontSize={"15px"}
                      fontWeight={"medium"}
                      display={"flex"}
                      alignItems={"center"}
                      mb={"1"}
                    >
                      <img
                        src={icon}
                        alt={""}
                        width={20}
                        style={{
                          marginRight: 8,
                        }}
                      />
                      {label}
                    </Box>
                    <AccordionIcon />
                  </AccordionButton>
                  <AccordionPanel p={"4"} pr={"2"}>
                    {children
                      .filter(({ isActive }) => isActive)
                      .filter(({ hideFromNav }) => !hideFromNav)
                      .filter(({ permissionKey }) =>
                        checkForPermission(permissionKey)
                      )
                      .map(({ label, path, isNew }, j) => (
                        <Flex
                          key={path}
                          py={"2"}
                          px={"3"}
                          my={"1"}
                          background={
                            isSelected(parentPath + "/" + path)
                              ? "#E9EEFF14"
                              : "transparent"
                          }
                          cursor={"pointer"}
                          rounded={"sm"}
                          onClick={() => onNavigate(parentPath + "/" + path)}
                          position={"relative"}
                        >
                          <Text
                            fontSize={"13px"}
                            color={
                              isSelected(parentPath + "/" + path)
                                ? "white"
                                : "#ffffffe6"
                            }
                            fontWeight={
                              isSelected(parentPath + "/" + path)
                                ? "medium"
                                : "normal"
                            }
                          >
                            {label}
                          </Text>
                          {isSelected(parentPath + "/" + path) ? (
                            <Flex
                              position={"absolute"}
                              left={"-1px"}
                              top={"2"}
                              bottom={"2"}
                              width={"3px"}
                              background={"white"}
                              rounded={"sm"}
                            ></Flex>
                          ) : null}
                          {isNew ? (
                            <Text
                              background={"#ffff001a"}
                              color={"yellow"}
                              padding={"0px 4px"}
                              height={"fit-content"}
                              fontSize={"xx-small"}
                              position={"absolute"}
                              right={"2"}
                              top={"0"}
                              bottom={"0"}
                              m="auto"
                            >
                              NEW
                            </Text>
                          ) : null}
                        </Flex>
                      ))}
                  </AccordionPanel>
                </AccordionItem>
              )
            )}
          </Accordion>
        </Box>
        {/* <Text
          color={"white"}
          fontSize={"xs"}
          marginTop={"auto"}
          mx={"auto"}
          mb={"1"}
        >
          Powered by Olik
        </Text> */}
      </Box>
    </Box>
  );
}

export default AppDrawer;
