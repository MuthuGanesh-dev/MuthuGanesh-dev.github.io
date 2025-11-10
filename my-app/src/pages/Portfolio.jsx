import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/mod-toggle";
import {
  GithubIcon,
  LinkedinIcon,
  MailIcon,
  CodeIcon,
  RocketIcon,
  BrainIcon,
  TargetIcon,
  ExternalLinkIcon,
  PlusIcon,
  XIcon,
  Trash2Icon,
} from "lucide-react";

export default function Portfolio() {
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    tech: "",
    videoUrl: "",
    pdfUrl: "",
    link: "#",
  });

  const [projects, setProjects] = useState([]);

  // Load projects from projects.json on component mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const response = await fetch("/projects.json");
        if (response.ok) {
          const data = await response.json();
          setProjects(data.projects || []);
        }
      } catch (error) {
        console.log("Error loading projects:", error);
      }
    };

    loadProjects();
  }, []);

  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();

    // Convert comma-separated tech string to array
    const techArray = newProject.tech
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t);

    const projectToAdd = {
      ...newProject,
      tech: techArray,
    };

    const updatedProjects = [...projects, projectToAdd];
    setProjects(updatedProjects);

    // Save to backend
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projects: updatedProjects }),
      });
    } catch (error) {
      console.log("Error saving project:", error);
    }

    // Reset form
    setNewProject({
      title: "",
      description: "",
      tech: "",
      videoUrl: "",
      pdfUrl: "",
      link: "#",
    });

    setShowAddProject(false);
  };

  const handleDeleteProject = async (indexToDelete) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    const updatedProjects = projects.filter(
      (_, index) => index !== indexToDelete
    );
    setProjects(updatedProjects);

    // Save to backend
    try {
      await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ projects: updatedProjects }),
      });
    } catch (error) {
      console.log("Error deleting project:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Dynamically generate skills from projects
  const generateSkills = () => {
    // Base core skills that always show
    const coreSkills = {
      "Circuit Design & Electronics": 90,
      "Arduino & Microcontrollers": 85,
      "Embedded C/C++": 80,
      "IoT & Sensor Integration": 85,
      "PCB Design & Prototyping": 75,
      "Python for Hardware": 80,
    };

    // Extract unique technologies from all projects
    const projectTechs = {};
    projects.forEach((project) => {
      if (project.tech && Array.isArray(project.tech)) {
        project.tech.forEach((tech) => {
          if (!coreSkills[tech]) {
            // If it's a new tech not in core skills, add it with a level
            projectTechs[tech] = projectTechs[tech]
              ? projectTechs[tech] + 10 // Increase level if tech appears multiple times
              : 70; // Default level for new tech
          }
        });
      }
    });

    // Merge core skills with project-derived skills
    const allSkills = { ...coreSkills, ...projectTechs };

    // Convert to array format and cap levels at 95
    return Object.entries(allSkills).map(([name, level]) => ({
      name,
      level: Math.min(level, 95),
    }));
  };

  const skills = generateSkills();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header / Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <CodeIcon className="h-6 w-6" />
            <span className="text-xl font-bold">Muthuganesh</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#about"
              onClick={(e) => handleSmoothScroll(e, "about")}
              className="text-sm hover:text-primary transition-colors cursor-pointer"
            >
              About
            </a>
            <a
              href="#projects"
              onClick={(e) => handleSmoothScroll(e, "projects")}
              className="text-sm hover:text-primary transition-colors cursor-pointer"
            >
              Projects
            </a>
            <a
              href="#skills"
              onClick={(e) => handleSmoothScroll(e, "skills")}
              className="text-sm hover:text-primary transition-colors cursor-pointer"
            >
              Skills
            </a>
            <a
              href="#contact"
              onClick={(e) => handleSmoothScroll(e, "contact")}
              className="text-sm hover:text-primary transition-colors cursor-pointer"
            >
              Contact
            </a>
          </nav>
          <ModeToggle />
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Profile Image */}
          <div className="relative w-48 h-48 md:w-56 md:h-56 rounded-2xl overflow-hidden border-4 border-primary/20 shadow-xl p-2 bg-card">
            <img
              src="/images/WhatsApp Image 2025-10-18 at 21.02.05_7f339975.jpg"
              alt="Muthuganesh Profile"
              className="w-full h-half object-cover rounded-xl mb-2"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
            <RocketIcon className="h-4 w-4" />
            <span>Electronics & Embedded Systems Engineer</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Hi, I'm <span className="text-primary">Muthuganesh</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
            I design and develop innovative electronics projects, embedded
            systems, and IoT solutions. Passionate about bringing hardware to
            life through creative engineering and problem-solving.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" className="gap-2" asChild>
              <a href="mailto:smuthuganesh01@gmail.com">
                <MailIcon className="h-4 w-4" />
                Get in touch
              </a>
            </Button>
            <Button variant="outline" size="lg" className="gap-2" asChild>
              <a
                href="https://github.com/muthu3012"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon className="h-4 w-4" />
                View GitHub
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <BrainIcon className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">About Me</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                I'm an electronics enthusiast and embedded systems engineer with
                a passion for creating innovative hardware solutions. I
                specialize in circuit design, microcontroller programming, and
                IoT development, transforming ideas into functional prototypes
                and real-world applications.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                From 7-segment displays to complex sensor integrations, I enjoy
                working on projects that bridge the gap between hardware and
                software, bringing concepts to life through hands-on engineering
                and experimentation.
              </p>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <TargetIcon className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Hardware Innovation</h3>
                  <p className="text-sm text-muted-foreground">
                    Designing custom circuits and PCBs for unique solutions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TargetIcon className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Embedded Programming</h3>
                  <p className="text-sm text-muted-foreground">
                    Writing efficient firmware for microcontrollers and embedded
                    systems.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TargetIcon className="h-5 w-5 text-primary mt-1 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Problem Solver</h3>
                  <p className="text-sm text-muted-foreground">
                    Tackling technical challenges with creative engineering
                    approaches.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <CodeIcon className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Featured Projects</h2>
            </div>
            <Button onClick={() => setShowAddProject(true)} className="gap-2">
              <PlusIcon className="h-4 w-4" />
              Add Project
            </Button>
          </div>

          {/* Add Project Form Modal */}
          {showAddProject && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">Add New Project</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddProject(false)}
                  >
                    <XIcon className="h-5 w-5" />
                  </Button>
                </div>

                <form onSubmit={handleAddProject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Project Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={newProject.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="e.g., Smart Home System"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Description *
                    </label>
                    <textarea
                      name="description"
                      value={newProject.description}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="Describe your project..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Technologies (comma-separated) *
                    </label>
                    <input
                      type="text"
                      name="tech"
                      value={newProject.tech}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="e.g., Arduino, C++, Sensors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Video URL
                    </label>
                    <input
                      type="text"
                      name="videoUrl"
                      value={newProject.videoUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="/videos/your-video.mp4"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload video to public/videos folder first
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      PDF URL
                    </label>
                    <input
                      type="text"
                      name="pdfUrl"
                      value={newProject.pdfUrl}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border rounded-md bg-background"
                      placeholder="/docs/your-document.pdf"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Upload PDF to public/docs folder first
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1">
                      Add Project
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setShowAddProject(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8">
            {projects.map((project, idx) => (
              <div
                key={idx}
                className="border rounded-lg overflow-hidden bg-card hover:shadow-xl transition-all relative"
              >
                {/* Delete Button */}
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-8 w-8"
                  onClick={() => handleDeleteProject(idx)}
                  title="Delete project"
                >
                  <Trash2Icon className="h-4 w-4" />
                </Button>

                {/* Video Preview */}
                {project.videoUrl && (
                  <div className="relative aspect-video bg-muted">
                    <video
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    >
                      <source src={project.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}

                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {project.pdfUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 flex-1"
                        asChild
                      >
                        <a
                          href={project.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                          View PDF
                        </a>
                      </Button>
                    )}
                    <Button
                      variant={project.pdfUrl ? "default" : "outline"}
                      size="sm"
                      className="gap-2 flex-1"
                    >
                      <ExternalLinkIcon className="h-4 w-4" />
                      Learn More
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="border-t bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <BrainIcon className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold">Skills & Technologies</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {skills.map((skill, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {skill.level}%
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${skill.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <MailIcon className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Get In Touch</h2>
            </div>
            <p className="text-lg text-muted-foreground">
              I'm always open to discussing new projects, creative ideas, or
              opportunities to be part of your visions.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" size="icon" asChild>
                <a
                  href="https://github.com/muthu3012"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubIcon className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a
                  href="https://linkedin.com/in/muthu-ganesh-405a35320"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LinkedinIcon className="h-5 w-5" />
                </a>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <a href="mailto:smuthuganesh01@gmail.com">
                  <MailIcon className="h-5 w-5" />
                </a>
              </Button>
            </div>
            <Button size="lg" className="gap-2" asChild>
              <a href="mailto:smuthuganesh01@gmail.com">
                <MailIcon className="h-4 w-4" />
                Send me an email
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © 2025 Muthuganesh. Built with React, Vite, Tailwind CSS, and shadcn
            UI.
          </p>
        </div>
      </footer>
    </div>
  );
}
