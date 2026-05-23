import { create } from "zustand";

type DashboardUiState = {
  isWorkflowGeneratorOpen: boolean;
  isNotificationsOpen: boolean;
  openWorkflowGenerator: () => void;
  closeWorkflowGenerator: () => void;
  openNotifications: () => void;
  closeNotifications: () => void;
};

export const useDashboardUiStore = create<DashboardUiState>((set) => ({
  isWorkflowGeneratorOpen: false,
  isNotificationsOpen: false,
  openWorkflowGenerator: () => set({ isWorkflowGeneratorOpen: true }),
  closeWorkflowGenerator: () => set({ isWorkflowGeneratorOpen: false }),
  openNotifications: () => set({ isNotificationsOpen: true }),
  closeNotifications: () => set({ isNotificationsOpen: false })
}));
