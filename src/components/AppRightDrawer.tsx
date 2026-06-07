import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { NAV_HEIGHT } from "../helper/Constant";

function AppRightDrawer(props: {
  readonly heading: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly children: any;
  readonly hideCloseButton?: boolean;
}) {
  const { isOpen, onClose, children, heading, hideCloseButton } = props;
  return (
    <Drawer placement={"right"} onClose={onClose} isOpen={isOpen}>
      <DrawerOverlay />
      <DrawerContent>
        {!hideCloseButton ? <DrawerCloseButton /> : null}

        <DrawerHeader
          display={"flex"}
          alignItems={"center"}
          borderBottomWidth="1px"
          minHeight={`${NAV_HEIGHT}px`}
        >
          {heading}
        </DrawerHeader>
        <DrawerBody
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"space-between"}
        >
          {children}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
}

export default AppRightDrawer;
