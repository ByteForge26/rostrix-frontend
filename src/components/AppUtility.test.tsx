import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AppUtility from "./AppUtility";
import { useAppSelector, useAppDispatch } from "../app/store/store";
import { useLogin } from "../hooks/useLogin";
import { useCountdown } from "../hooks/useCountdown";
import { onMessageListener, requestForToken } from "../firebase/firebase";
import { useApi } from "../hooks/useApi";
import { isMobile } from "../helper/Utils";

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
  ToastProvider: ({ children }) => children,
}));
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));
jest.mock("@chakra-ui/react", () => {
  const actual = jest.requireActual("@chakra-ui/react");
  return {
    ...actual,
    FormControl: ({ children }) => (
      <div data-testid="form-control">{children}</div>
    ),
    FormLabel: ({ children }) => <div data-testid="form-label">{children}</div>,
    Grid: ({ children }) => <div data-testid="grid">{children}</div>,
    Modal: ({ isOpen, children }) =>
      isOpen ? <div data-testid="modal">{children}</div> : null,
    ModalBody: ({ children }) => <div data-testid="modal-body">{children}</div>,
    ModalContent: ({ children }) => (
      <div data-testid="modal-content">{children}</div>
    ),
    ModalHeader: ({ children }) => (
      <div data-testid="modal-header">{children}</div>
    ),
    ModalOverlay: () => <div data-testid="modal-overlay" />,
    Text: ({ children }) => <div data-testid="text">{children}</div>,
    useDisclosure: () => ({
      isOpen: false,
      onOpen: jest.fn(),
      onClose: jest.fn(),
    }),
  };
});

jest.mock("react", () => {
  const originalReact = jest.requireActual("react");
  return {
    ...originalReact,
    useState: jest.fn(),
  };
});

jest.mock("../app/store/store", () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
}));

jest.mock("../hooks/useLogin", () => ({
  useLogin: jest.fn(),
}));

jest.mock("../hooks/useCountdown", () => ({
  useCountdown: jest.fn(),
}));

jest.mock("../firebase/firebase", () => ({
  onMessageListener: jest.fn(),
  requestForToken: jest.fn(),
}));

jest.mock("../hooks/useApi", () => ({
  useApi: jest.fn(),
}));

jest.mock("../helper/Utils", () => ({
  isMobile: jest.fn(),
}));

jest.mock("./AppSelectCostCenter", () => () => (
  <div data-testid="app-select-cost-center" />
));

describe("AppUtility Component", () => {
  const mockDispatch = jest.fn();
  const mockReLoginWithRefreshToken = jest.fn();
  const mockPost = jest.fn();
  const mockRequestForToken = jest.fn();
  const mockOnMessageListener = jest.fn();

  let mockIsOpen = false;
  const mockOnOpen = jest.fn(() => {
    mockIsOpen = true;
  });
  const mockOnClose = jest.fn(() => {
    mockIsOpen = false;
  });
  let mockIsLoginAttempted = false;
  const mockSetIsLoginAttempted = jest.fn((value) => {
    mockIsLoginAttempted = value;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    useAppDispatch.mockReturnValue(mockDispatch);
    useLogin.mockReturnValue({
      reLoginWithRefreshToken: mockReLoginWithRefreshToken,
    });
    useApi.mockReturnValue({ post: mockPost });
    useCountdown.mockReturnValue(300);
    requestForToken.mockImplementation(mockRequestForToken);
    onMessageListener.mockReturnValue(Promise.resolve({}));
    isMobile.mockReturnValue(false);

    mockIsOpen = false;
    mockIsLoginAttempted = false;

    const React = require("react");
    React.useState.mockImplementation((initialValue) => {
      if (initialValue === false) {
        return [mockIsLoginAttempted, mockSetIsLoginAttempted];
      }

      return [initialValue, jest.fn()];
    });

    jest
      .spyOn(require("@chakra-ui/react"), "useDisclosure")
      .mockImplementation(() => ({
        isOpen: mockIsOpen,
        onOpen: mockOnOpen,
        onClose: mockOnClose,
      }));

    useAppSelector.mockReturnValue({
      expiresIn: "300",
      refreshToken: "refresh-token-123",
      user: { userId: 123 },
      isLoggedIn: true,
      fcmToken: "existing-fcm-token",
      fcmTokenId: 456,
      selectedCostCenterName: "Test Cost Center",
    });

    mockRequestForToken.mockResolvedValue("new-fcm-token");
    mockPost.mockResolvedValue({ success: true, tokenId: 789 });
  });

  test("should request FCM token on mount when user is logged in", async () => {
    render(<AppUtility />);

    await waitFor(() => {
      expect(mockRequestForToken).toHaveBeenCalled();
    });
  });

  test("should not request FCM token when user is not logged in", () => {
    useAppSelector.mockReturnValue({
      expiresIn: "300",
      refreshToken: "refresh-token-123",
      user: null,
      isLoggedIn: false,
      fcmToken: "",
      fcmTokenId: 0,
      selectedCostCenterName: "Test Cost Center",
    });

    render(<AppUtility />);

    expect(mockRequestForToken).not.toHaveBeenCalled();
  });

  test("should send token to server when new token is received", async () => {
    mockRequestForToken.mockResolvedValue("new-different-token");

    render(<AppUtility />);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(expect.any(String), {
        data: {
          token: "new-different-token",
          deviceType: "WEB",
          userId: 123,
          oldTokenId: 456,
        },
      });
    });
  });

  test("should not send token to server when token is unchanged", async () => {
    mockRequestForToken.mockResolvedValue("existing-fcm-token");

    render(<AppUtility />);

    await waitFor(() => {
      expect(mockRequestForToken).toHaveBeenCalled();
      expect(mockPost).not.toHaveBeenCalled();
    });
  });

  test("should update token in store when server responds successfully", async () => {
    mockRequestForToken.mockResolvedValue("new-token");
    mockPost.mockResolvedValue({ success: true, tokenId: 789 });

    render(<AppUtility />);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining("updateFcmToken"),
        }),
      );
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: expect.stringContaining("updateFcmTokenId"),
        }),
      );
    });
  });

  test("should detect mobile device and send appropriate device type", async () => {
    isMobile.mockReturnValue(true);
    mockRequestForToken.mockResolvedValue("new-token-mobile");

    render(<AppUtility />);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          data: expect.objectContaining({
            deviceType: "M_WEB",
          }),
        }),
      );
    });
  });

  test("should attempt to refresh token when expiry is approaching", async () => {
    useCountdown.mockReturnValue(55);

    render(<AppUtility />);

    await waitFor(() => {
      expect(mockReLoginWithRefreshToken).toHaveBeenCalled();
    });
  });

  test("should not attempt to refresh token when time is not approaching expiry", async () => {
    useCountdown.mockReturnValue(120);

    render(<AppUtility />);

    expect(mockReLoginWithRefreshToken).not.toHaveBeenCalled();
  });

  test("should reset login attempt flag when time increases beyond threshold", async () => {
    mockIsLoginAttempted = true;
    useCountdown.mockReturnValue(120);

    render(<AppUtility />);

    await waitFor(() => {
      expect(mockSetIsLoginAttempted).toHaveBeenCalledWith(false);
    });
  });

  test("should open modal when there's no selected cost center and user exists", async () => {
    mockIsOpen = false;
    useAppSelector.mockReturnValue({
      expiresIn: "300",
      refreshToken: "refresh-token-123",
      user: { userId: 123 },
      isLoggedIn: true,
      fcmToken: "existing-fcm-token",
      fcmTokenId: 456,
      selectedCostCenterName: "",
    });

    render(<AppUtility />);

    await waitFor(() => {
      expect(mockOnOpen).toHaveBeenCalled();
    });
  });

  test("should close modal when selected cost center becomes available", async () => {
    mockIsOpen = true;
    useAppSelector.mockReturnValue({
      expiresIn: "300",
      refreshToken: "refresh-token-123",
      user: { userId: 123 },
      isLoggedIn: true,
      fcmToken: "existing-fcm-token",
      fcmTokenId: 456,
      selectedCostCenterName: "New Cost Center",
    });

    render(<AppUtility />);

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  test("should handle error in onMessageListener", async () => {
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "log").mockImplementation(() => {});

    onMessageListener.mockRejectedValue("Test error");

    render(<AppUtility />);

    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith("failed: ", "Test error");
    });

    jest.restoreAllMocks();
  });

  test("should correctly render the modal with proper props", () => {
    mockIsOpen = true;
    jest
      .spyOn(require("@chakra-ui/react"), "useDisclosure")
      .mockImplementation(() => ({
        isOpen: true,
        onOpen: mockOnOpen,
        onClose: mockOnClose,
      }));

    const { container } = render(<AppUtility />);

    const modalElement = container.querySelector('[data-testid="modal"]');
    expect(modalElement).toBeInTheDocument();

    expect(
      container.querySelector('[data-testid="modal-header"]'),
    ).toBeInTheDocument();
    expect(
      container.querySelector('[data-testid="app-select-cost-center"]'),
    ).toBeInTheDocument();
  });
});
