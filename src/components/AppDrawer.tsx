import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
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
    <Box position={"fixed"} zIndex={2} background={"#211a30"}>
      <Box
        bg="#211a30"
        h="100vh"
        width={!isOpen ? 0 : DRAWER_WIDTH}
        position="fixed"
        zIndex={3}
        top="0"
        boxShadow="0 18px 48px rgba(24, 18, 36, 0.2)"
        left="0"
        style={{
          transition: "0.3s",
          overflowX: "hidden",
        }}
        display={"flex"}
        flexDirection={"column"}
      >
        <Flex
          justifyContent={"flex-start"}
          alignItems={"center"}
          height={`${NAV_HEIGHT}px`}
          px={"5"}
          gap={"3"}
          onClick={() => {
            navigate("/home", {
              state: {
                click: true,
              },
            });
            dispatch(updateDrawerIndex(-1));
          }}
          cursor={"pointer"}
          _hover={{ bg: "rgba(255,255,255,0.05)" }}
        >
          <Flex
            alignItems="center"
            justifyContent="center"
            width="36px"
            height="36px"
            bg="#d9ee9a"
            color="#211a30"
            borderRadius="xl"
            fontSize="md"
            fontWeight="900"
          >
            R
          </Flex>
          <Text
            color="white"
            fontSize="lg"
            fontWeight="700"
            letterSpacing="-0.02em"
          >
            Rostrix
          </Text>
        </Flex>
        <Box>
          <Divider borderColor="rgba(255,255,255,0.1)" />
        </Box>
        <Box p="3">
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
                    px="3"
                    py="2.5"
                    borderRadius="lg"
                    _hover={{ bg: "rgba(255,255,255,0.07)" }}
                    _expanded={{ bg: "rgba(217,238,154,0.12)", color: "#d9ee9a" }}
                  >
                    <Box
                      as="span"
                      flex="1"
                      textAlign="left"
                      fontSize={"sm"}
                      fontWeight={"medium"}
                      display={"flex"}
                      alignItems={"center"}
                      mb={"1"}
                    >
                      <img
                        src={icon}
                        alt={""}
                        width={18}
                        style={{
                          marginRight: 8,
                          filter: "brightness(0) invert(1)",
                          opacity: 0.75,
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
                          py={"2.5"}
                          px={"3"}
                          my={"1"}
                          background={
                            isSelected(parentPath + "/" + path)
                              ? "rgba(217,238,154,0.13)"
                              : "transparent"
                          }
                          cursor={"pointer"}
                          rounded={"lg"}
                          onClick={() => onNavigate(parentPath + "/" + path)}
                          position={"relative"}
                          _hover={{ bg: "rgba(255,255,255,0.07)" }}
                        >
                          <Text
                            fontSize={"13px"}
                            color={
                              isSelected(parentPath + "/" + path)
                                ? "#d9ee9a"
                                : "rgba(255,255,255,0.76)"
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
                              background={"#d9ee9a"}
                              rounded={"full"}
                            ></Flex>
                          ) : null}
                          {isNew ? (
                            <Text
                              background={"rgba(217,238,154,0.14)"}
                              color={"#d9ee9a"}
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
