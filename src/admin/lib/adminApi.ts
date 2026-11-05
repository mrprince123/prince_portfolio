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
  Idea,
  Post,
  PublishingJob,
  PublishingLog,
  ContentTemplate,
  PlatformStatus,
  PublishingOverviewStats,
} from "../types";

export const API_BASE_URL_KEY = "admin_api_base_url";
export const ADMIN_TOKEN_KEY = "admin_token";
export const ADMIN_USER_KEY = "admin_user";

function normalizeApiUrl(url: string): string {
  let clean = url.trim().replace(/\/+$/, "");
  clean = clean.replace(/\/auth\/login$/i, "");
  if (clean.endsWith("/api/v1") || clean.endsWith("/v1")) {
    return clean;
  }
  return `${clean}/api/v1`;
}

export function getApiBaseUrl(): string {
  const custom = localStorage.getItem(API_BASE_URL_KEY);
  if (custom && custom.trim()) {
    return normalizeApiUrl(custom);
  }
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (envUrl) {
    return normalizeApiUrl(envUrl);
  }
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

  // ===================== AI CONTENT STUDIO =====================
  ai: {
    brainstorm: async (data: { topic?: string; messages?: Array<{ role: string; content: string }> }) => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: { reply: string; topic: string } }>(
        "/ai/brainstorm",
        data
      );
      return res.data.data;
    },
    generate: async (data: { title: string; details?: string; context?: Array<{ role: string; content: string }> }) => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: Partial<Post> }>("/ai/generate", data);
      return res.data.data;
    },
    refine: async (data: { content: string; instruction: string; platform?: string }) => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: { refinedContent: string } }>(
        "/ai/refine",
        data
      );
      return res.data.data;
    },
    getTemplate: async (): Promise<ContentTemplate> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: ContentTemplate }>("/ai/templates");
      return res.data.data;
    },
    updateTemplate: async (data: Partial<ContentTemplate>): Promise<ContentTemplate> => {
      const client = createClient();
      const res = await client.put<{ success: boolean; data: ContentTemplate }>("/ai/templates", data);
      return res.data.data;
    },
  },

  // ===================== PUBLISHING & IDEAS =====================
  publishing: {
    getOverview: async (): Promise<PublishingOverviewStats> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: PublishingOverviewStats }>(
        "/publishing/overview"
      );
      return res.data.data;
    },

    // Ideas
    getIdeas: async (status?: string, search?: string): Promise<Idea[]> => {
      const client = createClient();
      const params = new URLSearchParams();
      if (status && status !== "all") params.append("status", status);
      if (search) params.append("search", search);
      const res = await client.get<{ success: boolean; data: Idea[] }>(
        `/publishing/ideas?${params.toString()}`
      );
      return res.data.data || [];
    },
    createIdea: async (data: Partial<Idea>): Promise<Idea> => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: Idea }>("/publishing/ideas", data);
      return res.data.data;
    },
    updateIdea: async (id: string, data: Partial<Idea>): Promise<Idea> => {
      const client = createClient();
      const res = await client.put<{ success: boolean; data: Idea }>(`/publishing/ideas/${id}`, data);
      return res.data.data;
    },
    deleteIdea: async (id: string) => {
      const client = createClient();
      const res = await client.delete(`/publishing/ideas/${id}`);
      return res.data;
    },

    // Posts
    getPosts: async (status?: string): Promise<Post[]> => {
      const client = createClient();
      const query = status && status !== "all" ? `?status=${status}` : "";
      const res = await client.get<{ success: boolean; data: Post[] }>(`/publishing/posts${query}`);
      return res.data.data || [];
    },
    getPostById: async (id: string): Promise<Post> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: Post }>(`/publishing/posts/${id}`);
      return res.data.data;
    },
    createPost: async (data: Partial<Post>): Promise<Post> => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: Post }>("/publishing/posts", data);
      return res.data.data;
    },
    updatePost: async (id: string, data: Partial<Post>): Promise<Post> => {
      const client = createClient();
      const res = await client.put<{ success: boolean; data: Post }>(`/publishing/posts/${id}`, data);
      return res.data.data;
    },
    deletePost: async (id: string) => {
      const client = createClient();
      const res = await client.delete(`/publishing/posts/${id}`);
      return res.data;
    },

    // Approvals & Scheduling
    approveVariant: async (id: string, platform: string, approved = true): Promise<Post> => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: Post }>(
        `/publishing/posts/${id}/approve`,
        { platform, approved }
      );
      return res.data.data;
    },
    schedulePost: async (id: string, platforms: string[], scheduledAt: string) => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: unknown }>(
        `/publishing/posts/${id}/schedule`,
        { platforms, scheduledAt }
      );
      return res.data;
    },
    publishNow: async (id: string, platforms?: string[]) => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: unknown }>(
        `/publishing/posts/${id}/publish-now`,
        { platforms }
      );
      return res.data;
    },

    // Jobs
    getJobs: async (status?: string): Promise<PublishingJob[]> => {
      const client = createClient();
      const query = status && status !== "all" ? `?status=${status}` : "";
      const res = await client.get<{ success: boolean; data: PublishingJob[] }>(
        `/publishing/jobs${query}`
      );
      return res.data.data || [];
    },
    rescheduleJob: async (id: string, scheduledAt: string): Promise<PublishingJob> => {
      const client = createClient();
      const res = await client.put<{ success: boolean; data: PublishingJob }>(
        `/publishing/jobs/${id}/reschedule`,
        { scheduledAt }
      );
      return res.data.data;
    },
    cancelJob: async (id: string) => {
      const client = createClient();
      const res = await client.delete(`/publishing/jobs/${id}`);
      return res.data;
    },
    retryJob: async (id: string) => {
      const client = createClient();
      const res = await client.post<{ success: boolean; message: string }>(
        `/publishing/jobs/${id}/retry`
      );
      return res.data;
    },

    // Logs
    getLogs: async (platform?: string, limit = 50): Promise<PublishingLog[]> => {
      const client = createClient();
      const query = platform && platform !== "all" ? `?platform=${platform}&limit=${limit}` : `?limit=${limit}`;
      const res = await client.get<{ success: boolean; data: PublishingLog[] }>(
        `/publishing/logs${query}`
      );
      return res.data.data || [];
    },
  },

  // ===================== PLATFORM CONNECTIONS =====================
  platforms: {
    getStatus: async (): Promise<PlatformStatus> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: PlatformStatus }>("/platforms/status");
      return res.data.data;
    },
    getLinkedInAuthUrl: async (): Promise<string> => {
      const client = createClient();
      const res = await client.get<{ success: boolean; data: { url: string } }>(
        "/platforms/linkedin/auth-url"
      );
      return res.data.data.url;
    },
    disconnectLinkedIn: async () => {
      const client = createClient();
      const res = await client.post<{ success: boolean; message: string }>(
        "/platforms/linkedin/disconnect"
      );
      return res.data;
    },
    exportMedium: async (postId: string) => {
      const client = createClient();
      const res = await client.get<{
        success: boolean;
        data: {
          title: string;
          subtitle: string;
          markdownContent: string;
          htmlContent: string;
          canonicalUrl: string;
          importUrl: string;
          tags: string[];
        };
      }>(`/platforms/medium/export/${postId}`);
      return res.data.data;
    },
    markMediumPublished: async (postId: string, publishedUrl: string) => {
      const client = createClient();
      const res = await client.post<{ success: boolean; data: Post }>(
        "/platforms/medium/mark-published",
        { postId, publishedUrl }
      );
      return res.data.data;
    },
  },

  // ===================== AUTOMATION & TELEGRAM =====================
  automation: {
    triggerCron: async () => {
      const client = createClient();
      const res = await client.post<{
        success: boolean;
        message: string;
        processedCount: number;
        data: unknown[];
      }>("/automation/trigger");
      return res.data;
    },
  },
  telegram: {
    getStatus: async () => {
      const client = createClient();
      const res = await client.get<{
        success: boolean;
        data: { isConfigured: boolean; authorizedUserId?: string; webhook?: unknown };
      }>("/telegram/status");
      return res.data.data;
    },
    setWebhook: async (url: string) => {
      const client = createClient();
      const res = await client.post<{ success: boolean; message: string }>("/telegram/set-webhook", {
        url,
      });
      return res.data;
    },
  },
};

