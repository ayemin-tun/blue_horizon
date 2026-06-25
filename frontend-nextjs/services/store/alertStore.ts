import { create } from "zustand";

export type AlertType = "success" | "error" | "warning";

interface AlertMessage {
  id: string;
  type: AlertType;
  message: string;
}

interface AlertState {
  alerts: AlertMessage[];
  showAlert: (type: AlertType, message: string) => void;
  removeAlert: (id: string) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  alerts: [],

  showAlert: (type, message) => {
    const id = Math.random().toString(36).substring(2, 9); // Unique ID 
    
    // add new alert in list
    set((state) => ({
      alerts: [...state.alerts, { id, type, message }],
    }));

    //  (Auto-dismiss on 5 seconds)
    setTimeout(() => {
      set((state) => ({
        alerts: state.alerts.filter((alert) => alert.id !== id),
      }));
    }, 5000);
  },

  removeAlert: (id) =>
    set((state) => ({
      alerts: state.alerts.filter((alert) => alert.id !== id),
    })),
}));

export const toast = {
  success: (msg: string) => useAlertStore.getState().showAlert("success", msg),
  error: (msg: string) => useAlertStore.getState().showAlert("error", msg),
  warning: (msg: string) => useAlertStore.getState().showAlert("warning", msg),
};