"use client"

import { useState, useRef } from "react"
import { Download, User, ExternalLink, FileText, Mail, Twitter, Linkedin } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { jsPDF } from "jspdf"
import html2canvas from "html2canvas"

interface ResumeUser {
  name?: string;
  email?: string;
  image?: string;
  twitter?: string;
  linkedin?: string;
  mobile?: string;
}

interface ResumeSkill {
  id: string;
  name: string;
  proficiency: number;
}

interface ResumePatent {
  id: string;
  title: string;
  authors: string;
  patentNumber?: string;
  publicationDate?: string;
  citations?: number | null;
}

interface ResumeSection {
  id: string;
  type: "EDUCATION" | "EXPERIENCE" | "PROJECTS" | "CERTIFICATIONS" | "SKILLS" | "CUSTOM";
  content: string;
}

interface Resume {
  id: string;
  title: string;
  summary?: string;
  user?: ResumeUser;
  skills?: ResumeSkill[];
  patents?: ResumePatent[];
  sections: ResumeSection[];
}

interface ModernTemplateProps {
  resume: Resume;
}

function stripHtml(html: string | undefined | null): string {
  if (!html) return "";
  if (typeof window === 'undefined') return '';

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  // Attempt to add newlines logically
  // Replace <br> tags with newlines
  tempDiv.querySelectorAll("br").forEach(br => br.replaceWith("\n"));
  // Add newlines after block elements like p, div, li, headings
  tempDiv.querySelectorAll("p, div, li, h1, h2, h3, h4, h5, h6").forEach(el => {
      // Check if the element isn't empty and doesn't already end with significant whitespace
      const currentText = el.textContent || '';
      if (currentText.trim().length > 0 && !/\s\s+$/.test(currentText)) {
         el.append("\n");
      }
  });

  // Get text content
  let text = tempDiv.textContent || tempDiv.innerText || "";

  // Clean up whitespace:
  text = text.replace(/[ \t]+/g, ' '); // Collapse multiple spaces/tabs to one
  text = text.replace(/\n /g, '\n'); // Remove space after newline
  text = text.replace(/(\n\s*){3,}/g, '\n\n'); // Collapse 3+ newlines to 2 (paragraph break)
  text = text.trim(); // Remove leading/trailing whitespace

  return text;
}

export function ModernTemplate({ resume }: ModernTemplateProps) {
  const { toast } = useToast()
  const resumeRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const renderSection = (section: ResumeSection) => {
    const sectionTitle =
      section.type === "EDUCATION"
        ? "Education"
        : section.type === "EXPERIENCE"
          ? "Experience"
          : section.type === "PROJECTS"
            ? "Projects"
            : section.type === "CERTIFICATIONS"
              ? "Certifications"
              : section.type === "SKILLS"
                ? "Skills"
                : "Custom"

    return (
      <div key={section.id} className="mb-6 animate-fadeIn">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xl font-semibold text-primary">{sectionTitle}</h3>
          <Separator className="flex-1" />
        </div>
        <div
          className="prose prose-slate max-w-none dark:prose-invert leading-snug"
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
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xl font-semibold text-primary">Skills</h3>
          <Separator className="flex-1" />
        </div>
        <div className="space-y-2.5">
          {resume.skills.map((skill: ResumeSkill) => (
            <div key={skill.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">{skill.name}</span>
                <span className="text-xs text-muted-foreground">{skill.proficiency}%</span>
              </div>
              <Progress value={skill.proficiency} className="h-1.5 bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderPatents = () => {
    if (!resume.patents || resume.patents.length === 0) return null

    return (
      <div className="mb-6 animate-fadeIn">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xl font-semibold text-primary">Patents</h3>
          <Separator className="flex-1" />
        </div>
        <div className="space-y-4">
          {resume.patents.map((patent: ResumePatent) => (
            <Card key={patent.id} className="bg-muted/30 border-l-4 border-l-primary">
              <CardContent className="p-4 space-y-1">
                <h4 className="font-medium">{patent.title}</h4>
                <p className="text-sm text-muted-foreground">{patent.authors}</p>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  {patent.patentNumber && <span>Patent: {patent.patentNumber}</span>}
                  {patent.publicationDate && <span>Published: {patent.publicationDate}</span>}
                  {patent.citations !== null && <span>Citations: {patent.citations}</span>}
                </div>
              </CardContent>
            </Card>
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
        const customSections = resume.sections.filter(s => s.type === "CUSTOM");
         customSections.forEach(section => {
             // Derive title - CHECK HOW YOUR DATA STORES CUSTOM TITLES
             // If section.content includes the title on the first line:
             const contentLines = stripHtml(section.content).split('\n');
             const title = contentLines[0] || `Custom Section (${section.id})`; // Use first line or fallback
             const body = contentLines.slice(1).join('\n'); // Rest of the content is the body

             addHeading(title); // Adds 9pt before heading
              // This content is added as a single block, spacing controlled by LINE_SPACING_BODY
             addText(body, { spaceAfter: SECTION_SPACE_AFTER }); // Adds 18pt after content
         });


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
    // --- NEW: Route to the correct export function ---
    if (exportType === 'ats-pdf') {
        await handleExportATS();
        return;
    }else {
      // Handle other export types like Markdown, JSON if needed
      toast({
        title: "Export unsupported",
        description: `${exportType.toUpperCase()} coming soon!`,
      });
    }
  };
  
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50  py-10">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="overflow-hidden shadow-lg border-0 dark:border-gray-700" ref={resumeRef}>
          <div className="bg-primary p-6 md:p-8 text-primary-foreground dark:bg-gray-800 dark:text-gray-100 relative">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-primary-foreground/20 shadow-md">
                <AvatarImage
                  src={resume.user?.image || ''}
                  alt={resume.user?.name || ''}
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
                <AvatarFallback className="text-2xl bg-primary-foreground/10 text-primary-foreground dark:bg-gray-700 dark:text-gray-200">
                  {resume.user?.name ? resume.user.name.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{resume.title}</h1>
                    {resume.user?.name && <p className="text-lg md:text-xl opacity-90 dark:opacity-80">{resume.user.name}</p>}
                  </div>

                  <div className="flex items-center gap-3 mt-2 md:mt-0">
                    {resume.user?.email && (
                      <a
                        href={`mailto:${resume.user.email}`}
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={resume.user.email}
                      >
                        <Mail className="h-5 w-5 text-foreground" />
                      </a>
                    )}
                    {resume.user?.twitter && (
                      <a
                        href={`https://twitter.com/${resume.user.twitter}`}
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Twitter"
                      >
                        <Twitter className="h-5 w-5 text-foreground " />
                      </a>
                    )}
                    {resume.user?.linkedin && (
                      <a
                        href={resume.user.linkedin.startsWith('http') ? resume.user.linkedin : `https://linkedin.com/in/${resume.user.linkedin}`}
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5 text-foreground " />
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="p-6 md:p-8" >
          {resume.summary && (
              <div className="mb-6 animate-fadeIn">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-semibold text-primary">Summary</h2>
                  <Separator className="flex-1" />
                </div>
                <div
                  className="prose prose-slate max-w-none dark:prose-invert leading-snug"
                  dangerouslySetInnerHTML={{
                    __html: resume.summary,
                  }}
                />
              </div>
          )}

            <div className="grid md:grid-cols-3 gap-6">
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

        <div className="mt-8 flex justify-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="group" disabled={isExporting}>
                <Download className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              {/* --- NEW ATS PDF Option --- */}
              <DropdownMenuItem onClick={() => handleExport("ats-pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>ATS-Friendly PDF</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="group" asChild>
            {/* @ts-ignore */}
            <a
              href={`${window.location.origin}/r/${resume.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              Share Link
            </a>
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: hsl(var(--primary));
          margin-top: 1.2em;
          margin-bottom: 0.4em;
        }
        .prose p, .prose ul, .prose ol {
          margin-top: 0.4em;
          margin-bottom: 0.4em;
          line-height: 1.4;
        }
        .exporting-pdf {
           background-color: white !important; /* Force white background */
           color: #000000 !important; /* Base text color */
         }
        .exporting-pdf * {
          -webkit-print-color-adjust: exact !important;
          color-adjust: exact !important;
          print-color-adjust: exact !important;
          /* Reset potential dark mode colors */
          /* color: inherit !important;  Might cause issues, be specific */
         }

        /* Override specific elements for VISUAL export if needed */
        .exporting-pdf .bg-primary {
           background: linear-gradient(135deg,rgb(255, 255, 255) 0%,rgb(255, 255, 255) 100%) !important; /* Example gradient */
           color: #ffffff !important;
         }
         .exporting-pdf .text-primary-foreground {
            color: #ffffff !important;
         }
        .exporting-pdf .text-primary {
           color: #3b82f6 !important; /* Example primary color */
        }
         .exporting-pdf .text-muted-foreground {
           color: #555555 !important; /* Darker gray for print */
           opacity: 1 !important;
         }
         .exporting-pdf .separator {
           background-color: #cccccc !important; /* Lighter gray separator */
           height: 1px !important;
         }
         .exporting-pdf .prose * {
           /* Ensure prose text is black */
           /* color: #000000 !important; */ /* Might conflict with specific overrides */
         }
         /* Hide elements not wanted in visual PDF */
         .exporting-pdf .some-unwanted-element {
            display: none !important;
         }
         /* Hide progress bars visually in PDF as they are images */
         .exporting-pdf .progress-bar-container { /* Add a class to the container div if needed */
            /* display: none !important; */ /* Or style text instead */
         }
      `}</style>
    </div>
  )
}