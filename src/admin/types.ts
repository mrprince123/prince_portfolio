export interface AdminUser {
  id?: string;
  _id?: string;
  username: string;
  email: string;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface OverviewCounts {
  projects: { total: number; visible: number };
  blogs: { total: number; visible: number };
  courses: { total: number };
  skills: { total: number };
  contacts: { total: number; pending: number; replied: number };
  articles: { total: number };
  testimonials: { total: number };
  youtubes: { total: number };
  users: { total: number };
}

export interface OverviewStats {
  counts: OverviewCounts;
  recentContacts: ContactMessage[];
  recentBlogs: BlogPost[];
  recentProjects: Project[];
  systemInfo: {
    dbStatus: string;
    dbName: string;
    nodeEnv: string;
    serverTime: string;
    uptimeSeconds: number;
  };
}

export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  phone?: string;
  subject: string;
  message: string;
  replyMessage?: string;
  isReplied: boolean;
  replied_at?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Project {
  _id: string;
  title: string;
  slug?: string;
  liveUrl?: string;
  githubUrl?: string;
  coverImage?: string;
  description?: string;
  technologies: string[];
  category: 'web' | 'android' | 'cloud' | 'script';
  isVisible: boolean;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogTag {
  _id?: string;
  name: string;
  icon?: string;
}

export interface BlogPost {
  _id: string;
  title: string;
  slug?: string;
  readTime?: number;
  description: string;
  coverImage?: string;
  content: string;
  tags?: BlogTag[];
  likes?: number;
  author: string;
  isVisible: boolean;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseTopic {
  _id?: string;
  title: string;
  description?: string;
  content?: string;
}

export interface Course {
  _id: string;
  title: string;
  slug?: string;
  description?: string;
  coverImage?: string;
  content: CourseTopic[];
  tags: string[];
  isVisible: boolean;
  featured: boolean;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  createdAt?: string;
  updatedAt?: string;
}

export interface SkillItem {
  _id?: string;
  name: string;
  icon?: string;
}

export interface SkillCategory {
  _id: string;
  name: string;
  description?: string;
  skillsList: SkillItem[];
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ArticleMedium {
  _id: string;
  title: string;
  description: string;
  articleLink: string;
  coverImage?: string;
  publishedAt?: string;
  tags: string[];
  readTime?: string;
  isVisible: boolean;
  featured: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  _id: string;
  name: string;
  profilePic: string;
  designation: string;
  message: string;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface YoutubeVideo {
  _id: string;
  name: string;
  description: string;
  thumbnail: string;
  link: string;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ===================== PUBLISHING STUDIO TYPES =====================

export interface Idea {
  _id: string;
  title: string;
  summary?: string;
  angles?: string[];
  keyPoints?: string[];
  targetAudience?: string;
  source: "telegram_text" | "telegram_voice" | "dashboard" | "manual";
  status: "raw" | "brainstormed" | "drafted" | "published" | "archived";
  tags: string[];
  postId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PostPlatformLinkedIn {
  content?: string;
  hashtags?: string[];
  isApproved: boolean;
  approvedAt?: string;
  publishedUrl?: string;
  publishedUrn?: string;
}

export interface PostPlatformMedium {
  title?: string;
  subtitle?: string;
  markdownContent?: string;
  htmlContent?: string;
  canonicalUrl?: string;
  tags?: string[];
  isApproved: boolean;
  approvedAt?: string;
  publishedUrl?: string;
}

export interface PostPlatformWebsite {
  title?: string;
  slug?: string;
  summary?: string;
  content?: string;
  category?: string;
  isApproved: boolean;
  approvedAt?: string;
  blogPostId?: string;
  publishedUrl?: string;
}

export interface Post {
  _id: string;
  ideaId?: string | { _id: string; title: string };
  title: string;
  topic?: string;
  tags: string[];
  linkedin: PostPlatformLinkedIn;
  medium: PostPlatformMedium;
  website: PostPlatformWebsite;
  overallStatus:
    | "draft"
    | "partially_approved"
    | "approved"
    | "scheduled"
    | "partially_published"
    | "published"
    | "archived";
  createdAt: string;
  updatedAt?: string;
}

export interface PublishingJob {
  _id: string;
  postId: Post | string;
  platform: "linkedin" | "medium" | "website";
  scheduledAt: string;
  status: "scheduled" | "processing" | "published" | "failed" | "cancelled";
  lockedAt?: string;
  attempts: number;
  maxAttempts: number;
  nextRetryAt?: string;
  lastError?: string;
  publishedAt?: string;
  publishedId?: string;
  publishedUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PublishingLog {
  _id: string;
  jobId?: string;
  postId?: { _id: string; title: string } | string;
  platform: string;
  action: string;
  status: "info" | "success" | "warning" | "error";
  message: string;
  details?: Record<string, unknown>;
  latencyMs?: number;
  createdAt: string;
}

export interface ContentTemplate {
  _id?: string;
  name: string;
  authorPersona: string;
  tone: string;
  targetAudience: string;
  bannedPhrases: string[];
  platformInstructions: {
    linkedin: string;
    medium: string;
    website: string;
  };
  isDefault: boolean;
}

export interface PlatformStatus {
  linkedin: {
    isConnected: boolean;
    accountName?: string;
    accountId?: string;
    expiresAt?: string;
    lastConnectedAt?: string;
    hasClientCredentials: boolean;
  };
  medium: {
    isConnected: boolean;
    type: string;
    canonicalDomain: string;
    instructions: string;
  };
  website: {
    isConnected: boolean;
    siteUrl: string;
  };
  telegram: {
    isConfigured: boolean;
    authorizedUserId?: string;
    webhook?: {
      url?: string;
      has_custom_certificate?: boolean;
      pending_update_count?: number;
      last_error_date?: number;
      last_error_message?: string;
    };
  };
  ai: {
    isConfigured: boolean;
    model: string;
    tier: string;
  };
}

export interface PublishingOverviewStats {
  counts: {
    ideas: number;
    posts: number;
    drafts: number;
    approved: number;
    scheduled: number;
    published: number;
    failed: number;
  };
  recentJobs: PublishingJob[];
  recentIdeas: Idea[];
}

