/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import BillsUI from "../views/BillsUI.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills";
import router from "../app/Router";
import Bills from "../containers/Bills.js";
import userEvent from "@testing-library/user-event";

jest.mock("../app/Store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    describe("When i click on the eye", () => {
      test("The modal open with image", () => {
        bills[0].fileUrl = "test.png";
        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const bill = new Bills({
          document,
          onNavigate,
          store: null,
          bills: bills,
          localStorage: window.localStorage,
        });
        const iconEye = screen.getAllByTestId("icon-eye")[0];
        const clickIconEye = jest.fn(() => bill.handleClickIconEye(iconEye));
        $.fn.modal = jest.fn();
        iconEye.addEventListener("click", clickIconEye);
        userEvent.click(iconEye);
        expect(clickIconEye).toHaveBeenCalled();
        expect($.fn.modal).toHaveBeenCalled();
      });
      test("The modal open with error", () => {
        bills[0].fileUrl = "test.gif";
        document.body.innerHTML = BillsUI({ data: bills });
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const bill = new Bills({
          document,
          onNavigate,
          store: null,
          bills: bills,
          localStorage: window.localStorage,
        });
        const iconEye = screen.getAllByTestId("icon-eye")[0];
        const clickIconEye = jest.fn(() => bill.handleClickIconEye(iconEye));
        $.fn.modal = jest.fn();
        iconEye.addEventListener("click", clickIconEye);
        userEvent.click(iconEye);
        expect(clickIconEye).toHaveBeenCalled();
        expect($.fn.modal).toHaveBeenCalled();
      });
    });
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      expect(windowIcon).toBeTruthy();
      expect(windowIcon).toHaveClass("active-icon");
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });
  });
  describe("When i click on the new bill's button", () => {
    test("Then i should navigate to bill/new", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );

      const billContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      document.body.innerHTML = BillsUI({ data: bills });
      const handleClickNewBill = jest.fn(billContainer.handleClickNewBill);

      const btnNewBill = screen.getByTestId("btn-new-bill");

      btnNewBill.addEventListener("click", handleClickNewBill);
      userEvent.click(btnNewBill);
      expect(handleClickNewBill).toHaveBeenCalled();
    });
  });
  describe("When I navigate to Dashboard", () => {
    test("fetches bills from mock API GET", async () => {
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      const contentPending = await screen.getByText("Type");
      expect(contentPending).toBeTruthy();
      const contentRefused = await screen.getAllByText("Date");
      expect(contentRefused).toBeTruthy();
    });
    describe("When an error occurs on API", () => {
      beforeEach(() => {
        jest.spyOn(mockStore, "bills");
        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        const root = document.createElement("div");
        root.setAttribute("id", "root");
        document.body.appendChild(root);
        router();
      });
      test("fetches bills from an API and fails with 404 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 404"));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 404/);
        expect(message).toBeTruthy();
      });

      test("fetches messages from an API and fails with 500 message error", async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);
        await new Promise(process.nextTick);
        const message = await screen.getByText(/Erreur 500/);
        expect(message).toBeTruthy();
      });
    });
  });
});

// $.fn.modal = jest.fn(); Tester la modal
// 'A modal should open'
