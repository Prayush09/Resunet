"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";

interface TemplateSelectorProps {
  userId: string;
}

const templates = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean and professional design with a modern touch",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional resume format that works for any industry",
    image: "/placeholder.svg?height=200&width=300",
  },
  {
    id: "creative",
    name: "Creative",
    description: "Stand out with a unique and creative design",
    image: "/placeholder.svg?height=200&width=300",
  },
];

export function TemplateSelector({ userId }: TemplateSelectorProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateResume = async () => {
    if (!selectedTemplate) {
      toast({
        title: "No template selected",
        description: "Please select a template to continue",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/resumes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "Untitled Resume",
          template: selectedTemplate,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create resume");
      }

      const data = await response.json();
      router.push(`/resume/${data.id}/edit`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create resume",
        variant: "destructive",
      });
      setIsCreating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="mb-6 text-2xl font-bold text-center">Select a Template</h2>
      <div className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all ${
                selectedTemplate === template.id ? "ring-2 ring-primary" : "hover:border-primary/50"
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={template.image || "/placeholder.svg"}
                    alt={template.name}
                    className="w-full h-[200px] object-cover"
                  />
                  {selectedTemplate === template.id && (
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex flex-col items-start p-6">
                <h3 className="text-lg font-medium">{template.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{template.description}</p>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleCreateResume} disabled={!selectedTemplate || isCreating}>
            {isCreating && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Create Resume
          </Button>
        </div>
      </div>
    </div>
  );
}
