import type {
  User,
  Announcement,
  ApiResponse,
  LoginFormData,
  RegisterFormData,
  CreateAnnouncementData,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:5001";

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      ...options,
      credentials: "include",
      headers:
        options.body instanceof FormData
          ? { ...options.headers }
          : {
              "Content-Type": "application/json",
              ...options.headers,
            },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 204) {
        return { status: "success" };
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred");
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Network error");
    }
  }

  // Auth endpoints
  async login(credentials: LoginFormData) {
    return this.request<{ user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterFormData) {
    return this.request<{ user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logout() {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async refreshToken() {
    return this.request("/auth/refresh", {
      method: "POST",
    });
  }

  async verifyEmail(token: string) {
    return this.request(`/auth/verify-email?token=${token}`);
  }

  async resendVerification(email: string) {
    return this.request("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // User endpoints
  async getCurrentUser() {
    return this.request<{ user: User }>("/user/me");
  }

  async uploadProfilePicture(file: File) {
    const formData = new FormData();
    formData.append("profilePicture", file);

    return this.request<{ user: User }>("/user/me/profile-picture", {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  async getAllUsers(page = 1, limit = 10) {
    return this.request<{ users: User[] }>(`/user?page=${page}&limit=${limit}`);
  }

  async getUserById(id: string) {
    return this.request<{ user: User }>(`/user/${id}`);
  }

  async deleteUser(id: string) {
    return this.request(`/user/${id}`, {
      method: "DELETE",
    });
  }

  async getUserAnnouncements(
    id: string,
    status: "read" | "unread",
    page = 1,
    limit = 10,
  ) {
    return this.request<{ read?: Announcement[]; unread?: Announcement[] }>(
      `/user/${id}/announcements?status=${status}&page=${page}&limit=${limit}`,
    );
  }

  // Announcement endpoints
  async getUnreadAnnouncements(page = 1, limit = 10) {
    return this.request<{ unread: Announcement[] }>(
      `/announcements/unread?page=${page}&limit=${limit}`,
    );
  }

  async getAllAnnouncements(page = 1, limit = 10) {
    return this.request<{ announcements: Announcement[] }>(
      `/announcements?page=${page}&limit=${limit}`,
    );
  }

  async getAdminAnnouncements(page = 1, limit = 10) {
    return this.request<{ announcements: Announcement[] }>(
      `/announcements/admin?page=${page}&limit=${limit}`,
    );
  }

  async getAnnouncementById(id: string) {
    return this.request<{ announcement: Announcement }>(`/announcements/${id}`);
  }

  async createAnnouncement(data: CreateAnnouncementData) {
    return this.request<Announcement>("/announcements", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async deleteAnnouncement(id: string) {
    return this.request(`/announcements/${id}`, {
      method: "DELETE",
    });
  }

  async uploadAnnouncementFiles(
    id: string,
    images?: File[],
    documents?: File[],
  ) {
    const formData = new FormData();

    if (images) {
      images.forEach((file) => formData.append("images", file));
    }
    if (documents) {
      documents.forEach((file) => formData.append("documents", file));
    }

    return this.request<{ announcement: Announcement }>(
      `/announcements/upload/${id}`,
      {
        method: "POST",
        body: formData,
        headers: {},
      },
    );
  }

  async markAnnouncementAsRead(announcementId: string) {
    return this.request(`/announcements/read/${announcementId}`, {
      method: "POST",
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
