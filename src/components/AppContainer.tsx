import { ReactNode, useEffect } from "react";
import AppDrawer from "./AppDrawer";
import {
  Flex,
  IconButton,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";
import AppNavbar from "./AppNavbar";
import { DRAWER_WIDTH } from "../helper/Constant";
import { BsX } from "react-icons/bs";

function AppContainer({
  children,
  heading,
  info,
  bgColored,
}: {
  readonly children: ReactNode;
  readonly heading?: string;
  readonly info?: string;
  readonly bgColored?: boolean;
}) {
  const { isOpen, onToggle, onClose } = useDisclosure({ defaultIsOpen: true });
  const [isMobile] = useMediaQuery("(max-width: 800px)");
  useEffect(() => {
    if (isMobile) {
      onClose();
    }
  }, [isMobile]);

  return (
    <>
      <AppDrawer isOpen={isOpen} onToggle={onToggle} />
      {isMobile && isOpen ? (
        <Flex position={"fixed"} p={"4"} right={0} top={0} zIndex={11}>
          <IconButton aria-label="" onClick={onClose}>
            <BsX size={"32px"} />
          </IconButton>
        </Flex>
      ) : null}

      <Flex
        direction={"column"}
        paddingLeft={isMobile ? 0 : isOpen ? DRAWER_WIDTH : 0}
        transition={"0.3s"}
        background={"white"}
        minHeight={"100vh"}
        opacity={isMobile && isOpen ? 0.4 : 1}
      >
        <AppNavbar
          onToggle={onToggle}
          heading={heading}
          info={info}
          isMobile={isMobile}
        />
        <Flex
          p={"4"}
          direction={"column"}
          mb={"2"}
          overflow={"auto"}
          minHeight={"calc(100vh - 72px)"}
          background={bgColored ? "#f9f9f9" : "transparent"}
        >
          {children}
        </Flex>
      </Flex>
    </>
  );
}

export default AppContainer;
