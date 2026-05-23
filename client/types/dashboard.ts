export type WorkflowTask = {
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  owner: string;
  eta: string;
};

export type GeneratedWorkflow = {
  title: string;
  summary: string;
  tasks: WorkflowTask[];
  checklist: string[];
  metrics: string[];
};

export type WorkflowSuggestion = {
  id: string;
  prompt: string;
  result: GeneratedWorkflow;
  createdAt: string;
};

export type DashboardProject = {
  id: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "ARCHIVED";
  updatedAt: string;
  progress: number;
  taskCount: number;
  completedCount: number;
};

export type DashboardTask = {
  id: string;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  projectName: string;
  assigneeName: string;
  dueDate: string | null;
  updatedAt: string;
};

export type DashboardActivity = {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  label: string;
  createdAt: string;
};

export type DashboardTrendPoint = {
  label: string;
  workflows: number;
  completedTasks: number;
  activities: number;
};

export type DashboardOverview = {
  stats: {
    totalProjects: number;
    completedTasks: number;
    openTasks: number;
    aiSuggestions: number;
    unreadNotifications: number;
  };
  projects: DashboardProject[];
  tasks: DashboardTask[];
  recentSuggestions: WorkflowSuggestion[];
  activity: DashboardActivity[];
  trends: DashboardTrendPoint[];
};

export type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  actionUrl: string | null;
  metadata: unknown;
  isRead: boolean;
  createdAt: string;
};

export type NotificationsResponse = {
  notifications: NotificationItem[];
  unreadCount: number;
};
