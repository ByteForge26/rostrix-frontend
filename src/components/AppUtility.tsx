import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/store/store";
import { useLogin } from "../hooks/useLogin";
import { useCountdown } from "../hooks/useCountdown";
import { onMessageListener, requestForToken } from "../firebase/firebase";
import { useApi } from "../hooks/useApi";
import { ENDPOINT } from "../config/endpoint.config";
import {
  updateEcoModalOpen,
  updateFcmToken,
  updateFcmTokenId,
} from "../app/slice/auth.slice";
import { isMobile } from "../helper/Utils";
import { useToasts } from "react-toast-notifications";
import {
  Button,
  FormControl,
  FormLabel,
  Grid,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import AppSelectCostCenter from "./AppSelectCostCenter";
import { useNavigate } from "react-router-dom";
import moment from "moment";

function AppUtility() {
  const {
    expiresIn,
    refreshToken,
    user,
    isLoggedIn,
    fcmToken,
    fcmTokenId,
    selectedCostCenterName,
    isEcoModalOpen,
    ecoMobility,
  } = useAppSelector((state) => state.auth);
  const { reLoginWithRefreshToken } = useLogin();
  const { addToast } = useToasts();
  const { post } = useApi();
  const dispatch = useAppDispatch();
  const remaingTimeInSeconds = useCountdown(Number(expiresIn));
  const [isLoginAttmpted, setIsLoginAttmpted] = useState(false);
  const LIMIT_IN_SECONDS = 60;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  useEffect(() => {
    if (selectedCostCenterName && isOpen) {
      onClose();
    }
    if (!selectedCostCenterName && !isOpen && user) {
      onOpen();
    }
  }, [selectedCostCenterName, user]);

  useEffect(() => {
    if (isLoggedIn && user) {
      getToken();
    }
  }, [isLoggedIn, user]);

  const getToken = async () => {
    const token = await requestForToken();
    if ((token && fcmToken !== token) || !fcmToken) {
      if (token) sendTokenToServer(token);
    }
  };
  const sendTokenToServer = async (token: string) => {
    const res = await post<{ success: boolean; tokenId: number }>(
      ENDPOINT["/user"]["/fcm-token"],
      {
        data: {
          token,
          deviceType: isMobile() ? "M_WEB" : "WEB",
          userId: user?.userId,
          oldTokenId: fcmTokenId ?? 0,
        },
      }
    );
    if (res.success) {
      dispatch(updateFcmToken(token));
      dispatch(updateFcmTokenId(res.tokenId));
    }
  };

  onMessageListener()
    .then((payload: any) => {
      addToast(
        <Grid>
          <Text fontSize={"lg"} fontWeight={"medium"}>
            {payload?.notification?.title}
          </Text>
          <Text fontSize={"xs"}>{payload?.notification?.body}</Text>
        </Grid>,
        { appearance: "info" }
      );
    })
    .catch((err) => console.log("failed: ", err));

  useEffect(() => {
    checkForTokenExpiry();
  }, [remaingTimeInSeconds]);

  const checkForTokenExpiry = () => {
    if (
      remaingTimeInSeconds < LIMIT_IN_SECONDS &&
      refreshToken &&
      !isLoginAttmpted
    ) {
      setIsLoginAttmpted(true);
      reLoginWithRefreshToken();
    }
    if (remaingTimeInSeconds > LIMIT_IN_SECONDS && isLoginAttmpted) {
      setIsLoginAttmpted(false);
    }
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => null} size={"xs"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Select Cost Center</ModalHeader>
          <ModalBody>
            <FormControl mb={"4"} isRequired>
              <FormLabel>Cost Center</FormLabel>
              <AppSelectCostCenter />
            </FormControl>
          </ModalBody>
        </ModalContent>
      </Modal>
      <Modal
        isOpen={!!isEcoModalOpen}
        onClose={() => dispatch(updateEcoModalOpen(false))}
        size={"xl"}
      >
        <ModalOverlay />

        <ModalContent overflow={"hidden"}>
          <ModalCloseButton color={"white"} />
          <ModalHeader background={"#359735"} color={"white"}>
            🌱 Eco-Mobility Submission Reminder
          </ModalHeader>

          <ModalBody pt={"4"}>
            <Text fontSize={"md"} mb={"4"}>
              <span
                dangerouslySetInnerHTML={{
                  __html: ecoMobility
                    ? `This is a friendly reminder to submit your Daily Commute entries for the payroll period from <strong>${moment(
                        ecoMobility.currentPStartDate
                      ).format("DD MMM YYYY")}</strong> to <strong>${moment(
                        ecoMobility.currentPEndDate
                      ).format("DD MMM YYYY")}</strong>.`
                    : ``,
                }}
              ></span>
            </Text>
            <Text fontSize={"sm"}>
              {`Timely submission helps ensure accurate tracking and reporting of your eco-friendly commuting efforts, contributing to a more sustainable workplace.`}
            </Text>
          </ModalBody>
          <ModalFooter justifyContent={"center"}>
            <Button
              background={"#359735"}
              color={"white"}
              size={"lg"}
              onClick={() => {
                navigate("/eco-mobility/manage-eco-mobility");
                dispatch(updateEcoModalOpen(false));
              }}
            >
              Submit Eco-Mobility Entries
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default AppUtility;
