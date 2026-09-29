import { Seo } from "@/components/seo";
import HeroSection from "@/components/sections/HeroSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import ExperienceSection from "@/components/sections/ExperienceSection";
import AboutSection from "@/components/sections/AboutSection";
import CtaSection from "@/components/sections/CtaSection";

const Home = () => (
  <>
    <Seo
      title="Prince Kumar Sahni | Software Engineer"
      description="Passionate Software Engineer specializing in building scalable, secure, and high-performing web and mobile applications. Turning innovative ideas into impactful digital products."
      url="https://princesahni.com"
      image="https://princesahni.com/og-images/princesahni-logo.png"
    />

    <HeroSection />
    <ProjectsSection />
    <ExperienceSection />
    <AboutSection />
    <CtaSection />
  </>
);

export default Home;
