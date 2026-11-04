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

