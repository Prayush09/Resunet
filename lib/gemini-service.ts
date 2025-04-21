"use client"

// This file handles the API calls to Google's Gemini AI

class GeminiService {
  private apiKey: string;
  private apiEndpoint: string;
  
  constructor() {
    this.apiKey = 'AIzaSyD_MCYA9oG0QJQ_IFShQyzm49rQ1GPx9zQ';
    // Updated endpoint URL to use the current version of the API
    this.apiEndpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  }

  async generateContent(prompt: string, context = {}) {
    if (!this.apiKey) {
      console.error('Gemini API key is not set');
      throw new Error('API key not configured');
    }

    try {
      console.log(`Calling Gemini API at ${this.apiEndpoint}`);
      
      const response = await fetch(`${this.apiEndpoint}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a professional resume writing assistant. Your goal is to help users create effective resumes.
                  
                  Context about the resume:
                  ${JSON.stringify(context)}
                  
                  User query: ${prompt}
                  
                  Provide helpful, specific advice for improving their resume. Focus on concrete suggestions they can implement immediately. Be concise but thorough.`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'No error details available');
        console.error(`API error details: ${errorText}`);
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Extract text from the response based on Gemini API structure
      if (data.candidates && data.candidates[0]?.content?.parts && data.candidates[0].content.parts[0]?.text) {
        return data.candidates[0].content.parts[0].text;
      } else {
        console.error('Unexpected API response format:', data);
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  }

  // Add specialized methods for different resume sections
  async improveSummary(currentSummary: string, jobTitle = "") {
    const prompt = `I need help improving this professional summary for my resume${jobTitle ? ` for a ${jobTitle} position` : ''}:
    
    "${currentSummary || 'No summary provided yet'}"
    
    Please provide a more effective version that highlights my skills and experience.`;
    
    return this.generateContent(prompt, { summary: currentSummary, jobTitle });
  }

  async suggestSkills(jobTitle: string, existingSkills: { name: string }[] = []) {
    const prompt = `I'm creating a resume for a ${jobTitle} position. Here are some skills I've already listed:
    
    ${existingSkills.map(skill => skill.name).join(', ')}
    
    What additional skills would be valuable to include, and how should I organize them?`;
    
    return this.generateContent(prompt, { jobTitle, existingSkills });
  }

  async improveExperienceItem(experienceEntry: string) {
    const prompt = `Help me improve this work experience bullet point for my resume:
    
    "${experienceEntry}"
    
    Please rewrite it to be more impactful using strong action verbs and quantifiable achievements.`;
    
    return this.generateContent(prompt, { experienceEntry });
  }

  async analyzeResume(resumeData: { title: string, summary?: string, skills: { name: string }[], activeTab?: string }) {
    const prompt = `Please analyze my resume and provide specific suggestions for improvement:
    
    Title: ${resumeData.title}
    Summary: ${resumeData.summary || 'No summary provided'}
    Skills: ${resumeData.skills.map(s => s.name).join(', ')}
    Currently editing: ${resumeData.activeTab || 'general resume'}
    
    What are the most important areas I should focus on improving? Give me 2-3 actionable suggestions.`;
    
    return this.generateContent(prompt, resumeData);
  }

  // Fallback method for when API calls fail
  getFallbackResponse(requestType: string): string {
    const fallbackResponses: Record<string, string> = {
      'summary': "To improve your professional summary, focus on highlighting your most impressive achievements and relevant skills in 3-5 concise sentences. Begin with a strong statement about your professional identity, followed by your years of experience and key areas of expertise. End with what you aim to bring to your next role.",
      
      'skills': "When listing skills on your resume, organize them by category (technical skills, soft skills, industry knowledge) and prioritize those most relevant to the job you're applying for. Use specific tools, technologies, and methodologies rather than general terms. Consider using a simple rating system to indicate proficiency levels.",
      
      'experience': "To strengthen your experience section, use powerful action verbs at the beginning of each bullet point and quantify your achievements with specific metrics when possible. Focus on results and impact rather than just responsibilities. Each bullet should follow the format: Action verb + task + result/impact.",
      
      'default': "I'm your resume assistant and can help you improve different sections of your resume. Would you like suggestions for your summary, skills, or experience sections? I can also help with overall resume formatting advice."
    };
    
    return fallbackResponses[requestType] || fallbackResponses.default;
  }
}

// Export as singleton
const geminiService = new GeminiService();
export default geminiService;