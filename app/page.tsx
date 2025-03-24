"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Share2, LayoutTemplateIcon as Template, Star } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useCallback } from "react";
import { loadSlim } from "tsparticles-slim";
import type { Container, Engine } from "tsparticles-engine";

const Particles = dynamic(() => import("react-particles"), {
  ssr: false,
  loading: () => <></>,
});

export default function Home() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  const particlesLoaded = useCallback(async (container: Container | undefined) => {
    console.log(container);
  }, []);

  return (
    <div className="flex min-h-screen flex-col relative">
      <Particles
        className="absolute inset-0 -z-10"
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={{
          background: {
            color: {
              value: "transparent",
            },
          },
          fpsLimit: 120,
          interactivity: {
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
            },
            modes: {
              repulse: {
                distance: 100,
                duration: 0.4,
              },
            },
          },
          particles: {
            color: {
              value: "#888888",
            },
            links: {
              color: "#888888",
              distance: 150,
              enable: true,
              opacity: 0.5,
              width: 1,
            },
            move: {
              direction: "none",
              enable: true,
              outModes: {
                default: "bounce",
              },
              random: false,
              speed: 2,
              straight: false,
            },
            number: {
              density: {
                enable: true,
                area: 800,
              },
              value: 80,
            },
            opacity: {
              value: 0.5,
            },
            shape: {
              type: "circle",
            },
            size: {
              value: { min: 1, max: 3 },
            },
          },
          detectRetina: true,
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-lg">
        <div className="w-full flex h-16 items-center justify-between px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 text-lg font-bold"
          >
            <FileText className="h-6 w-6" />
            <span>Resunet</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative flex flex-col items-center text-center py-20 md:py-32 overflow-hidden">
          {/* Centered container with max-width for hero content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full max-w-3xl px-4 mx-auto relative"
          >
            <div className="absolute top-10 left-10 animate-pulse">
              <Star className="h-8 w-8 text-primary/50" />
            </div>
            <div className="absolute bottom-10 right-10 animate-pulse delay-300">
              <Star className="h-8 w-8 text-primary/50" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/50">
              Create professional resumes in minutes
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Build, customize, and share your resume with our easy-to-use builder. Choose from professional templates
              and get hired faster.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mt-10"
            >
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-12 px-8 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary"
                >
                  Get started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="border-t bg-muted/50 backdrop-blur-sm py-20">
          {/* Full-width container */}
          <div className="w-full px-4">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="mb-12 text-center text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Features
            </motion.h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  icon: <Template className="h-6 w-6" />,
                  title: "Professional Templates",
                  description: "Choose from a variety of professionally designed templates to make your resume stand out.",
                },
                {
                  icon: <FileText className="h-6 w-6" />,
                  title: "Easy Customization",
                  description:
                    "Customize sections, add skills, and tailor your resume to match the job you're applying for.",
                },
                {
                  icon: <Share2 className="h-6 w-6" />,
                  title: "Shareable Links",
                  description:
                    "Generate a unique link to share your resume with recruiters that stays the same even when you update it.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="flex flex-col items-center text-center p-6 rounded-lg bg-background/50 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground">
                    {feature.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-background/80 backdrop-blur-lg">
        <div className="w-full flex flex-col items-center justify-between gap-4 md:flex-row px-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Resunet. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">created with love by <a href="https://github.com/Resunet" className="text-primary font-medium hover:underline">Prayush</a></p>
        </div>
      </footer>
    </div>
  );
}
