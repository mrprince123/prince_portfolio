import axios, { AxiosInstance } from "axios";
import {
  AdminUser,
  OverviewStats,
  ContactMessage,
  Project,
  BlogPost,
  Course,
  SkillCategory,
  ArticleMedium,
  Testimonial,
  YoutubeVideo,
} from "../types";

export const API_BASE_URL_KEY = "admin_api_base_url";
export const ADMIN_TOKEN_KEY = "admin_token";
export const ADMIN_USER_KEY = "admin_user";

export function getApiBaseUrl(): string {
  const custom = localStorage.getItem(API_BASE_URL_KEY);
  if (custom) return custom;
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  return "http://localhost:5001/api/v1";
}

export function setApiBaseUrl(url: string) {
  localStorage.setItem(API_BASE_URL_KEY, url);
}

export function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}

export function setAdminAuth(token: string, user: AdminUser) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
  localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
}

export function clearAdminAuth() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_KEY);
}

export function getStoredUser(): AdminUser | null {
  const raw = localStorage.getItem(ADMIN_USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function createClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: 15000,
  });

  instance.interceptors.request.use((config) => {
    const token = getAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "An unexpected API error occurred";
      return Promise.reject(new Error(msg));
    }
  );

  return instance;
}

export const adminApi = {
  // Auth
  auth: {
    login: async (credentials: { email: string; password: string }) => {
      const client = createClient();
      const res = await client.post<{
        success: boolean;
        token: string;
        data: AdminUser;
        message: string;
      }>("/auth/login", credentials);
      return res.data;
    },
    getMe: async () => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: AdminUser }>("/auth/me");
      return res.data.data;
    },
    logout: async () => {
      const client = createClient();
      try {
        await client.get("/auth/logout");
      } finally {
        clearAdminAuth();
      }
    },
    changePassword: async (passwords: { currentPassword: string; newPassword: string }) => {
      const client = createClient();
      const res = await client.put<{ success: boolean; message: string }>(
        "/auth/change-password",
        passwords
      );
      return res.data;
    },
    updateProfile: async (profile: { username?: string; email?: string }) => {
      const client = createClient();
      const res = await client.put<{
        success: boolean;
        message: string;
        data: AdminUser;
      }>("/auth/profile", profile);
      // Update stored user if success
      if (res.data?.data) {
        const current = getStoredUser();
        const updated = { ...current, ...res.data.data };
        localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(updated));
      }
      return res.data;
    },
  },

  // Overview Stats
  overview: {
    getStats: async (): Promise<OverviewStats> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: OverviewStats }>("/overview");
      return res.data.data;
    },
  },

  // Contacts
  contacts: {
    getAll: async (): Promise<ContactMessage[]> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: ContactMessage[] }>("/contact/get");
      return res.data.data || [];
    },
    reply: async (id: string, replyMessage: string) => {
      const client = createClient();
      const res = await client.post<{ success: boolean; message: string; data: ContactMessage }>(
        `/contact/reply/${id}`,
        { replyMessage }
      );
      return res.data;
    },
    delete: async (id: string) => {
      const client = createClient();
      const res = await client.delete(`/contact/delete/${id}`);
      return res.data;
    },
    update: async (id: string, data: Partial<ContactMessage>) => {
      const client = createClient();
      const res = await client.put(`/contact/edit/${id}`, data);
      return res.data;
    },
  },

  // Projects
  projects: {
    getAll: async (all = true): Promise<Project[]> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: Project[] }>(
        `/project/get${all ? "?all=true&limit=100" : "?limit=100"}`
      );
      return res.data.data || [];
    },
    create: async (data: Partial<Project>): Promise<Project> => {
      const client = createClient();
      const res = await client.post<{ success: boolean; project: Project }>("/project/post", data);
      return res.data.project;
    },
    update: async (id: string, data: Partial<Project>): Promise<Project> => {
      const client = createClient();
      const res = await client.put<{ success: boolean; project: Project }>(
        `/project/edit/${id}`,
        data
      );
      return res.data.project;
    },
    delete: async (id: string) => {
      const client = createClient();
      const res = await client.delete(`/project/delete/${id}`);
      return res.data;
    },
  },

  // Blogs
  blogs: {
    getAll: async (all = true): Promise<BlogPost[]> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: BlogPost[] }>(
        `/blog/get${all ? "?all=true&limit=100" : "?limit=100"}`
      );
      return res.data.data || [];
    },
    create: async (data: Partial<BlogPost>): Promise<BlogPost> => {
      const client = createClient();
      const res = await client.post<{ success: boolean; blog: BlogPost }>("/blog/post", data);
      return res.data.blog;
    },
    update: async (id: string, data: Partial<BlogPost>): Promise<BlogPost> => {
      const client = createClient();
      const res = await client.put<{ success: boolean; blog: BlogPost }>(`/blog/edit/${id}`, data);
      return res.data.blog;
    },
    delete: async (id: string) => {
      const client = createClient();
      const res = await client.delete(`/blog/delete/${id}`);
      return res.data;
    },
  },

  // Courses
  courses: {
    getAll: async (all = true): Promise<Course[]> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: Course[] }>(
        `/course/get${all ? "?all=true&limit=100" : "?limit=100"}`
      );
      return res.data.data || [];
    },
    create: async (data: Partial<Course>): Promise<Course> => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: Course }>("/course/post", data);
      return res.data.data;
    },
    update: async (id: string, data: Partial<Course>): Promise<Course> => {
      const client = createClient();
      const res = await client.put<{ success: boolean; data: Course }>(`/course/edit/${id}`, data);
      return res.data.data;
    },
    delete: async (id: string) => {
      const client = createClient();
      const res = await client.delete(`/course/delete/${id}`);
      return res.data;
    },
  },

  // Skills
  skills: {
    getAll: async (all = true): Promise<SkillCategory[]> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: SkillCategory[] }>(
        `/skills/get${all ? "?all=true&limit=100" : "?limit=100"}`
      );
      return res.data.data || [];
    },
    create: async (data: Partial<SkillCategory>): Promise<SkillCategory> => {
      const client = createClient();
      const res = await client.post<{ success: boolean; skill: SkillCategory }>(
        "/skills/post",
        data
      );
      return res.data.skill;
    },
    update: async (id: string, data: Partial<SkillCategory>): Promise<SkillCategory> => {
      const client = createClient();
      const res = await client.put<{ success: boolean; skill: SkillCategory }>(
        `/skills/edit/${id}`,
        data
      );
      return res.data.skill;
    },
    delete: async (id: string) => {
      const client = createClient();
      const res = await client.delete(`/skills/delete/${id}`);
      return res.data;
    },
  },

  // Articles
  articles: {
    getAll: async (all = true): Promise<ArticleMedium[]> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: ArticleMedium[] }>(
        `/article/get${all ? "?all=true&limit=100" : "?limit=100"}`
      );
      return res.data.data || [];
    },
    create: async (data: Partial<ArticleMedium>): Promise<ArticleMedium> => {
      const client = createClient();
      const res = await client.post<{ success: boolean; article: ArticleMedium }>(
        "/article/post",
        data
      );
      return res.data.article;
    },
    update: async (id: string, data: Partial<ArticleMedium>): Promise<ArticleMedium> => {
      const client = createClient();
      const res = await client.put<{ success: boolean; article: ArticleMedium }>(
        `/article/edit/${id}`,
        data
      );
      return res.data.article;
    },
    delete: async (id: string) => {
      const client = createClient();
      const res = await client.delete(`/article/delete/${id}`);
      return res.data;
    },
  },

  // Testimonials
  testimonials: {
    getAll: async (all = true): Promise<Testimonial[]> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: Testimonial[] }>(
        `/testimonial/get${all ? "?all=true&limit=100" : "?limit=100"}`
      );
      return res.data.data || [];
    },
    create: async (data: Partial<Testimonial>): Promise<Testimonial> => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: Testimonial }>(
        "/testimonial/post",
        data
      );
      return res.data.data;
    },
    update: async (id: string, data: Partial<Testimonial>): Promise<Testimonial> => {
      const client = createClient();
      const res = await client.put<{ success: boolean; data: Testimonial }>(
        `/testimonial/edit/${id}`,
        data
      );
      return res.data.data;
    },
    delete: async (id: string) => {
      const client = createClient();
      const res = await client.delete(`/testimonial/delete/${id}`);
      return res.data;
    },
  },

  // YouTube Videos
  youtube: {
    getAll: async (all = true): Promise<YoutubeVideo[]> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: YoutubeVideo[] }>(
        `/youtube/get${all ? "?all=true&limit=100" : "?limit=100"}`
      );
      return res.data.data || [];
    },
    create: async (data: Partial<YoutubeVideo>): Promise<YoutubeVideo> => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: YoutubeVideo }>(
        "/youtube/post",
        data
      );
      return res.data.data;
    },
    update: async (id: string, data: Partial<YoutubeVideo>): Promise<YoutubeVideo> => {
      const client = createClient();
      const res = await client.put<{ success: boolean; data: YoutubeVideo }>(
        `/youtube/edit/${id}`,
        data
      );
      return res.data.data;
    },
    delete: async (id: string) => {
      const client = createClient();
      const res = await client.delete(`/youtube/delete/${id}`);
      return res.data;
    },
  },
};

