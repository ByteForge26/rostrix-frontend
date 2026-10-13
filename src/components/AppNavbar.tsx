import {
  Flex,
  Button,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from "@chakra-ui/react";
import { useState } from "react";
import { AiOutlineClose, AiOutlineMenu, AiOutlineUser } from "react-icons/ai";
import { NAV_HEIGHT } from "../helper/Constant";
import { useAppDispatch, useAppSelector } from "../app/store/store";
import { resetUser } from "../app/slice/auth.slice";
import { BsFillTriangleFill, BsInfoCircle } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import AppSelect from "./AppSelect";
import { useApi } from "../hooks/useApi";
import { ENDPOINT } from "../config/endpoint.config";
import { resetRoot, updateRedirectPath } from "../app/slice/root.slice";
import { resetRoster } from "../app/slice/roster.slice";
import AppSelectCostCenter from "./AppSelectCostCenter";
const INFO_HEIGHT = 38;
function AppNavbar({
  onToggle,
  heading,
  info,
  isMobile,
}: {
  readonly onToggle: () => void;
  readonly heading?: string;
  readonly info?: string;
  readonly isMobile: boolean;
}) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { Delete } = useApi();
  const { user, fcmTokenId } = useAppSelector((state) => state.auth);
  const onSignOut = () => {
    if (fcmTokenId) {
      onDeleteFcmToken();
    } else {
      logout();
    }
  };
  const onDeleteFcmToken = async () => {
    Delete(ENDPOINT["/user"]["/fcm-token"] + `/${fcmTokenId}`).finally(() => {
      logout();
    });
  };
  const logout = () => {
    dispatch(resetUser());
    dispatch(resetRoot());
    dispatch(resetRoster());
    dispatch(updateRedirectPath(""));
  };
  const [isInfoShow, setIsInfoShow] = useState(false);
  return (
    <Flex
      justifyContent={"space-between"}
      fontSize={"xs"}
      alignItems="center"
      px={{ base: 3, md: 6 }}
      py={2}
      height={isInfoShow ? `${NAV_HEIGHT + INFO_HEIGHT}px` : `${NAV_HEIGHT}px`}
      borderBottom={"1px solid #e9e6e3"}
      background={"rgba(255,255,255,0.9)"}
      backdropFilter="blur(14px)"
      wrap={"wrap"}
      transition={"0.3s"}
      position="sticky"
      top="0"
      zIndex="10"
    >
      <Flex pl={{ base: 1, md: 2 }} alignItems={"center"}>
        <Flex
          as="button"
          aria-label="Toggle navigation"
          alignItems="center"
          justifyContent="center"
          width="38px"
          height="38px"
          borderRadius="xl"
          color="brand.800"
          bg="transparent"
          _hover={{ bg: "brand.50" }}
          onClick={onToggle}
          cursor="pointer"
        >
          <AiOutlineMenu size={18} />
        </Flex>
        {heading && !isMobile ? (
          <Text fontSize={"lg"} fontWeight={"700"} ml={"4"} color="brand.800">
            {heading}
          </Text>
        ) : null}
        {heading && !isMobile && info ? (
          <Flex ml={"2"} position={"relative"}>
            {isInfoShow ? (
              <>
                <AiOutlineClose
                  cursor={"pointer"}
                  size={"16px"}
                  onClick={() => setIsInfoShow(!isInfoShow)}
                />
                <BsFillTriangleFill
                  size={"20px"}
                  color="#eeeaf2"
                  style={{
                    position: "absolute",
                    bottom: "-26px",
                    left: "-2px",
                  }}
                />
              </>
            ) : (
              <BsInfoCircle
                cursor={"pointer"}
                size={"16px"}
                onClick={() => setIsInfoShow(!isInfoShow)}
              />
            )}
          </Flex>
        ) : null}
      </Flex>
      <Flex alignItems={"center"}>
        <Flex mr={"2"}>
          <AppSelectCostCenter />
        </Flex>

        <Menu>
          <MenuButton
            as={Button}
            padding={"1rem"}
            colorScheme="black"
            variant="ghost"
          >
            <Flex alignItems={"center"}>
              <AiOutlineUser
                fontSize={"36"}
                style={{
                  background: "#eeeaf2",
                  color: "#49366c",
                  padding: 8,
                  borderRadius: "50%",
                  marginRight: 8,
                }}
              />
              {!isMobile ? (
                <Flex flexDirection={"column"} alignItems={"flex-start"}>
                  <Text fontSize={"sm"} mb={1}>
                    {user?.firstName
                      ? `${user.firstName}${
                          user.lastName ? " " + user.lastName : ""
                        }`
                      : ""}
                  </Text>
                  <Text fontSize={"xs"} fontWeight={"light"}>
                    {user?.empId ? user.empId : ""}
                  </Text>
                </Flex>
              ) : null}
            </Flex>
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => navigate("/my-profile")}>
              My Profile
            </MenuItem>
            <MenuItem onClick={onSignOut}>Sign Out</MenuItem>
          </MenuList>
        </Menu>
      </Flex>
      {info ? (
        <Flex
          width={"full"}
          height={isInfoShow ? `${INFO_HEIGHT}px` : 0}
          overflow={"hidden"}
          transition={"0.3s"}
          alignItems={"center"}
          background={"#f4f1fb"}
          mx={"4"}
          px={"4"}
          rounded={"md"}
        >
          <BsInfoCircle size={"14px"} />
          <Text fontSize={"xs"} ml={"2"}>
            {info}
          </Text>
        </Flex>
      ) : null}
    </Flex>
  );
}

export default AppNavbar;
