import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Login from "./Login";
import { useLogin } from "../../hooks/useLogin";
import { Provider } from "react-redux";
import { store } from "../../app/store/store";
import React from "react";

jest.mock("../../helper/Images", () => ({
  effiMateLogo: "mock-logo-url",
}));

jest.mock("../../hooks/useLogin", () => ({
  useLogin: jest.fn(),
}));

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: jest.fn(),
  }),
}));

describe("Login Component", () => {
  const mockOnLogin = jest.fn();
  const mockOnEmailLogin = jest.fn();
  const mockGetToken = jest.fn();
  const mockSetEmail = jest.fn();

  beforeEach(() => {
    jest.setTimeout(60000);
    (useLogin as jest.Mock).mockReturnValue({
      getToken: mockGetToken,
      onLogin: mockOnLogin,
      onEmailLogin: mockOnEmailLogin,
      email: "",
      setEmail: mockSetEmail,
      isLoading: false,
    });

    jest.clearAllMocks();
  });

  test("renders login form correctly", () => {
    render(
      <Router>
        <Provider store={store}>
          <Login />
        </Provider>
      </Router>
    );

    expect(screen.getByAltText("")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login with fedid/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /login with email/i })
    ).toBeInTheDocument();
  });

  test('handles "Login with FEDID" button click', () => {
    render(
      <Router>
        <Provider store={store}>
          <Login />
        </Provider>
      </Router>
    );

    fireEvent.click(screen.getByRole("button", { name: /login with fedid/i }));

    expect(mockOnLogin).toHaveBeenCalledTimes(1);
  });

  test('handles "Login with Email" button click and shows loading spinner', async () => {
    (useLogin as jest.Mock).mockReturnValueOnce({
      getToken: mockGetToken,
      onLogin: mockOnLogin,
      onEmailLogin: mockOnEmailLogin,
      email: "test@example.com",
      setEmail: mockSetEmail,
      isLoading: true,
    });

    render(
      <Router>
        <Provider store={store}>
          <Login />
        </Provider>
      </Router>
    );

    const loadingButton = await screen.findByRole("button", {
      name: /loading.../i,
    });

    expect(loadingButton).toBeInTheDocument();

    fireEvent.click(loadingButton);

    expect(mockOnEmailLogin).toHaveBeenCalledTimes(1);
  });

  test("handles email input change", () => {
    render(
      <Router>
        <Provider store={store}>
          <Login />
        </Provider>
      </Router>
    );

    const emailInput = screen.getByPlaceholderText(/enter email/i);
    fireEvent.change(emailInput, {
      target: { value: "shailendra.khurana.partner@decathlon.com" },
    });

    expect(mockSetEmail).toHaveBeenCalledWith(
      "shailendra.khurana.partner@decathlon.com"
    );
  });
  test('correctly handles URL "code" parameter on mount', () => {
    const searchParams = new URLSearchParams();
    searchParams.append("code", "12345");

    window.history.pushState({}, "", `?${searchParams.toString()}`);

    render(
      <Router>
        <Provider store={store}>
          <Login />
        </Provider>
      </Router>
    );
    expect(mockGetToken).toHaveBeenCalledWith("12345");
  });

  test('does not call getToken when "code" parameter is missing', () => {
    const searchParams = new URLSearchParams();
    window.history.pushState({}, "", `?${searchParams.toString()}`);

    render(
      <Router>
        <Provider store={store}>
          <Login />
        </Provider>
      </Router>
    );

    expect(mockGetToken).not.toHaveBeenCalled();
  });

  test('calls getToken when "code" is present in the URL', () => {
    const searchParams = new URLSearchParams();
    searchParams.append("code", "12345");
    window.history.pushState({}, "", `?${searchParams.toString()}`);

    render(
      <Router>
        <Provider store={store}>
          <Login />
        </Provider>
      </Router>
    );

    expect(mockGetToken).toHaveBeenCalledWith("12345");
  });

  test('does not call getToken when "code" is an empty string', () => {
    const searchParams = new URLSearchParams();
    searchParams.append("code", "");
    window.history.pushState({}, "", `?${searchParams.toString()}`);

    render(
      <Router>
        <Provider store={store}>
          <Login />
        </Provider>
      </Router>
    );

    expect(mockGetToken).not.toHaveBeenCalled();
  });

  test('does not call getToken when "code" is undefined', () => {
    const searchParams = new URLSearchParams();
    window.history.pushState({}, "", `?${searchParams.toString()}`);

    render(
      <Router>
        <Provider store={store}>
          <Login />
        </Provider>
      </Router>
    );

    expect(mockGetToken).not.toHaveBeenCalled();
  });
});
