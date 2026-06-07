import React, { useEffect, useState } from "react";
import AppContainer from "../../components/AppContainer";
import {
  Badge,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useBoolean,
  useDisclosure,
} from "@chakra-ui/react";
import AppTabs from "../../components/AppTabs";
import { FiEdit, FiPlus } from "react-icons/fi";
import {
  IApiResponse,
  IPeakHoursConfig,
  IWeekResponse,
} from "../../helper/Interface";
import { useApi } from "../../hooks/useApi";
import { ENDPOINT } from "../../config/endpoint.config";
import moment from "moment";
import {
  formatDate,
  generateTimeSlots,
  getDuration,
  getShiftStatusV2,
  isFutureDate,
} from "../../helper/Utils";
import { AiFillDelete } from "react-icons/ai";
import AppRightDrawer from "../../components/AppRightDrawer";
import AppSelect from "../../components/AppSelect";
import {
  DEFAULT_CLOSE_TIME,
  DEFAULT_OPEN_TIME,
  MAX_SHIFT_WITH_LUNCH,
  TIME_GAP,
} from "../../helper/Constant";
import { useAppSelector } from "../../app/store/store";
import { useToasts } from "react-toast-notifications";
import { usePermission } from "../../hooks/usePermission";
import { PERMISSION } from "../../config/permission.config";

const TABS = [
  {
    name: "Peak Hours",
    value: "peak-hours",
  },
];
function StoreConfiguration() {
  const { get, post, Delete, put } = useApi();
  const { addToast } = useToasts();
  const { checkForPermission } = usePermission();
  const { selectedCostCenterName } = useAppSelector((state) => state.auth);
  const [isSaving, { on: onSaving, off: offSaving }] = useBoolean();
  const [isDeleting, { on: onDeleting, off: offDeleting }] = useBoolean();
  const [view, setView] = useState(TABS[0].value);
  const [peakHoursConfig, setPeakHoursConfig] = useState<IPeakHoursConfig[]>();
  const [configId, setConfigId] = useState(0);
  const [effectiveDate, setEffectiveDate] = useState("");
  const [peakHourIntervals, setPeakHourIntervals] = useState<
    {
      startTime: string;
      endTime: string;
    }[]
  >([]);
  const [err, setErr] = useState("");
  const [years, setYears] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [weeks, setWeeks] = useState<IWeekResponse[]>([]);
  const startTimeSlots = generateTimeSlots(
    DEFAULT_OPEN_TIME,
    DEFAULT_CLOSE_TIME
  );
  const [endTimeSlots, setEndTimeSlots] =
    useState<{ label: string; value: string }[]>();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [peakHourIntervalIndex, setPeakHourIntervalIndex] = useState<number>();

  useEffect(() => {
    getYears();
  }, []);

  const getYears = () => {
    const date = new Date();
    const years: string[] = [];
    for (let index = 0; index < 3; index++) {
      years.push((date.getFullYear() + index).toString());
    }
    setYears(years);
  };

  useEffect(() => {
    if (selectedYear) {
      getAllWeeks();
    }
  }, [selectedYear]);
  const getAllWeeks = async () => {
    setWeeks([]);
    const res = await get<IWeekResponse[]>(
      ENDPOINT["/master"]["/week"] + `/${selectedYear}`
    );
    if (res?.length) {
      setWeeks(res);
    }
  };

  const {
    isOpen: isConfigDeleteConfimationOpen,
    onOpen: onConfigDeleteConfirmationOpen,
    onClose: onConfigDeleteConfirmationClose,
  } = useDisclosure();
  const {
    isOpen: isIntervalDeleteConfimationOpen,
    onOpen: onIntervalDeleteConfirmationOpen,
    onClose: onIntervalDeleteConfirmationClose,
  } = useDisclosure();
  const {
    isOpen: isAddConfigOpen,
    onOpen: onAddConfigOpen,
    onClose: onAddConfigClose,
  } = useDisclosure();
  useEffect(() => {
    if (startTime) {
      setEndTime("");
      if (startTime === DEFAULT_CLOSE_TIME) {
        setEndTimeSlots([]);
        return;
      }
      const newStartTime = moment(startTime, "HH:mm:ss")
        .add({ minutes: TIME_GAP })
        .format("HH:mm:ss");

      let newEndTime = moment(startTime, "HH:mm:ss")
        .add({
          hours: MAX_SHIFT_WITH_LUNCH,
        })
        .format("HH:mm:ss");

      if (newEndTime < DEFAULT_CLOSE_TIME && newEndTime < startTime) {
        let newHours = getDuration(
          moment(startTime, "HH:mm:ss"),
          moment(DEFAULT_CLOSE_TIME, "HH:mm:ss")
        ).durationHours;

        newEndTime = moment(startTime, "HH:mm:ss")
          .add({ hours: newHours })
          .format("HH:mm:ss");
      }
      setEndTimeSlots(generateTimeSlots(newStartTime, newEndTime, startTime));
    }
  }, [startTime]);
  useEffect(() => {
    getMyStorePeakHoursConfig();
  }, []);

  const getMyStorePeakHoursConfig = async () => {
    const res = await get<IPeakHoursConfig[]>(ENDPOINT["/peak-hours"][""]);
    if (res?.length) {
      setPeakHoursConfig(res);
    } else {
      setPeakHoursConfig([]);
    }
  };

  const onAddConfig = () => {
    setErr("");
    onAddConfigOpen();
    setConfigId(0);
    setEffectiveDate("");
    setSelectedYear("");
    setStartTime("");
    setEndTime("");
    setEndTimeSlots([]);
    setPeakHourIntervalIndex(-1);
    setPeakHourIntervals([]);
  };
  const onEditConfig = (props: {
    startTime: string;
    endTime: string;
    effectiveDate: string;
    peakHourIntervalIndex: number;
    configId: number;
  }) => {
    const {
      startTime,
      endTime,
      effectiveDate,
      peakHourIntervalIndex,
      configId,
    } = props;
    setErr("");
    setStartTime(startTime);
    setEndTime(endTime);
    setEffectiveDate(effectiveDate);
    setSelectedYear(moment(effectiveDate).year().toString());
    setPeakHourIntervalIndex(peakHourIntervalIndex);
    setConfigId(configId);
    onAddConfigOpen();
  };
  const onSaveConfig = async (deleteInterval?: boolean) => {
    setErr("");
    if (configId) {
      let peakHourIntervals =
        peakHourIntervalIndex === -2
          ? {
              peakHourIntervals: peakHoursConfig?.find(
                ({ id }) => id === configId
              )?.peakHourIntervals,
              err: "",
            }
          : getUpdatePeakHoursIntervals(deleteInterval);
      if (peakHourIntervals.err) {
        setErr(peakHourIntervals.err);
        return;
      }
      onSaving();
      const res = await put<IApiResponse>(
        ENDPOINT["/peak-hours"][""] + `/${configId}`,
        {
          data: {
            configType: "STORE",
            effectiveDate,
            peakHourIntervals: peakHourIntervals.peakHourIntervals,
            costCentre: selectedCostCenterName,
          },
        }
      );
      offSaving();
      onAddConfigClose();
      onIntervalDeleteConfirmationClose();
      if (res?.success) {
        getMyStorePeakHoursConfig();
      }
      addToast(res.message || "Something went wrong", {
        appearance: res.success ? "success" : "error",
      });
    } else {
      onSaving();
      const res = await post<IApiResponse>(ENDPOINT["/peak-hours"][""], {
        data: {
          configType: "STORE",
          costCentre: selectedCostCenterName,
          effectiveDate,
          peakHourIntervals: [
            {
              startTime,
              endTime,
            },
          ],
        },
      });
      offSaving();
      onAddConfigClose();
      if (res?.success) {
        getMyStorePeakHoursConfig();
      }
      addToast(res.message || "Something went wrong", {
        appearance: res.success ? "success" : "error",
      });
    }
  };

  const getUpdatePeakHoursIntervals = (deleteInterval?: boolean) => {
    let err = "";
    let peakHourIntervals = peakHoursConfig?.find(
      ({ id }) => id === configId
    )?.peakHourIntervals;
    if (peakHourIntervalIndex !== -1) {
      if (peakHourIntervals?.length) {
        if (deleteInterval) {
          peakHourIntervals.splice(peakHourIntervalIndex as number, 1);
        } else {
          const { isConflictWithPrimary, error } = getShiftStatusV2({
            currentShift: {
              startTime,
              endTime,
              type: "primary",
            },
            main: peakHourIntervals
              .filter(
                (obj) => obj.startTime !== startTime && obj.endTime !== endTime
              )
              .map(({ startTime: s, endTime: e }) => ({
                s,
                e,
                c: "",
              })),
            others: [],
            misc: [],
          });
          if (
            peakHourIntervals.findIndex(
              (obj) => obj.startTime === startTime && obj.endTime === endTime
            ) >= 0
          ) {
            err =
              "A shift with the same time already exists. Please choose a different shift interval timing.";
          } else if (isConflictWithPrimary) {
            err = error;
          } else {
            peakHourIntervals[peakHourIntervalIndex as number].startTime =
              startTime;
            peakHourIntervals[peakHourIntervalIndex as number].endTime =
              endTime;
          }
        }
      } else {
        peakHourIntervals = [
          {
            startTime,
            endTime,
          },
        ];
      }
    } else {
      if (peakHourIntervals?.length) {
        const { isConflictWithPrimary, error } = getShiftStatusV2({
          currentShift: {
            startTime,
            endTime,
            type: "primary",
          },
          main: peakHourIntervals
            // .filter(
            //   (obj) => obj.startTime !== startTime && obj.endTime !== endTime
            // )
            .map(({ startTime: s, endTime: e }) => ({
              s,
              e,
              c: "",
            })),
          others: [],
          misc: [],
        });
        if (
          peakHourIntervals.findIndex(
            (obj) => obj.startTime === startTime && obj.endTime === endTime
          ) >= 0
        ) {
          err =
            "A shift with the same time already exists. Please choose a different shift interval timing.";
        } else if (isConflictWithPrimary) {
          err = error;
        } else {
          peakHourIntervals.push({
            startTime,
            endTime,
          });
        }
      } else {
        peakHourIntervals = [
          {
            startTime,
            endTime,
          },
        ];
      }
    }
    return { peakHourIntervals, err };
  };
  const onDeleteConfig = async () => {
    if (configId) {
      onDeleting();
      const res = await Delete<IApiResponse>(
        ENDPOINT["/peak-hours"][""] + `/${configId}`
      );
      offDeleting();
      onConfigDeleteConfirmationClose();
      if (res?.success) {
        getMyStorePeakHoursConfig();
      }
      addToast(res.message || "Something went wrong", {
        appearance: res.success ? "success" : "error",
      });
    }
  };
  const ConfigCard = (props: {
    configType: IPeakHoursConfig["configType"];
    effectiveDate: IPeakHoursConfig["effectiveDate"];
    id: IPeakHoursConfig["id"];
    peakHourIntervals: IPeakHoursConfig["peakHourIntervals"];
    live?: boolean;
  }) => {
    const { configType, effectiveDate, id, peakHourIntervals, live } = props;
    return (
      <Flex
        style={{
          borderRadius: 4,
          border: "1px solid lightgrey",
          overflow: "hidden",
        }}
        justifyContent={"space-between"}
        alignItems={"start"}
        shadow={live ? "md" : "sm"}
        background={
          live
            ? "radial-gradient(circle at 10% 50%, #027dbc0d 0%, #027dbc1a 90%)"
            : !id
            ? "gray.50"
            : "none"
        }
        opacity={live || id ? 1 : 0.75}
      >
        <Flex p={"2"} direction={"column"} alignItems={"start"}>
          <Text fontSize={"sm"} mb={"1"}>
            Peak Hour Intervals
          </Text>
          <Flex direction={"column"} alignItems={"start"}>
            {peakHourIntervals
              .sort(
                (a, b) =>
                  moment(a.startTime, "HH:mm:ss").unix() -
                  moment(b.startTime, "HH:mm:ss").unix()
              )
              .map(({ startTime, endTime }, i) => (
                <Flex
                  mt={"2"}
                  key={`${startTime}_${endTime}`}
                  alignItems={"center"}
                >
                  <Badge>
                    {`${moment(startTime, "HH:mm:ss").format(
                      "hh:mm A"
                    )} - ${moment(endTime, "HH:mm:ss").format("hh:mm A")}`}
                  </Badge>
                  {id &&
                  configType !== "DEFAULT" &&
                  checkForPermission(
                    PERMISSION["My Store"]["Store Configuration"].Update
                  ) ? (
                    <>
                      <IconButton
                        size={"xs"}
                        variant={"ghost"}
                        aria-label="Edit"
                        ml={"2"}
                        onClick={() => {
                          onEditConfig({
                            startTime,
                            endTime,
                            effectiveDate,
                            peakHourIntervalIndex: i,
                            configId: id,
                          });
                        }}
                      >
                        <FiEdit />
                      </IconButton>
                      <IconButton
                        size={"xs"}
                        variant={"ghost"}
                        aria-label="Delete Button"
                        colorScheme="red"
                        color={"#e85f5f"}
                        isDisabled={peakHourIntervals.length === 1}
                        onClick={() => {
                          setConfigId(id);
                          setPeakHourIntervalIndex(i);
                          setEffectiveDate(effectiveDate);
                          setErr("");
                          onIntervalDeleteConfirmationOpen();
                        }}
                      >
                        <AiFillDelete />
                      </IconButton>
                    </>
                  ) : null}
                </Flex>
              ))}
            {id &&
            configType !== "DEFAULT" &&
            checkForPermission(
              PERMISSION["My Store"]["Store Configuration"].Update
            ) ? (
              <Button
                mt={"1"}
                size={"sm"}
                fontSize={"xs"}
                variant={"ghost"}
                onClick={() => {
                  onEditConfig({
                    startTime: "",
                    endTime: "",
                    effectiveDate,
                    peakHourIntervalIndex: -1,
                    configId: id,
                  });
                }}
              >
                + Add Interval
              </Button>
            ) : null}
          </Flex>
        </Flex>
        <Flex p={"2"} direction={"column"} alignItems={"end"} height={"full"}>
          <Flex alignItems={"center"}>
            <Text fontWeight={"bold"}>{`Effective Date: ${formatDate(
              effectiveDate
            )}`}</Text>
            {id &&
            configType !== "DEFAULT" &&
            checkForPermission(
              PERMISSION["My Store"]["Store Configuration"].Update
            ) ? (
              <IconButton
                size={"xs"}
                variant={"ghost"}
                aria-label=""
                ml={"2"}
                onClick={() => {
                  onEditConfig({
                    startTime: "",
                    endTime: "",
                    effectiveDate,
                    peakHourIntervalIndex: -2,
                    configId: id,
                  });
                }}
              >
                <FiEdit />
              </IconButton>
            ) : null}
          </Flex>

          {configType === "DEFAULT" || live ? (
            <Flex alignItems={"center"} pt={"1"}>
              {configType === "DEFAULT" ? (
                <Badge colorScheme={"yellow"}>{"DEFAULT"}</Badge>
              ) : null}

              {live ? (
                <Badge colorScheme={"green"} ml={"2"}>
                  {"ACTIVE"}
                </Badge>
              ) : null}
            </Flex>
          ) : null}
          {id &&
          configType !== "DEFAULT" &&
          checkForPermission(
            PERMISSION["My Store"]["Store Configuration"].Update
          ) ? (
            <Flex mt={"auto"} pt={"4"}>
              <Button
                leftIcon={<AiFillDelete />}
                size={"sm"}
                variant={"ghost"}
                colorScheme="red"
                color={"#e85f5f"}
                onClick={() => {
                  setErr("");
                  setConfigId(id);
                  onConfigDeleteConfirmationOpen();
                }}
              >
                Delete
              </Button>
            </Flex>
          ) : null}
        </Flex>
      </Flex>
    );
  };
  return (
    <AppContainer heading="Store Configuration">
      <AppTabs
        setValue={(value) => {
          setView(value);
        }}
        value={view}
        tabs={TABS}
      >
        <Flex alignItems={"center"}>
          {view === TABS[0].value &&
          checkForPermission(
            PERMISSION["My Store"]["Store Configuration"].Update
          ) ? (
            <Button
              mr={"4"}
              leftIcon={<FiPlus />}
              onClick={() => onAddConfig()}
            >
              Add Peak Hours
            </Button>
          ) : null}
        </Flex>
      </AppTabs>

      <Flex width={"100%"} direction={"column"}>
        {peakHoursConfig?.length ? (
          <Flex direction={"column"}>
            <Flex direction={"column"} mb={"4"}>
              {/* <Text
                fontSize={"lg"}
                fontWeight={"medium"}
                mb={"1"}
                textDecoration={"underline"}
              >
                Current Peak Hours Configuration
              </Text> */}
              <Grid gap={"4"} gridTemplateColumns={"1fr 1fr"}>
                {peakHoursConfig
                  .filter(
                    ({ effectiveDate }) =>
                      !isFutureDate(new Date(effectiveDate))
                  )
                  .sort(
                    (a, b) =>
                      moment(b.effectiveDate).unix() -
                      moment(a.effectiveDate).unix()
                  )
                  .slice(0, 1)
                  .map(
                    ({ configType, effectiveDate, id, peakHourIntervals }) => (
                      <ConfigCard
                        configType={configType}
                        effectiveDate={effectiveDate}
                        id={0}
                        peakHourIntervals={peakHourIntervals}
                        key={id}
                        live={true}
                      />
                    )
                  )}
              </Grid>
            </Flex>
            <Flex direction={"column"} mb={"4"}>
              <Text
                fontSize={"lg"}
                fontWeight={"medium"}
                mb={"1"}
                textDecoration={"underline"}
              >
                Upcoming Configurations
              </Text>
              {peakHoursConfig
                .filter(({ effectiveDate }) =>
                  isFutureDate(new Date(effectiveDate))
                )
                .sort(
                  (a, b) =>
                    moment(a.effectiveDate).unix() -
                    moment(b.effectiveDate).unix()
                ).length ? (
                <Grid gap={"4"} gridTemplateColumns={"1fr 1fr"}>
                  {peakHoursConfig
                    .filter(({ effectiveDate }) =>
                      isFutureDate(new Date(effectiveDate))
                    )
                    .sort(
                      (a, b) =>
                        moment(a.effectiveDate).unix() -
                        moment(b.effectiveDate).unix()
                    )
                    .map(
                      ({
                        configType,
                        effectiveDate,
                        id,
                        peakHourIntervals,
                      }) => (
                        <ConfigCard
                          configType={configType}
                          effectiveDate={effectiveDate}
                          id={id}
                          peakHourIntervals={peakHourIntervals}
                          key={id}
                        />
                      )
                    )}
                </Grid>
              ) : (
                <Flex
                  minHeight={"100px"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Text fontSize={"sm"} color={"gray"}>
                    No Data Found!
                  </Text>
                </Flex>
              )}
            </Flex>
            <Flex direction={"column"}>
              <Text
                fontSize={"lg"}
                fontWeight={"medium"}
                mb={"1"}
                textDecoration={"underline"}
              >
                Past Configurations
              </Text>
              {peakHoursConfig
                .filter(
                  ({ effectiveDate }) => !isFutureDate(new Date(effectiveDate))
                )
                .sort(
                  (a, b) =>
                    moment(b.effectiveDate).unix() -
                    moment(a.effectiveDate).unix()
                )
                .slice(1).length ? (
                <Grid gap={"4"} gridTemplateColumns={"1fr 1fr"}>
                  {peakHoursConfig
                    .filter(
                      ({ effectiveDate }) =>
                        !isFutureDate(new Date(effectiveDate))
                    )
                    .sort(
                      (a, b) =>
                        moment(b.effectiveDate).unix() -
                        moment(a.effectiveDate).unix()
                    )
                    .slice(1)
                    .map(
                      ({
                        configType,
                        effectiveDate,
                        id,
                        peakHourIntervals,
                      }) => (
                        <ConfigCard
                          configType={configType}
                          effectiveDate={effectiveDate}
                          id={0}
                          peakHourIntervals={peakHourIntervals}
                          key={id}
                        />
                      )
                    )}
                </Grid>
              ) : (
                <Flex
                  minHeight={"100px"}
                  justifyContent={"center"}
                  alignItems={"center"}
                >
                  <Text fontSize={"sm"} color={"gray"}>
                    No Data Found!
                  </Text>
                </Flex>
              )}
            </Flex>
          </Flex>
        ) : null}
      </Flex>
      <Modal
        isOpen={isConfigDeleteConfimationOpen}
        onClose={onConfigDeleteConfirmationClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Configuration</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onConfigDeleteConfirmationClose}
            >
              Close
            </Button>
            <Button
              aria-label="delete-dialog-box"
              colorScheme="red"
              variant={"solid"}
              fontSize={"sm"}
              onClick={onDeleteConfig}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <AppRightDrawer
        isOpen={isAddConfigOpen}
        onClose={onAddConfigClose}
        heading={`${
          configId ? (peakHourIntervalIndex === -1 ? "Add" : "Edit") : "Add"
        } ${
          peakHourIntervalIndex === -2
            ? "Configuration"
            : !configId
            ? "Configuration"
            : "Interval"
        }`}
      >
        <Flex direction={"column"}>
          <FormControl mb={"4"} isRequired>
            <FormLabel>Select Year</FormLabel>
            <AppSelect
              disabled={configId ? peakHourIntervalIndex !== -2 : false}
              onChange={(value) => {
                setSelectedYear(value);
                setEffectiveDate("");
              }}
              options={
                years?.length
                  ? years.map((year) => ({
                      label: year,
                      value: year,
                    }))
                  : []
              }
              value={selectedYear}
            />
          </FormControl>
          <FormControl mb={"4"} isRequired>
            <FormLabel>Effective Week</FormLabel>
            <AppSelect
              disabled={configId ? peakHourIntervalIndex !== -2 : false}
              onChange={(value) =>
                setEffectiveDate(moment(value).format("YYYY-MM-DD"))
              }
              options={
                weeks?.length
                  ? weeks
                      .filter(
                        ({ startDate }) =>
                          moment(startDate).unix() > moment().unix()
                      )
                      .map(({ startDate, number }) => ({
                        label: `Week ${number} (${formatDate(
                          startDate
                        )} onwards)`,
                        value: moment(startDate).format("YYYY-MM-DD"),
                      }))
                  : []
              }
              value={effectiveDate}
            />
          </FormControl>
          {(peakHourIntervalIndex as number) >= -1 ? (
            <>
              <FormControl mb={"4"} isRequired>
                <FormLabel>Start Time</FormLabel>
                <AppSelect
                  options={startTimeSlots}
                  onChange={setStartTime}
                  value={startTime}
                />
              </FormControl>
              <FormControl mb={"4"} isRequired>
                <FormLabel>End Time</FormLabel>
                <AppSelect
                  options={endTimeSlots}
                  onChange={setEndTime}
                  value={endTime}
                />
              </FormControl>
            </>
          ) : null}
        </Flex>
        <Flex direction={"column"}>
          {err ? (
            <Flex width={"full"}>
              <Text
                width={"full"}
                background={"#fff7d6"}
                color={"#907400"}
                fontSize={"xs"}
                px={"4"}
                py={"2"}
                rounded={"md"}
                textAlign={"center"}
                mb={"4"}
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: err,
                  }}
                ></span>
              </Text>
            </Flex>
          ) : null}
          <Button
            width={"full"}
            mb={"4"}
            onClick={() => onSaveConfig()}
            isLoading={isSaving}
            isDisabled={
              (peakHourIntervalIndex === -2 ? false : !startTime || !endTime) ||
              !effectiveDate
            }
          >
            Save
          </Button>
        </Flex>
      </AppRightDrawer>
      <Modal
        isOpen={isIntervalDeleteConfimationOpen}
        onClose={onIntervalDeleteConfirmationClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Interval</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete?</Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="outline"
              fontSize={"sm"}
              mr={3}
              onClick={onIntervalDeleteConfirmationClose}
            >
              Close
            </Button>
            <Button
              colorScheme="red"
              variant={"solid"}
              fontSize={"sm"}
              onClick={() => {
                onSaveConfig(true);
              }}
              isLoading={isSaving}
            >
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AppContainer>
  );
}

export default StoreConfiguration;
