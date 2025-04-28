// This file handles the API calls to Google's Gemini AI for resume optimization

class GeminiService {
  private apiKey: string
  private apiEndpoint: string
  private isUserInteracted: boolean = false

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
    this.apiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
  }

  // Set user interaction status
  public setUserInteracted(status: boolean): void {
    this.isUserInteracted = status
  }

  // Check if user has interacted
  public hasUserInteracted(): boolean {
    return this.isUserInteracted
  }

  // Initial greeting without streaming tokens
  public getInitialGreeting(): string {
    return "Hey there! I'm your resume assistant. I can help optimize your resume with professional suggestions. How can I help you today?"
  }

  public createPrompt(userQuery: string, context: object): string {
    return `As a professional resume expert, provide concise, actionable advice. Follow these rules:
    - Respond in bullet points when possible
    - Prioritize quantifiable achievements (use percentages, numbers, and metrics)
    - Include industry-specific and ATS-friendly keywords
    - Keep suggestions specific and implementable
    - Provide before/after examples when appropriate
    - Focus on impactful language that highlights results
    
    Context: ${JSON.stringify(context)}
    
    User Request: ${userQuery}
    
    Provide only the most valuable improvements with clear reasoning.`
  }

  async generateContent(prompt: string, context = {}) {
    // Check if user has interacted before generating content
    if (!this.isUserInteracted) {
      return this.getInitialGreeting()
    }

    if (!this.apiKey) {
      console.error("API key not configured")
      return this.getFallbackResponse("default")
    }

    try {
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: this.createPrompt(prompt, context) }],
            },
          ],
          generationConfig: {
            temperature: 0.7, // Slightly increased for more creative responses
            topK: 40,
            topP: 0.9,
            maxOutputTokens: 800, // Increased to allow for more detailed responses
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)

      const data = await response.json()
      return data.candidates?.[0]?.content?.parts?.[0]?.text || this.getFallbackResponse("default")
    } catch (error) {
      console.error("API call failed:", error)
      return this.getFallbackResponse(
        prompt.includes("summary")
          ? "summary"
          : prompt.includes("skill")
            ? "skills"
            : prompt.includes("experience")
              ? "experience"
              : prompt.includes("education")
                ? "education"
                : prompt.includes("project")
                  ? "projects"
                  : "default",
      )
    }
  }

  // Enhanced section-specific methods
  async improveSummary(currentSummary: string, jobTitle = "", industry = "") {
    // Set user interaction to true when this method is called
    this.setUserInteracted(true)
    
    const prompt = `Improve this professional summary${jobTitle ? ` for ${jobTitle}` : ""}${industry ? ` in the ${industry} industry` : ""}:
    "${currentSummary}"
    Provide 2 stronger versions with metrics and industry keywords. Focus on career achievements and unique value proposition.`
    return this.generateContent(prompt, { summary: currentSummary, jobTitle, industry })
  }

  async suggestSkills(jobTitle: string, existingSkills: string[] = [], industry = "", experienceLevel = "mid") {
    // Set user interaction to true when this method is called
    this.setUserInteracted(true)
    
    const prompt = `Suggest 8 must-have skills for a ${experienceLevel}-level ${jobTitle}${industry ? ` in ${industry}` : ""} not already included in: ${existingSkills.join(", ")}
    Categorize them as technical, soft, and industry-specific skills. Include at least 2 ATS-friendly keywords.`
    return this.generateContent(prompt, { jobTitle, existingSkills, industry, experienceLevel })
  }

  async improveExperienceItem(experienceEntry: string, jobTitle = "", industry = "") {
    // Set user interaction to true when this method is called
    this.setUserInteracted(true)
    
    const prompt = `Improve this resume bullet point${jobTitle ? ` for ${jobTitle}` : ""}${industry ? ` in ${industry}` : ""}:
    "${experienceEntry}"
    Provide 3 stronger versions with quantifiable metrics and accomplishments. Use strong action verbs and highlight impact.`
    return this.generateContent(prompt, { experienceEntry, jobTitle, industry })
  }

  async analyzeResume(resumeData: { 
    title: string; 
    summary?: string; 
    skills: string[]; 
    experience?: string[]; 
    education?: string[]; 
    projects?: string[];
    targetRole?: string;
    targetIndustry?: string;
  }) {
    // Set user interaction to true when this method is called
    this.setUserInteracted(true)
    
    const prompt = `Provide a comprehensive analysis of this ${resumeData.title} resume${resumeData.targetRole ? ` for a ${resumeData.targetRole} position` : ""}${resumeData.targetIndustry ? ` in the ${resumeData.targetIndustry} industry` : ""}.
    Include:
    1. Top 5 urgent improvements with clear reasoning
    2. ATS optimization recommendations
    3. Content gaps compared to industry standards
    4. Strengths to emphasize`
    return this.generateContent(prompt, resumeData)
  }

  async analyzeTextInRealTime(text: string, sectionType: string, jobTitle = "") {
    // Set user interaction to true when this method is called
    this.setUserInteracted(true)
    
    const prompt = `Suggest a better way to phrase this for a resume ${sectionType} section${jobTitle ? ` for a ${jobTitle} position` : ""}:
    
    "${text}"
    
    Provide specific improvements focusing on:
    1. Strong action verbs
    2. Quantifiable metrics
    3. Impact and achievements
    4. ATS-friendly terminology`
    
    try {
      const response = await this.generateContent(prompt, { text, sectionType, jobTitle })
      
      // Try to extract structured improvements from the response
      const improvementMatch = response.match(/Original: .+\nImproved: (.+)(\nReason: .+)?/s)
      
      if (improvementMatch) {
        return {
          originalPhrase: text,
          suggestion: improvementMatch[1].trim(),
          reason: improvementMatch[2] ? improvementMatch[2].replace(/^Reason: /, '').trim() : "Improved clarity and impact"
        }
      }
      
      // Fallback to returning the full response
      return {
        originalPhrase: text,
        suggestion: response.trim(),
        reason: "Enhanced professional presentation"
      }
    } catch (error) {
      console.error("Error analyzing text in real-time:", error)
      return null
    }
  }

  // New methods for additional functionality
  
  async generateAchievementIdeas(roleTitle: string, industry = "", experienceLevel = "mid") {
    // Set user interaction to true when this method is called
    this.setUserInteracted(true)
    
    const prompt = `Generate 8 quantifiable achievement examples for a ${experienceLevel}-level ${roleTitle}${industry ? ` in ${industry}` : ""}.
    Format as bullet points with metrics and results. Focus on common responsibilities and how they can be measured.`
    return this.generateContent(prompt, { roleTitle, industry, experienceLevel })
  }
  
  async suggestEducationFormatting(education: string) {
    // Set user interaction to true when this method is called
    this.setUserInteracted(true)
    
    const prompt = `Suggest how to better format and present this education information:
    "${education}"
    Provide a clear, ATS-friendly structure with proper date formatting and relevant details.`
    return this.generateContent(prompt, { education })
  }
  
  async suggestProjectHighlights(projectDescription: string, targetRole = "") {
    // Set user interaction to true when this method is called
    this.setUserInteracted(true)
    
    const prompt = `Enhance this project description${targetRole ? ` to appeal to ${targetRole} positions` : ""}:
    "${projectDescription}"
    Focus on technical skills, leadership, and measurable outcomes. Create 2-3 bullet points.`
    return this.generateContent(prompt, { projectDescription, targetRole })
  }
  
  async generateCoverLetterPoints(resumeHighlights: string, jobDescription = "") {
    // Set user interaction to true when this method is called
    this.setUserInteracted(true)
    
    const prompt = `Generate 3-4 strong cover letter talking points based on these resume highlights:
    "${resumeHighlights}"
    ${jobDescription ? `Job description: "${jobDescription}"` : ""}
    Focus on connecting experience to job requirements with specific examples.`
    return this.generateContent(prompt, { resumeHighlights, jobDescription })
  }

  async tailorResumeForJob(resumeSections: { [key: string]: string }, jobDescription: string) {
    // Set user interaction to true when this method is called
    this.setUserInteracted(true)
    
    const prompt = `Provide specific recommendations to tailor this resume for the following job:
    
    Job Description: "${jobDescription}"
    
    Focus on:
    1. Key skills to emphasize
    2. Experience bullets to highlight or modify
    3. Keywords to include for ATS optimization
    4. Sections to prioritize or reorganize`
    
    return this.generateContent(prompt, { resumeSections, jobDescription })
  }

  public getFallbackResponse(requestType: string): string {
    const fallbacks: Record<string, string> = {
      summary: `Here are some tips to improve your professional summary:

- Start with role + years of experience + key expertise areas
- Include 2-3 key achievements with specific numbers (%, $, time saved)
- Add 3-5 industry-relevant keywords for ATS optimization
- Keep it concise (3-5 lines) but impactful
- End with a career goal that aligns with the position

Example structure:
"[Role] with [X] years of experience in [industry/specialization]. Proven track record of [achievement with metrics] and [another achievement with metrics]. Expertise in [relevant skills]. Seeking to [career goal relevant to target position]."`,

      skills: `To optimize your skills section:

Technical Skills:
- List 6-8 job-specific technical skills (tools, software, methodologies)
- Include skill level indicators for technical proficiencies
- Group related skills together (e.g., programming languages, design tools)

Soft Skills:
- Include 3-5 relevant soft skills that match the job description
- Prioritize skills mentioned in the job posting

Additional recommendations:
- Use industry-standard terminology (avoid abbreviations when possible)
- Include certifications with dates if relevant
- Consider a skills matrix for technical roles (visual representation)

Remember: Quality over quantity - focus on skills directly relevant to your target role.`,

      experience: `To create powerful experience bullet points:

Strong bullet point formula:
Action Verb + Specific Task + Measurable Result

Before: "Responsible for managing social media accounts"
After: "Increased social media engagement by 47% by implementing targeted content strategy across 5 platforms"

Tips:
1. Start each bullet with a strong action verb (e.g., achieved, launched, spearheaded)
2. Include at least one quantifiable metric per role (%, $, time, scale)
3. Focus on achievements rather than duties
4. Show problem → solution → result
5. Use 3-5 bullets per position, with the most impressive first
6. Include relevant keywords from the job description`,

      education: `To optimize your education section:

Format recommendations:
- Degree Name, Major/Specialization
- University Name, Location
- Graduation Date (Month Year)
- GPA if above 3.5/4.0
- Relevant coursework (if recent graduate)
- Academic honors, scholarships, relevant extracurriculars

Example:
Bachelor of Science, Computer Science
Stanford University, Stanford, CA
May 2023 | GPA: 3.8/4.0
- Dean's List (4 semesters)
- Relevant coursework: Data Structures, Machine Learning, Database Systems`,

      projects: `To create impactful project descriptions:

Format each project as:
- Project Name (with link if available)
- Brief overview (1 sentence)
- 2-3 bullet points highlighting:
  * Technologies/skills utilized
  * Your specific contribution
  * Quantifiable outcomes or results
  * Problem solved or value added

Example:
Inventory Management System (GitHub link)
Developed a full-stack inventory tracking solution for small businesses
• Built responsive front-end using React and Material UI, reducing user errors by 35%
• Implemented Node.js/Express backend with MongoDB, enabling real-time inventory updates
• Deployed solution that reduced inventory discrepancies by 27% in first month of use`,

      default: `Resume Optimization Tips:

1. Tailor for ATS systems:
   - Include keywords from the job description
   - Use standard section headings
   - Avoid tables, headers/footers, and complex formatting

2. Content recommendations:
   - Focus on achievements over responsibilities
   - Quantify results whenever possible
   - Use strong action verbs
   - Keep formatting consistent throughout

3. Structure and organization:
   - Most relevant information at the top
   - Use reverse chronological order for experience
   - Keep to 1-2 pages maximum
   - Ensure adequate white space for readability

Let me know if you'd like more specific advice for any section of your resume!`,
    }
    return fallbacks[requestType] || fallbacks.default
  }
}

export const geminiService = new GeminiService()