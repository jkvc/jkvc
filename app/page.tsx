import Hero from "./components/Hero";
import ProjectCard from "./components/ProjectCard";
import Footer from "./components/Footer";

const projects = [
  {
    title: "Interactive Denoising Visualizer",
    description:
      "Step through the reverse diffusion process in real time. Drag a slider to control the noise schedule and watch images emerge from pure noise.",
    tags: ["DDPM", "WebGL", "Interactive"],
    status: "Demo",
  },
  {
    title: "Guided Inpainting Canvas",
    description:
      "Paint masks directly on images and guide the diffusion model to fill regions with text prompts. Real-time inference with streaming previews.",
    tags: ["Inpainting", "Canvas", "Streaming"],
    status: "In Progress",
  },
  {
    title: "Latent Space Explorer",
    description:
      "Navigate the latent space of a trained diffusion model. Interpolate between points, discover clusters, and understand what the model has learned.",
    tags: ["Latent Space", "3D", "Exploration"],
    status: "Planned",
  },
  {
    title: "Controlnet Pose Playground",
    description:
      "Manipulate a 3D skeleton and see the diffusion model generate matching images in real time. Experiment with different control signals.",
    tags: ["ControlNet", "Pose", "Real-time"],
    status: "Planned",
  },
  {
    title: "Sampling Algorithm Comparison",
    description:
      "Side-by-side comparison of DDPM, DDIM, DPM-Solver, and other sampling algorithms. Visualize how different schedulers affect generation quality and speed.",
    tags: ["Sampling", "Comparison", "Education"],
    status: "Planned",
  },
  {
    title: "Attention Map Visualizer",
    description:
      "See where the model is looking at each denoising step. Overlay cross-attention maps on generated images to understand prompt-to-pixel relationships.",
    tags: ["Attention", "Visualization", "Interpretability"],
    status: "Planned",
  },
];

export default function Home() {
  return (
    <main>
      <Hero />

      <section id="projects" className="py-16 px-4 lg:px-8 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </section>

      <section id="about" className="py-16 px-4 lg:px-8 bg-base-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-6">About</h2>
          <div className="prose prose-lg max-w-none">
            <p>
              I work on diffusion model inference algorithms and build
              interactive experiences that make generative AI more
              understandable and controllable. My focus is on bridging the gap
              between raw model capabilities and intuitive user interaction.
            </p>
            <p>
              This site serves as a showcase for experiments, demos, and tools
              that explore new ways to interact with diffusion models &mdash;
              from real-time visualization of the denoising process to novel
              control interfaces.
            </p>
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 px-4 lg:px-8 max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">Contact</h2>
        <p className="text-base-content/70 mb-4">
          Interested in collaborating or have questions about the work?
        </p>
        <a href="mailto:placeholder@example.com" className="btn btn-primary">
          Get in Touch
        </a>
      </section>

      <Footer />
    </main>
  );
}
