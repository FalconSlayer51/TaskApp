export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type UserRole = "user";

export type PublicUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
};

export type MembershipRole = "owner" | "member";

export type PublicMember = {
  id: string;
  name: string;
  email: string;
  role: MembershipRole;
};

export type PublicWorkspace = {
  id: string;
  name: string;
  ownerId: string;
  role: MembershipRole;
  createdAt: string;
  updatedAt: string;
};

export type PublicTask = {
  id: string;
  workspaceId: string;
  createdBy: string;
  assigneeId: string | null;
  userId: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ApiErrorBody = {
  message: string;
  errors?: { path: string; message: string }[];
};

export type AnalyticsResponse = {
  total: number;
  completed: number;
  pending: number;
  inProgress: number;
  completionPercentage: number;
  byStatus: { status: TaskStatus; count: number }[];
  byPriority: { priority: TaskPriority; count: number }[];
  overdue: number;
  dueThisWeek: number;
};
