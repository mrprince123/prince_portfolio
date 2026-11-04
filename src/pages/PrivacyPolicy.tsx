import { Seo } from "@/components/seo";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Server, RefreshCw, Mail, ExternalLink, CheckCircle2 } from "lucide-react";
import { personalInfo } from "@/data/portfolioData";
import { Reveal } from "@/components/ui/primitives/Reveal";
import { Button } from "@/components/ui/primitives/Button";

const lastUpdated = "March 2026";

const sections = [
  {
    icon: Eye,
    title: "1. Information We Collect",
    content: [
      "We believe in strict data minimization. We only collect the minimal personal information necessary to deliver this website and communicate with you:",
      "• Contact Inquiries: When you submit our contact form, we collect your name, email address, subject, and message content to respond to your inquiry.",
      "• Technical Telemetry & Server Logs: Standard internet log information (such as your browser user-agent, request timestamp, and anonymized IP address) is temporarily processed by our hosting infrastructure (Vercel) to protect against DDoS attacks, automated scraping, and malicious requests.",
      "• Cookies & Client Storage: We do not use third-party advertising or cross-site tracking cookies. We utilize browser LocalStorage exclusively to preserve your theme preference (dark/light mode) and store administrative authentication tokens if you are an authorized system operator.",
    ],
  },
  {
    icon: RefreshCw,
    title: "2. Third-Party Services & Integrations",
    content: [
      "To provide modern publishing, media delivery, and AI automation capabilities, our platform integrates with select industry-standard service providers:",
      "• LinkedIn API: When authorized, our platform connects via LinkedIn's official OAuth 2.0 flow (`w_member_social`, `openid`, `profile`) to allow automated publication of approved engineering articles to the author's personal LinkedIn feed. We never read, scrape, or store your private contacts or unrelated LinkedIn activity.",
      "• Google Gemini API: We utilize Google AI Studio to assist with technical ghostwriting, voice note transcription, and content drafting. No personal contact form data or private visitor identifiers are transmitted to Google AI models.",
      "• Cloudinary: Used exclusively as a secure Content Delivery Network (CDN) for serving optimized portfolio project screenshots, media assets, and thumbnails.",
      "• Vercel & MongoDB Atlas: Our serverless backend is hosted on Vercel, and our encrypted database is hosted on MongoDB Atlas. Both providers comply with rigorous enterprise security standards (SOC 2, ISO 27001).",
    ],
  },
  {
    icon: Lock,
    title: "3. How We Protect Your Data",
    content: [
      "Security is engineered directly into our application architecture:",
      "• Encryption in Transit: All data exchanged between your web browser, our APIs, and external platforms is strictly encrypted using Transport Layer Security (TLS 1.3 / HTTPS).",
      "• Encryption at Rest: Sensitive tokens (such as third-party OAuth tokens) are encrypted at rest using AES-256-CBC cryptographic ciphers before database storage.",
      "• Rate Limiting & Account Protection: Automated endpoints and authentication barriers are shielded with strict IP rate limiters and brute-force account lockout mechanisms.",
      "• Never Sold or Monetized: We never sell, rent, monetize, or trade your personal data or contact details to third-party data brokers or marketing networks.",
    ],
  },
  {
    icon: Server,
    title: "4. Data Retention & Your Rights",
    content: [
      "• Retention: Messages submitted through the contact form are retained only as long as necessary to fulfill professional communication and project collaborations, after which they are securely archived or purged.",
      "• Access & Deletion: You have the right to request a copy of any personal communication data we hold about you or request its immediate permanent deletion.",
      "• Revoking Platform Access: If you have connected a third-party account (e.g. LinkedIn), you can disconnect or revoke access at any time via your LinkedIn App Permissions settings or via our administrative dashboard.",
    ],
  },
];

export const PrivacyPolicy = () => {
  return (
    <>
      <Seo
        title="Privacy Policy | Prince Kumar Sahni"
        description="Privacy policy and data protection practices for Prince Kumar Sahni's portfolio website and personal AI publishing platform."
        url="https://princesahni.com/privacy"
        image="https://princesahni.com/og-images/princesahni-logo.png"
      />

      <section className="container mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <Reveal>
          <div className="border-b border-border pb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-mono text-primary">
              <Shield className="h-3.5 w-3.5" />
              <span>Data Protection & Privacy</span>
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-5xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-muted-foreground font-mono">
              Last updated: <span className="text-foreground">{lastUpdated}</span> · Applies to{" "}
              <span className="text-foreground">princesahni.com</span>
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Your privacy is fundamentally important to me. This policy clearly outlines what information
              is gathered when visiting my portfolio website, how contact details and integrations are handled,
              and the security safeguards implemented across the platform.
            </p>
          </div>
        </Reveal>

        {/* Core Principles Strip */}
        <Reveal delay={0.1}>
          <div className="my-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <p className="mt-2 text-xs font-semibold text-foreground">Zero Tracking Ads</p>
              <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
                No tracking pixels, third-party advertising cookies, or behavioral profiling.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <Lock className="h-5 w-5 text-primary" />
              <p className="mt-2 text-xs font-semibold text-foreground">AES-256 Encrypted</p>
              <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
                All external OAuth tokens and sensitive credentials are encrypted at rest.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <Shield className="h-5 w-5 text-cyan-500" />
              <p className="mt-2 text-xs font-semibold text-foreground">Strictly Confidential</p>
              <p className="mt-1 text-[11px] text-muted-foreground leading-normal">
                Contact submissions are used solely for direct communication and never shared.
              </p>
            </div>
          </div>
        </Reveal>

        {/* Detailed Sections */}
        <div className="space-y-8 mt-10">
          {sections.map(({ icon: Icon, title, content }, index) => (
            <Reveal key={title} delay={0.15 + index * 0.05}>
              <div className="rounded-2xl border border-border bg-card/60 p-6 md:p-8 backdrop-blur-sm">
                <div className="flex items-center gap-3 border-b border-border/60 pb-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <h2 className="font-display text-lg font-semibold text-foreground md:text-xl">
                    {title}
                  </h2>
                </div>
                <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {content.map((paragraph, pIdx) => (
                    <p key={pIdx} className={paragraph.startsWith("•") ? "pl-2 font-mono text-xs md:text-sm text-foreground/90" : ""}>
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Contact & Inquiries Footer Box */}
        <Reveal delay={0.4}>
          <div className="mt-12 rounded-2xl border border-border bg-secondary/30 p-6 md:p-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-base font-semibold text-foreground">
                Questions or Data Requests?
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-md">
                If you have questions regarding this Privacy Policy or wish to request data removal, reach out directly.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2.5">
              <Button asChild variant="primary" size="sm">
                <Link to="/contact" className="gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  <span>Contact Form</span>
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href={`mailto:${personalInfo.email}`} className="gap-1.5">
                  <span>Direct Email</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
};

export default PrivacyPolicy;

