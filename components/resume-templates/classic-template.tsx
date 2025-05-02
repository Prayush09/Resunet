"use client"

import { useState, useRef, useEffect } from "react"
import { Download, User, ExternalLink, FileText, Mail, Linkedin, Twitter, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"
import  stripHtml  from "@/lib/html-utils"

interface Skill {
  id: string
  name: string
  proficiency: number
}

interface Patent {
  id: string
  title: string
  authors: string
  patentNumber?: string
  publicationDate?: string
  citations?: number | null
}

interface ResumeUser {
  id?: string
  name?: string
  email?: string
  phone?: string
  mobile?: string
  image?: string | null
  linkedin?: string
  twitter?: string
}

interface ResumeSection {
  id: string
  type: "EDUCATION" | "EXPERIENCE" | "PROJECTS" | "CERTIFICATIONS" | "SKILLS" | "CUSTOM"
  content: string
  customName?: string
}

interface Resume {
  id: string
  title: string
  summary?: string
  user?: ResumeUser
  sections: ResumeSection[]
  skills?: Skill[]
  patents?: Patent[]
}

interface ClassicTemplateProps {
  resume: Resume
}

export function ClassicTemplate({ resume }: ClassicTemplateProps) {
  const { toast } = useToast()
  const resumeRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "")
  }, [])

  const renderSection = (section: ResumeSection) => {
    // Use customName if available, otherwise use the default section name
    const sectionTitle =
      section.customName ||
      (section.type === "EDUCATION"
        ? "Education"
        : section.type === "EXPERIENCE"
          ? "Experience"
          : section.type === "PROJECTS"
            ? "Projects"
            : section.type === "CERTIFICATIONS"
              ? "Certifications"
              : section.type === "SKILLS"
                ? "Skills"
                : "Custom")

    return (
      <div key={section.id} className="mb-6 animate-fadeIn hover:translate-x-1 transition-transform duration-300">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-xl font-bold tracking-tight text-primary">{sectionTitle}</h3>
          <Separator className="flex-1" />
        </div>
        <div
          className="prose prose-slate max-w-none dark:prose-invert pl-4"
          dangerouslySetInnerHTML={{
            __html: section.content,
          }}
        />
      </div>
    )
  }

  const renderSkills = () => {
    if (!resume.skills || resume.skills.length === 0) return null

    return (
      <div className="mb-6 animate-fadeIn">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-xl font-bold tracking-tight text-primary">Skills</h3>
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-3">
          {resume.skills.map((skill: Skill) => (
            <Card
              key={skill.id}
              className="overflow-hidden border border-primary/10 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-r from-background to-primary/5"
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-primary">{skill.name}</span>
                  <span className="text-xs bg-primary/10 px-2 py-1 rounded-full">{skill.proficiency}%</span>
                </div>
                <Progress value={skill.proficiency} className="h-2 bg-primary/10" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderPatents = () => {
    if (!resume.patents || resume.patents.length === 0) return null

    return (
      <div className="mb-6 animate-fadeIn">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-xl font-bold tracking-tight text-primary">Patents</h3>
          <Separator className="flex-1" />
        </div>
        <div className="space-y-4">
          {resume.patents.map((patent: Patent) => (
            <div
              key={patent.id}
              className="border-l-2 border-primary pl-4 py-3 hover:bg-primary/5 transition-colors duration-300 rounded-r-lg"
            >
              <h4 className="font-semibold text-lg mb-1">{patent.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{patent.authors}</p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {patent.patentNumber && (
                  <span className="bg-primary/5 px-2 py-1 rounded-full">Patent: {patent.patentNumber}</span>
                )}
                {patent.publicationDate && (
                  <span className="bg-primary/5 px-2 py-1 rounded-full">Published: {patent.publicationDate}</span>
                )}
                {patent.citations !== null && (
                  <span className="bg-primary/5 px-2 py-1 rounded-full">Citations: {patent.citations}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleExportATS = async () => {
    setIsExporting(true);
    try {
        const doc = new jsPDF({
            orientation: "p",
            unit: "pt",
            format: "a4",
        });

        // --- Formatting Constants ---
        const MARGIN = 40;
        const FONT_NAME = 'helvetica'; // Standard ATS-safe font
        const NAME_SIZE = 18;
        const HEADING_SIZE = 12;
        const BODY_SIZE = 10;
        const CONTACT_SIZE = 9;
        // Further increased line spacing for more space within text blocks (kept same)
        const LINE_SPACING_BODY = 1.3;
        // Adjusted space after each major section back to 18 for ~2 line gap between sections
        const SECTION_SPACE_AFTER = 8; 
        const HEADING_SPACE_AFTER = 6; // Space after a heading line (kept same)
        const ITEM_SPACE_AFTER = 4; // Space after a list item or paragraph (kept same)
        const CONTACT_SPACE_AFTER = 2; // Space between contact lines (kept same)
        // Space between heading line and the start of section content (kept same)
        const SPACE_AFTER_HEADING_LINE_CONTENT_START = 12;

        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const contentWidth = pageWidth - MARGIN * 2;
        let yPos = MARGIN; // Start position

        // --- PDF Generation Helpers ---

        // Helper to add text and manage Y position + page breaks
        // Now includes improved page break prediction
        const addText = (
            text: string,
            options: {
                x?: number;
                size?: number;
                style?: string;
                lineHeight?: number;
                spaceAfter?: number;
                maxWidth?: number;
                align?: 'left' | 'center' | 'right'; // Added alignment
            } = {} // Default options object
        ) => {
            const fontSize = options.size || BODY_SIZE;
            const fontStyle = options.style || "normal";
            const lineHeight = options.lineHeight || LINE_SPACING_BODY; // Uses the increased constant
            const spacing = options.spaceAfter || ITEM_SPACE_AFTER;
            const maxWidth = options.maxWidth || contentWidth;
            const alignment = options.align || 'left';
            const xPos = options.x || MARGIN;

            doc.setFontSize(fontSize);
            doc.setFont(FONT_NAME, fontStyle);
            doc.setLineHeightFactor(lineHeight);

            const lines = doc.splitTextToSize(text, maxWidth);
            // Approximate height considering line spacing
            const textHeight = doc.getTextDimensions(lines, { fontSize: fontSize }).h * lineHeight;

            // Check if text block fits, add page if not
            if (yPos + textHeight > pageHeight - MARGIN) {
                doc.addPage();
                yPos = MARGIN;
            }

            doc.text(lines, xPos, yPos, { maxWidth: maxWidth, align: alignment }); // Use alignment option

            yPos += textHeight + spacing;
        };


        const addHeading = (title: string) => {
             // Recalculate required space including heading text height (approx), HEADING_SPACE_AFTER, line height (5), and SPACE_AFTER_HEADING_LINE_CONTENT_START
             const requiredSpaceForHeadingBlock = HEADING_SIZE * 1 + HEADING_SPACE_AFTER + 5 + SPACE_AFTER_HEADING_LINE_CONTENT_START; // Using 1 as approx line height for heading text
            if (yPos > pageHeight - MARGIN - requiredSpaceForHeadingBlock) {
                doc.addPage();
                yPos = MARGIN;
            }
             // This space is added *before* the heading text starts
             yPos += SECTION_SPACE_AFTER / 2; // Space before heading text

            addText(title.toUpperCase(), {
                size: HEADING_SIZE,
                style: "bold",
                spaceAfter: HEADING_SPACE_AFTER, // Space after heading text, before line
                lineHeight: 1 // Keeping heading line height compact
            });
            // Optional: Add a line below heading
             doc.setLineWidth(0.5);
             // Line is drawn relative to the yPos *after* addText finishes for the heading
             doc.line(MARGIN, yPos - HEADING_SPACE_AFTER + (HEADING_SPACE_AFTER / 2) , pageWidth - MARGIN, yPos - HEADING_SPACE_AFTER + (HEADING_SPACE_AFTER / 2));
             // Adjusted line y position calculation slightly
             const lineY = yPos - HEADING_SPACE_AFTER/2;
             doc.line(MARGIN, lineY, pageWidth - MARGIN, lineY);

             // Add the space after the line before the content starts
             yPos += SPACE_AFTER_HEADING_LINE_CONTENT_START; // Space after line before content
        };

        // --- Content Generation ---

        // 1. Contact Information (Left Aligned, Clearer Layout)
        if (resume.user?.name) {
            addText(resume.user.name, {
                size: NAME_SIZE,
                style: "bold",
                spaceAfter: ITEM_SPACE_AFTER * 2, // More space after name
                lineHeight: 1
            });
        } else if (resume.title) {
             addText(resume.title, { // Use resume title if name missing
                 size: NAME_SIZE,
                 style: "bold",
                 spaceAfter: ITEM_SPACE_AFTER * 2,
                 lineHeight: 1
             });
        }

        if (resume.user?.mobile) {
            addText(resume.user.mobile, { size: CONTACT_SIZE, spaceAfter: CONTACT_SPACE_AFTER, lineHeight: 1 });
        }
        if (resume.user?.email) {
            addText(resume.user.email, { size: CONTACT_SIZE, spaceAfter: CONTACT_SPACE_AFTER, lineHeight: 1 });
        }
        if (resume.user?.linkedin) {
            const linkedInUrl = resume.user.linkedin.startsWith('http') ? resume.user.linkedin : `https://linkedin.com/in/${resume.user.linkedin}`;
            addText(`LinkedIn: ${linkedInUrl}`, { size: CONTACT_SIZE, spaceAfter: CONTACT_SPACE_AFTER, lineHeight: 1 });
        }
        if (resume.user?.twitter) {
             addText(`Twitter: https://twitter.com/${resume.user.twitter}`, { size: CONTACT_SIZE, spaceAfter: CONTACT_SPACE_AFTER, lineHeight: 1 });
        }
        yPos += SECTION_SPACE_AFTER / 2; // Add space after contact block


        // 2. Summary
        if (resume.summary) {
            addHeading("Summary");
            // This content is added as a single block, spacing controlled by LINE_SPACING_BODY
            addText(stripHtml(resume.summary), { spaceAfter: SECTION_SPACE_AFTER }); // Adds 18pt after content
        }

        // 3. Experience
        const experienceSection = resume.sections.find(s => s.type === "EXPERIENCE");
        if (experienceSection) {
            addHeading("Experience"); // Adds 9pt before heading
             // This content is added as a single block, spacing controlled by LINE_SPACING_BODY
            addText(stripHtml(experienceSection.content), { spaceAfter: SECTION_SPACE_AFTER }); // Adds 18pt after content
        }

         // 4. Education
        const educationSection = resume.sections.find(s => s.type === "EDUCATION");
        if (educationSection) {
            addHeading("Education"); // Adds 9pt before heading
             // This content is added as a single block, spacing controlled by LINE_SPACING_BODY
            addText(stripHtml(educationSection.content), { spaceAfter: SECTION_SPACE_AFTER }); // Adds 18pt after content
        }

        // 5. Skills (Bulleted List) - Spacing is handled by ITEM_SPACE_AFTER between list items
        let allSkills: string[] = [];
        if (resume.skills) {
             // Assuming resume.skills is an array of skill objects like { name: 'Skill Name' }
             // Adjust mapping if structure is different
            allSkills = allSkills.concat(resume.skills.map(s => s.name));
        }
        const skillsSections = resume.sections.filter(s => s.type === "SKILLS");
        skillsSections.forEach(section => {
             // stripHtml should ideally handle converting list items to lines
            const skillsFromSection = stripHtml(section.content)
                 .split('\n') // Split by newline (stripHtml preserves list items as newlines)
                 .map(s => s.replace(/^•\s*/, '').trim()) // Remove potential leading bullets from stripHtml and trim
                 .filter(s => s);
            allSkills = allSkills.concat(skillsFromSection);
        });
        const uniqueSkills = [...new Set(allSkills)].filter(s => s);

        if (uniqueSkills.length > 0) {
            addHeading("Skills"); // Adds 9pt before heading
            uniqueSkills.forEach(skill => {
                 // Each skill is added as a separate text line with space after
                addText(`• ${skill}`, { spaceAfter: ITEM_SPACE_AFTER });
            });
             // This effectively adds SECTION_SPACE_AFTER - ITEM_SPACE_AFTER after the last item
             yPos += SECTION_SPACE_AFTER - ITEM_SPACE_AFTER; // Adds 18pt after the last skill item
        }

        // 6. Projects
        const projectsSection = resume.sections.find(s => s.type === "PROJECTS");
        if (projectsSection) {
            addHeading("Projects"); // Adds 9pt before heading
             // This content is added as a single block, spacing controlled by LINE_SPACING_BODY
            addText(stripHtml(projectsSection.content), { spaceAfter: SECTION_SPACE_AFTER }); // Adds 18pt after content
        }

        // 7. Certifications
        const certSection = resume.sections.find(s => s.type === "CERTIFICATIONS");
        if (certSection) {
            addHeading("Certifications"); // Adds 9pt before heading
             // This content is added as a single block, spacing controlled by LINE_SPACING_BODY
            addText(stripHtml(certSection.content), { spaceAfter: SECTION_SPACE_AFTER }); // Adds 18pt after content
        }

        // 8. Patents (Bulleted List) - Spacing is handled by ITEM_SPACE_AFTER between list items
        if (resume.patents && resume.patents.length > 0) {
            addHeading("Patents"); // Adds 9pt before heading
            resume.patents.forEach(patent => {
                let patentInfo = `${patent.title} - ${patent.authors}`;
                if (patent.patentNumber) patentInfo += ` (Patent #: ${patent.patentNumber})`;
                if (patent.publicationDate) patentInfo += ` (Published: ${patent.publicationDate})`;
                 // Each patent is added as a separate text line with space after
                addText(`• ${patentInfo}`, { size: BODY_SIZE, spaceAfter: ITEM_SPACE_AFTER });
            });
             // This effectively adds SECTION_SPACE_AFTER - ITEM_SPACE_AFTER after the last item
             yPos += SECTION_SPACE_AFTER - ITEM_SPACE_AFTER; // Adds 18pt after the last patent item
        }

        // 9. Custom Sections
              const customSections = resume.sections.filter((s) => s.type === "CUSTOM")
              customSections.forEach((section) => {
                const title = section.customName || "Custom Section"
                addHeading(title)
                addText(stripHtml(section.content), { spaceAfter: SECTION_SPACE_AFTER })
              })


        // --- Save the PDF ---
        const filename = `${resume.user?.name || resume.title || 'Resume'}_ATS.pdf`;
        doc.save(filename);
        toast({ title: "ATS Export successful", description: `Saved as ${filename}` });

    } catch (error) {
        console.error("ATS Export error:", error);
        toast({
            title: "ATS Export failed",
            description: "Could not generate ATS-friendly PDF. Please try again.",
            variant: "destructive",
        });
    } finally {
        setIsExporting(false);
    }
};

  const handleExport = async (exportType: string) => {
    // Route to the correct export function
    if (exportType === "ats-pdf") {
      await handleExportATS()
      return
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="overflow-hidden shadow-xl border-0 rounded-xl" ref={resumeRef}>
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background shadow-xl hover:scale-105 transition-transform duration-300">
                <AvatarImage
                  src={resume.user?.image || ""}
                  alt={resume.user?.name || ""}
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {resume.user?.name ? resume.user.name.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 text-primary">{resume.title}</h1>
                    {resume.user?.name && <p className="text-xl text-muted-foreground">{resume.user.name}</p>}
                  </div>

                  <div className="flex items-center gap-3">
                    {resume.user?.email && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110 cursor-pointer">
                            <Mail className="h-5 w-5 text-primary" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <p className="text-sm">{resume.user.email}</p>
                        </PopoverContent>
                      </Popover>
                    )}
                    {resume.user?.mobile && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110 cursor-pointer">
                            <Phone className="h-5 w-5 text-primary" />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-2">
                          <p className="text-sm">{resume.user.mobile}</p>
                        </PopoverContent>
                      </Popover>
                    )}
                    {resume.user?.twitter && (
                      <a
                        href={`https://twitter.com/${resume.user.twitter}`}
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Twitter Profile"
                      >
                        <Twitter className="h-5 w-5 text-primary" />
                      </a>
                    )}
                    {resume.user?.linkedin && (
                      <a
                        href={
                          resume.user.linkedin.startsWith("http")
                            ? resume.user.linkedin
                            : `https://linkedin.com/in/${resume.user.linkedin}`
                        }
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="h-5 w-5 text-primary" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8"  id="resume-content">
            {resume.summary && (
              <div className="mb-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xl font-bold tracking-tight text-primary">Summary</h2>
                  <Separator className="flex-1" />
                </div>
                <div
                  className="prose prose-slate max-w-none dark:prose-invert pl-4"
                  dangerouslySetInnerHTML={{
                    __html: resume.summary,
                  }}
                />
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                {resume.sections.filter((s: ResumeSection) => s.type !== "SKILLS").map(renderSection)}
              </div>
              <div className="space-y-6">
                {renderSkills()}
                {renderPatents()}
                {resume.sections.filter((s: ResumeSection) => s.type === "SKILLS").map(renderSection)}
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex justify-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="group" disabled={isExporting}>
                <Download className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => handleExport("ats-pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>ATS-Friendly PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="lg" className="group" asChild>
            <a href={`${origin}/r/${resume.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              Share Link
            </a>
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: hsl(var(--primary));
          margin-top: 1.2em;
          margin-bottom: 0.4em;
        }
        .prose p, .prose ul, .prose ol {
          color: hsl(var(--muted-foreground));
          margin-bottom: 0.8em;
        }
        .prose strong {
          color: hsl(var(--primary));
          font-weight: 600;
        }
        .exporting-pdf {
           background-color: white !important;
           color: #000000 !important;
         }
        .exporting-pdf * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
         }
        .exporting-pdf .bg-primary {
           background: linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%) !important;
           color: #ffffff !important;
         }
         .exporting-pdf .text-primary-foreground {
            color: #ffffff !important;
         }
        .exporting-pdf .text-primary {
           color: #3b82f6 !important;
        }
         .exporting-pdf .text-muted-foreground {
           color: #555555 !important;
           opacity: 1 !important;
         }
         .exporting-pdf .separator {
           background-color: #cccccc !important;
           height: 1px !important;
         }
      `}</style>
    </div>
  )
}
