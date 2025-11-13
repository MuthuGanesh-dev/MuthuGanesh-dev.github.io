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
import {
  saveProjectsToGitHub,
  loadProjectsFromGitHub,
} from "@/utils/githubStorage";

export default function Portfolio() {
  const [showAddProject, setShowAddProject] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [newProject, setNewProject] = useState({
    title: "",
    description: "",
    tech: "",
    videoUrl: "",
    pdfUrl: "",
    link: "#",
  });
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const [projects, setProjects] = useState([]);

  // Password for authentication (change this to your desired password)
  const ADMIN_PASSWORD = "ganesh3012";

  // Check authentication
  const checkPassword = () => {
    const password = prompt("Enter admin password to manage projects:");
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      return true;
    } else if (password !== null) {
      // User clicked OK but wrong password
      alert("Incorrect password! Access denied.");
    }
    return false;
  };

  // Load projects from localStorage and GitHub on component mount
  useEffect(() => {
    const loadProjects = async () => {
      // First, try localStorage for instant load
      const localProjects = localStorage.getItem("portfolioProjects");
      if (localProjects) {
        try {
          setProjects(JSON.parse(localProjects));
        } catch (e) {
          console.log("Error parsing localStorage projects:", e);
        }
      }

      // Then load from GitHub for latest data
      try {
        const githubProjects = await loadProjectsFromGitHub();
        if (githubProjects && githubProjects.length > 0) {
          setProjects(githubProjects);
          localStorage.setItem(
            "portfolioProjects",
            JSON.stringify(githubProjects)
          );
        }
      } catch (error) {
        console.log("Error loading projects from GitHub:", error);
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

    // Convert comma-separated tech string to array and uppercase
    const techArray = newProject.tech
      .split(",")
      .map((t) => t.trim().toUpperCase()) // Convert to uppercase for case-insensitive matching
      .filter((t) => t);

    const projectToAdd = {
      ...newProject,
      tech: techArray,
    };

    const updatedProjects = [...projects, projectToAdd];
    setProjects(updatedProjects);

    // Save to localStorage (instant backup)
    localStorage.setItem("portfolioProjects", JSON.stringify(updatedProjects));

    // Save to GitHub (global sync)
    const result = await saveProjectsToGitHub(updatedProjects, ADMIN_PASSWORD);
    if (result.success) {
      alert("✅ " + result.message);
    } else {
      alert("⚠️ " + result.message);
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
    // Check authentication first
    if (!isAuthenticated && !checkPassword()) {
      return;
    }

    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    const updatedProjects = projects.filter(
      (_, index) => index !== indexToDelete
    );
    setProjects(updatedProjects);

    // Save to localStorage (instant backup)
    localStorage.setItem("portfolioProjects", JSON.stringify(updatedProjects));

    // Save to GitHub (global sync)
    const result = await saveProjectsToGitHub(updatedProjects, ADMIN_PASSWORD);
    if (result.success) {
      alert("✅ " + result.message);
    } else {
      alert("⚠️ " + result.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProject((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle video file upload
  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a video file
    if (!file.type.startsWith("video/")) {
      alert("Please upload a valid video file");
      return;
    }

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);

    // Check file size (recommend < 10MB for base64)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      alert(
        `Video file is ${fileSizeMB}MB. Please upload a file smaller than 50MB or use a video hosting service like YouTube.`
      );
      return;
    }

    // Warn for large files
    if (file.size > 10 * 1024 * 1024) {
      const confirmed = window.confirm(
        `Video size is ${fileSizeMB}MB. Large videos may take time to upload and could fail.\n\nFor best results, use videos < 10MB or host on YouTube.\n\nContinue anyway?`
      );
      if (!confirmed) {
        e.target.value = ""; // Clear the input
        return;
      }
    }

    setUploadingVideo(true);

    try {
      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        setNewProject((prev) => ({
          ...prev,
          videoUrl: dataUrl,
        }));
        setUploadingVideo(false);
        alert(`✓ Video uploaded successfully (${fileSizeMB}MB)`);
      };
      reader.onerror = () => {
        alert("Error reading video file");
        setUploadingVideo(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Video upload error:", error);
      alert("Failed to upload video");
      setUploadingVideo(false);
    }
  };

  // Handle PDF file upload
  const handlePdfUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's a PDF file
    if (file.type !== "application/pdf") {
      alert("Please upload a valid PDF file");
      return;
    }

    // Check file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("PDF file is too large. Please upload a file smaller than 10MB.");
      return;
    }

    setUploadingPdf(true);

    try {
      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result;
        setNewProject((prev) => ({
          ...prev,
          pdfUrl: dataUrl,
        }));
        setUploadingPdf(false);
      };
      reader.onerror = () => {
        alert("Error reading PDF file");
        setUploadingPdf(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("PDF upload error:", error);
      alert("Failed to upload PDF");
      setUploadingPdf(false);
    }
  };

  // Dynamically generate skills from projects
  const generateSkills = () => {
    const projectTechs = {};

    // Extract technologies from all projects and count occurrences
    projects.forEach((project) => {
      if (project.tech && Array.isArray(project.tech)) {
        project.tech.forEach((tech) => {
          if (projectTechs[tech]) {
            // Existing technology: increase by 2 for each additional use
            projectTechs[tech] = projectTechs[tech] + 2;
          } else {
            // New technology: start at 50%
            projectTechs[tech] = 50;
          }
        });
      }
    });

    // Convert to array format and cap levels at 95
    return Object.entries(projectTechs).map(([name, level]) => ({
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
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Embedded Systems Engineer specializing in PCB design,
            microcontroller programming, and IoT solutions. Experienced with PIC
            MCUs, Eagle, MPLAB X IDE, and A7672C GSM modules. Skilled in
            hardware design, UART debugging, PCB repair, and Python automation,
            focused on building smart, connected embedded systems.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a
              href="mailto:smuthuganesh01@gmail.com"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
            >
              <MailIcon className="h-4 w-4" />
              Get in touch
            </a>
            <a
              href="https://github.com/MuthuGanesh-dev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground font-medium transition-colors"
            >
              <GithubIcon className="h-4 w-4" />
              View GitHub
            </a>
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
            <Button
              onClick={() => {
                if (isAuthenticated || checkPassword()) {
                  setShowAddProject(true);
                }
              }}
              className="gap-2"
            >
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
                      Video Upload
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="w-full px-3 py-2 border rounded-md bg-background file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {uploadingVideo && (
                        <p className="text-xs text-blue-500">
                          Uploading video...
                        </p>
                      )}
                      {newProject.videoUrl && !uploadingVideo && (
                        <p className="text-xs text-green-500">
                          ✓ Video uploaded successfully
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Upload a video file (max 50MB). For larger files, use
                        YouTube or another hosting service.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      PDF Upload
                    </label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handlePdfUpload}
                        className="w-full px-3 py-2 border rounded-md bg-background file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                      />
                      {uploadingPdf && (
                        <p className="text-xs text-blue-500">
                          Uploading PDF...
                        </p>
                      )}
                      {newProject.pdfUrl && !uploadingPdf && (
                        <p className="text-xs text-green-500">
                          ✓ PDF uploaded successfully
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Upload a PDF file (max 10MB)
                      </p>
                    </div>
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
                  href="https://github.com/MuthuGanesh-dev"
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
              <a
                href="mailto:smuthuganesh01@gmail.com"
                aria-label="Send email to smuthuganesh01@gmail.com"
                className="inline-flex items-center justify-center size-9 rounded-md border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <MailIcon className="h-5 w-5" />
              </a>
            </div>
            <a
              href="mailto:smuthuganesh01@gmail.com"
              aria-label="Send email to smuthuganesh01@gmail.com"
              className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 font-medium transition-colors"
            >
              <MailIcon className="h-4 w-4" />
              Send me an email
            </a>
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
