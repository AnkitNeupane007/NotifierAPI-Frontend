// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  isEmailVerified: boolean;
  profilePictureUrl?: string;
  isDeleted?: boolean;
  updatedAt?: string;
  role?: "ADMIN" | "USER" | string;
}

// Announcement Types
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type AnnouncementType = "READ_ONLY" | "QUIZ" | "ASSIGNMENT";

export interface Attachment {
  filename: string;
  fileUrl: string;
  fileType: string;
  signedUrl: string;
}

export interface Reader {
  userId: string;
  name: string;
  email: string;
  readAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content?: string;
  priority: Priority;
  type: AnnouncementType;
  dueDate?: string;
  maxScore?: number;
  createdAt: string;
  updatedAt?: string;
  isRead?: boolean;
  readAt?: string;
  attachments?: Attachment[];
  totalReads?: number;
  readers?: Reader[];
}

// Pagination
export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T & { pagination?: Pagination };
  pagination?: Pagination;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
}

export interface CreateAnnouncementData {
  title: string;
  content: string;
  priority: Priority;
  type?: AnnouncementType;
  dueDate?: string;
  maxScore?: number;
}
