import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { store, useAppSelector } from "../../app/store/store";
import ManageLocations from "./ManageLocations";
import { Provider } from "react-redux";
import { useApi } from "../../hooks/useApi";
import { usePermission } from "../../hooks/usePermission";
import { act } from "react-dom/test-utils";
import { setImmediate } from "timers";
import React from "react";

const flushPromises = () => new Promise(setImmediate);

const mockAddToast = jest.fn();



window.scrollTo = jest.fn();
window.matchMedia =
  window.matchMedia ||
  (() => ({
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));

jest.mock("react-router-dom", () => ({ useNavigate: jest.fn() }));

jest.mock("react-toast-notifications", () => ({
  useToasts: () => ({
    addToast: mockAddToast,
  }),
}));

jest.mock("../../app/store/store", () => ({
  useAppSelector: jest.fn(),
  useAppDispatch: jest.fn(),
  store: { getState: jest.fn(), subscribe: jest.fn() },
}));

jest.mock("../../hooks/useApi", () => ({ useApi: jest.fn() }));
jest.mock("../../hooks/usePermission", () => ({ usePermission: jest.fn() }));

const useApiMock = useApi as jest.Mock;
const usePermissionMock = usePermission as jest.Mock;
const useAppSelectorMock = useAppSelector as jest.Mock;

const mockCountryResponse = [
  {
    id: 1,
    name: "India",
    code: "IN",
    capitalName: "New Delhi",
    phoneCode: "+91",
    currency: "INR",
    nationality: "Indian",
  },
  {
    id: 2,
    name: "USA",
    code: "US",
    capitalName: "Washington D.C.",
    phoneCode: "+1",
    currency: "USD",
    nationality: "American",
  },
];

const mockStateResponse = [
  {
    id: 101,
    name: "Karnataka",
    code: "KA",
    countryId: 1,
    countryName: "India",
  },
  { 
    id: 102, 
    name: "California", 
    code: "CA", 
    countryId: 2, 
    countryName: "USA" 
  },
];

const mockCityResponse = [
  { 
    id: 201, 
    name: "Bangalore", 
    stateName: "Karnataka", 
    stateId: 101 
  },
  { 
    id: 202, 
    name: "San Francisco", 
    stateName: "California", 
    stateId: 102 
  },
];


describe("Manage Locations Component", () => {


  const mockApiImplementation = {
    get: jest.fn((endpoint, config) => {
      
      if (endpoint.includes("/country")) {
        return Promise.resolve(mockCountryResponse);
      }
      if (endpoint.includes("/state")) {
        return Promise.resolve(mockStateResponse);
      }
      if (endpoint.includes("/city")) {
        return Promise.resolve(mockCityResponse);
      }
      return Promise.resolve([]);
    }),
    post: jest.fn(() => Promise.resolve({ success: true, message: "Created successfully" })),
    put: jest.fn(() => Promise.resolve({ success: true, message: "Updated successfully" })),
  };
 

  const renderComponent = async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <ManageLocations />
        </Provider>
      );
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useApiMock).mockReturnValue({
      get: jest.fn((endpoint) => {
        if (endpoint.includes("/country")) {
          return Promise.resolve(mockCountryResponse);
        }
        if (endpoint.includes("/state")) {
          return Promise.resolve(mockStateResponse);
        }
        if (endpoint.includes("/city")) {
          return Promise.resolve(mockCityResponse);
        }
        return Promise.resolve([]);
      }),
      post: jest.fn(() => Promise.resolve({ success: true, message: "Created successfully" })),
      put: jest.fn(() => Promise.resolve({ success: true, message: "Updated successfully" })),
    });

    (usePermissionMock).mockReturnValue({
      checkForPermission: jest.fn().mockReturnValue(true),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    (useAppSelectorMock).mockReturnValue({
      selectedCostCenterName: "IN1041",
      user: { empId: "DSI000486" },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("renders locations with multiple states and cities", async () => {
    await renderComponent();

   

    await flushPromises();

    await waitFor(() => {
      expect(screen.getByText(/Karnataka/i)).toBeInTheDocument();
      expect(screen.getByText(/California/i)).toBeInTheDocument();
    });
  });

  it("handles state creation successfully", async () => {
    mockApiImplementation.post.mockResolvedValue({ 
      success: true, 
      message: "State created successfully" 
    });

    await renderComponent();
    const addStateButton = screen.getByText("+ Add State");
    fireEvent.click(addStateButton);

    const inputs = screen.getAllByPlaceholderText("Enter here");
    const nameInput = inputs[0];
    const codeInput = inputs[1];

    fireEvent.change(nameInput, { target: { value: "Test State" } });
    fireEvent.change(codeInput, { target: { value: "TS" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);
  });

  it("handles state creation errors", async () => {
    mockApiImplementation.post.mockResolvedValue({ 
      success: false, 
      message: "Creation failed" 
    });

    await renderComponent();

    const addStateButton = screen.getByText("+ Add State");
    fireEvent.click(addStateButton);

    const inputs = screen.getAllByPlaceholderText("Enter here");
    const nameInput = inputs[0];
    const codeInput = inputs[1];

    fireEvent.change(nameInput, { target: { value: "Test State" } });
    fireEvent.change(codeInput, { target: { value: "TS" } });

    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);

  });

  it("disables save button when form is incomplete", async () => {
    await renderComponent();

    const addStateButton = screen.getByText("+ Add State");
    fireEvent.click(addStateButton);

    const saveButton = screen.getByText("Save");

    const inputs = screen.getAllByPlaceholderText("Enter here");
    const nameInput = inputs[0];

    fireEvent.change(nameInput, { target: { value: "Test State" } });

    expect(saveButton).toBeDisabled();
  });

  it("restricts UI when permissions are limited", async () => {
   
    (usePermissionMock).mockReturnValue({
      checkForPermission: jest.fn((permission) => false),
      transformRoutes: jest.fn().mockReturnValue([]),
    });

    await renderComponent();

    const addStateButton = screen.queryByText("+ Add State");
    expect(addStateButton).toBeNull();
  });

  it("validates city name input", async () => {
    await renderComponent();

    const karnatakaState = screen.getByText("2. Karnataka");
    fireEvent.click(karnatakaState);
    const addCityButton = screen.getAllByText("+ Add City")[0];
    fireEvent.click(addCityButton);
    const nameInput = screen.getByPlaceholderText("Enter here");

    fireEvent.change(nameInput, { target: { value: "Mysore123" } });

    expect(nameInput).toHaveValue("");
  });

  it("renders locations with multiple states", async () => {
    await renderComponent();

   
  });

  it("searches states correctly", async () => {
    await renderComponent();

    const searchInput = screen.getByPlaceholderText("Search State");

    fireEvent.change(searchInput, { target: { value: "Karnataka" } });

    await waitFor(() => {
      expect(screen.getByText(/Karnataka/i)).toBeInTheDocument();
      expect(screen.queryByText(/California/i)).not.toBeInTheDocument();
    });
  });

  it("expands state and shows cities", async () => {
    await renderComponent();

    const karnatakaState = screen.getByText(/Karnataka/i);
    fireEvent.click(karnatakaState);

   
    await waitFor(() => {
     
      expect(screen.getAllByText("Bangalore")[1]).toBeInTheDocument();
    });
  });
  

it("handles state editing successfully", async () => {
  await renderComponent();

  await waitFor(() => {
    expect(screen.getByText(/Karnataka/i)).toBeInTheDocument();
  }, { timeout: 2000 });

  const stateAccordionButtons = screen.getAllByRole('button');
  const stateButton = stateAccordionButtons.find(button => 
    button.textContent?.includes('Karnataka')
  );
  
  if (!stateButton) {
    throw new Error('Karnataka state button not found');
  }
  
  fireEvent.click(stateButton);

  await waitFor(() => {
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);
  });

  await waitFor(() => {
    expect(screen.getByText("Edit State")).toBeInTheDocument();
    
    const inputs = screen.getAllByPlaceholderText("Enter here");
    const nameInput = inputs[0];
    const codeInput = inputs[1];
    
    expect(nameInput).toHaveValue("Karnataka");
    expect(codeInput).toHaveValue("KA");
    
    fireEvent.change(nameInput, { target: { value: "Karnataka Updated" } });
    fireEvent.change(codeInput, { target: { value: "KU" } });
    
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);
  });

  await waitFor(() => {
    expect(mockAddToast).toHaveBeenCalledWith(
      "Updated successfully",
      expect.objectContaining({ appearance: "success" })
    );
  });
});

it("handles city editing successfully", async () => {
  await renderComponent();

  await waitFor(() => {
    expect(screen.getByText(/Karnataka/i)).toBeInTheDocument();
  }, { timeout: 2000 });

  const stateAccordionButtons = screen.getAllByRole('button');
  const stateButton = stateAccordionButtons.find(button => 
    button.textContent?.includes('Karnataka')
  );
  
  if (!stateButton) {
    throw new Error('Karnataka state button not found');
  }
  
  fireEvent.click(stateButton);

  await waitFor(() => {
    const editIcons = screen.getAllByTestId("edit-city-icon");
    expect(editIcons.length).toBeGreaterThan(0);
  }, { timeout: 2000 });

  const editIcons = screen.getAllByTestId("edit-city-icon");
  fireEvent.click(editIcons[0]);

  await waitFor(() => {
    expect(screen.getByText(/Edit City/i)).toBeInTheDocument();
    
    const nameInput = screen.getByPlaceholderText("Enter here");
    
    expect(nameInput).toHaveValue("Bangalore");
    
    fireEvent.change(nameInput, { target: { value: "Bengaluru" } });
    
    const saveButton = screen.getByText("Save");
    fireEvent.click(saveButton);
  });

  await waitFor(() => {
    expect(mockAddToast).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ appearance: "success" })
    );
  });
});


it("handles state editing errors", async () => {
  const mockApi = useApiMock.getMockImplementation()();
  mockApi.put.mockResolvedValueOnce({ 
    success: false, 
    message: "Update failed" 
  });
  
  await renderComponent();
  await waitFor(() => {
    expect(screen.getByText(/Karnataka/i)).toBeInTheDocument();
  }, { timeout: 2000 });

  const stateAccordionButtons = screen.getAllByRole('button');
  const stateButton = stateAccordionButtons.find(button => 
    button.textContent?.includes('Karnataka')
  );
  
  if (!stateButton) {
    throw new Error('Karnataka state button not found');
  }
  
  fireEvent.click(stateButton);

  await waitFor(() => {
    const editButton = screen.getByText("Edit");
    fireEvent.click(editButton);
  });

  const inputs = screen.getAllByPlaceholderText("Enter here");
  const nameInput = inputs[0];
  
  fireEvent.change(nameInput, { target: { value: "Test Update" } });
  
  const saveButton = screen.getByText("Save");
  fireEvent.click(saveButton);

  await waitFor(() => {
    expect(mockAddToast).toHaveBeenCalledWith(
      "Update failed",
      expect.objectContaining({ appearance: "error" })
    );
  });
});




});
