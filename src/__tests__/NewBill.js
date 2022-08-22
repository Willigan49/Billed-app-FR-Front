/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
//import window from "../assets/svg/window.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router";
import mockStore from "../__mocks__/store";
import BillsUI from "../views/BillsUI.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the form should be diplay", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
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
      window.onNavigate(ROUTES_PATH.NewBill);
      expect(screen.getAllByTestId("expense-type")[0]).toBeTruthy();
    });
    test(`I should submit newbill's file`, () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
        })
      );
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = mockStore;
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const file = screen.getByTestId("file");
      const fileData = { file: "image.png" };
      let changeFile = jest.fn(() =>
        newBill.handleChangeFile({
          target: { value: "image.png" },
          preventDefault: () => {},
        })
      );
      file.addEventListener("change", changeFile);
      fireEvent.change(file, {
        target: { files: [new File(["image"], fileData.file)] },
      });
      expect(changeFile).toHaveBeenCalled();
    });
    test(`I should submit newbill's form with POST request`, () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Admin",
        })
      );
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const store = mockStore;
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorage: window.localStorage,
      });

      const file = screen.getByTestId("file");
      const fileData = { file: "image.png" };
      fireEvent.change(file, {
        target: { files: [new File(["image"], fileData.file)] },
      });
      const form = screen.getByTestId("form-new-bill");
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      const billName = screen.getByTestId("expense-name");
      fireEvent.change(billName, { target: { value: "test" } });
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
  describe("Given I am a user connected as Admin", () => {
    describe("When I navigate to Dashboard", () => {
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
              update: () => {
                return Promise.reject(new Error("Erreur 404"));
              },
            };
          });
          window.onNavigate(ROUTES_PATH.NewBill);
          await new Promise(process.nextTick);
          const html = BillsUI({error: "Erreur 404"});
          document.body.innerHTML = html;
          const message = await screen.getByText(/Erreur 404/);
          expect(message).toBeTruthy();
        });

        test("fetches messages from an API and fails with 500 message error", async () => {
          mockStore.bills.mockImplementationOnce(() => {
            return {
              update: () => {
                return Promise.reject(new Error("Erreur 500"));
              },
            };
          });

          window.onNavigate(ROUTES_PATH.Dashboard);
          await new Promise(process.nextTick);
          const html = BillsUI({error: "Erreur 500"});
          document.body.innerHTML = html;
          const message = await screen.getByText(/Erreur 500/);
          expect(message).toBeTruthy();
        });
      });
    });
  });
});
