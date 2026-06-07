import AppContainer from "../../components/AppContainer";
import {
  Button,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  IconButton,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Radio,
  RadioGroup,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Textarea,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import moment from "moment";
import { SingleDatepicker } from "chakra-dayzed-datepicker";
import { subDays } from "date-fns";
import { useCalender } from "../../hooks/useCalender";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import { PERMISSION } from "../../config/permission.config";
import { BsChevronDown } from "react-icons/bs";
import AppTabs from "../../components/AppTabs";
import { usePermission } from "../../hooks/usePermission";
import { DAYS, MONTHS } from "../../helper/Constant";
import CustomBox from "../roster/common/CustomBox";
import { formatDate, getDateFromString } from "../../helper/Utils";
import LeaveHistory from "./LeaveHistory";
import { useAppSelector } from "../../app/store/store";
import { useEffect } from "react";
import CustomCircle from "./CustomCircle";
import LeavesWeekOffs from "./LeavesWeekOffs";

function MyLeavesWeekOffs() {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <AppContainer
      heading="My Leaves & Weekly Offs"
      info="Apply for leaves/week offs or access info about available/accessed leaves & week offs."
    >
      {user?.empId ? (
        <LeavesWeekOffs
          empId={user.empId}
          empName={`${user.firstName}${
            user.lastName ? ` ${user.lastName}` : ""
          }`}
          contractTypeId={user.contractTypeId}
          stateId={user.stateId}
          applyBy="SELF"
        />
      ) : (
        <></>
      )}
    </AppContainer>
  );
}

export default MyLeavesWeekOffs;
