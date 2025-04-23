"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, Send, Lightbulb, Sparkles, X, Copy, CheckCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip } from "@/components/ui/tooltip"
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import geminiService from "@/lib/gemini-service"
import ReactMarkdown from "react-markdown"

// Types
interface Message {
  role: "user" | "assistant"
  content: string
  isVisible?: boolean 
}

interface ResumeSectionData {
  id: string
  type: string
  content: string
}

interface ResumeSkillData {
  id: string
  name: string
  proficiency: number
}

interface ResumeData {
  title: string
  summary: string | null
  sections: ResumeSectionData[]
  skills: ResumeSkillData[]
}

interface ResumeAIHelperProps {
  resumeData: ResumeData
  activeTab: string
  onSuggestionApply: (content: string, targetField?: string) => void
}

export function ResumeAIHelper({ resumeData, activeTab, onSuggestionApply }: ResumeAIHelperProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your resume assistant. How can I help improve your resume today?",
      isVisible: true // This welcome message should be visible
    }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(true)
  const [suggestionInProgress, setSuggestionInProgress] = useState(false)
  const [apiErrorCount, setApiErrorCount] = useState(0)
  const [inputValue, setInputValue] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const generateContextualSuggestion = async (tab: string) => {
    try {
      setSuggestionInProgress(true)
      setIsLoading(true)
      
      // Internal prompt message - NOT visible to user
      setMessages(prev => [...prev, { 
        role: "user", 
        content: `Generate suggestions for the ${tab} section of my resume.`,
        isVisible: false // This prompt should NOT be visible to users
      }])
      
      let response = ""
      
      // If the API has failed more than twice, use fallback responses
      if (apiErrorCount > 2) {
        const fallbackType = tab === "sections" ? "summary" : 
                            tab === "skills" ? "skills" : 
                            tab === "patents" ? "experience" : "default";
        
        response = geminiService.getFallbackResponse(fallbackType);
      } else {
        switch (tab) {
          case "sections":
            response = await geminiService.analyzeResume({
              ...resumeData,
              summary: resumeData.summary || undefined,
              activeTab: tab
            })
            break
            
          case "skills":
            response = await geminiService.suggestSkills(
              resumeData.title || "this position", 
              resumeData.skills
            )
            break
            
          case "patents":
            response = "Looking at your patents section, I can help you format your entries effectively. Would you like some tips on how to present your patents or help refining specific entries?"
            break
            
          default:
            response = await geminiService.analyzeResume({
              ...resumeData,
              summary: resumeData.summary || undefined,
              activeTab: tab
            })
        }
      }
      
      // Add AI response - visible to user
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response,
        isVisible: true
      }])
    } catch (error) {
      console.error("Error generating contextual suggestion:", error)
      
      // Increment error count
      setApiErrorCount(prev => prev + 1)
      
      // Use fallback content
      const fallbackType = tab === "sections" ? "summary" : 
                          tab === "skills" ? "skills" : 
                          tab === "patents" ? "experience" : "default";
      
      const fallbackResponse = geminiService.getFallbackResponse(fallbackType);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: fallbackResponse,
        isVisible: true
      }]);
    } finally {
      setIsLoading(false)
      setSuggestionInProgress(false)
    }
  }

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  // Generate contextual suggestions based on active tab
  useEffect(() => {
    if (isExpanded && !suggestionInProgress && messages.length <= 1) {
      generateContextualSuggestion(activeTab)
    }
  }, [activeTab, isExpanded, suggestionInProgress, messages.length, generateContextualSuggestion])

  // Send message to AI
  async function sendMessage(content: string) {
    if (!content.trim()) return

    try {
      setIsLoading(true)
      
      // Add user message to chat - visible
      setMessages(prev => [...prev, { 
        role: "user", 
        content,
        isVisible: true 
      }])

      // If the API has failed more than twice, use fallback responses
      if (apiErrorCount > 2) {
        const keywords = content.toLowerCase();
        let fallbackType = "default";
        
        if (keywords.includes("summary") || keywords.includes("profile")) {
          fallbackType = "summary";
        } else if (keywords.includes("skill")) {
          fallbackType = "skills";
        } else if (keywords.includes("experience") || keywords.includes("work") || keywords.includes("job")) {
          fallbackType = "experience";
        }
        
        const fallbackResponse = geminiService.getFallbackResponse(fallbackType);
        setTimeout(() => {
          setMessages(prev => [...prev, { 
            role: "assistant", 
            content: fallbackResponse,
            isVisible: true 
          }]);
          setIsLoading(false);
        }, 1000);
        return;
      }

      // Call the Gemini API through our service - don't expose the full context to the user
      const response = await geminiService.generateContent(content, {
        title: resumeData.title,
        summary: resumeData.summary || "",
        activeTab,
        sections: resumeData.sections.map(section => ({
          type: section.type,
          content: section.content
        })),
        skills: resumeData.skills.map(skill => ({
          name: skill.name,
          proficiency: skill.proficiency
        }))
      })
      
      // Add AI response - visible
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response,
        isVisible: true 
      }])
    } catch (error) {
      console.error("Error with Gemini API request:", error)
      
      // Increment error count
      setApiErrorCount(prev => prev + 1)
      
      // Use fallback content based on user query
      const keywords = content.toLowerCase();
      let fallbackType = "default";
      
      if (keywords.includes("summary") || keywords.includes("profile")) {
        fallbackType = "summary";
      } else if (keywords.includes("skill")) {
        fallbackType = "skills";
      } else if (keywords.includes("experience") || keywords.includes("work") || keywords.includes("job")) {
        fallbackType = "experience";
      }
      
      const fallbackResponse = geminiService.getFallbackResponse(fallbackType);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: fallbackResponse,
        isVisible: true 
      }]);
    } finally {
      setIsLoading(false)
      setInputValue("")
    }
  }

  async function handleSpecificRequest(requestType: string) {
    setIsLoading(true)
    
    try {
      let response = ""
      // Add user message to chat - visible to the user
      let userMessage = "";
      
      switch (requestType) {
        case "improveSummary":
          userMessage = "Can you improve my professional summary?";
          break;
          
        case "suggestSkills":
          userMessage = "Suggest skills for my resume";
          break;
          
        case "improveExperience":
          userMessage = "How can I strengthen my experience section?";
          break;
          
        default:
          userMessage = "What should I improve in my resume?";
      }
      
      // Add visible user message
      setMessages(prev => [...prev, { 
        role: "user", 
        content: userMessage,
        isVisible: true 
      }]);
      
      // If API has failed too many times, use fallback
      if (apiErrorCount > 2) {
        response = geminiService.getFallbackResponse(
          requestType === "improveSummary" ? "summary" : 
          requestType === "suggestSkills" ? "skills" : 
          requestType === "improveExperience" ? "experience" : "default"
        );
      } else {
        switch (requestType) {
          case "improveSummary":
            if (resumeData.summary) {
              response = await geminiService.improveSummary(
                resumeData.summary, 
                resumeData.title || ""
              );
            } else {
              
              response = "I'd be happy to help with your professional summary.I am not working...|| Could you provide some details about your experience and skills, or would you like me to help you create one from scratch?";
            }
            break;
            
          case "suggestSkills":
            response = await geminiService.suggestSkills(
              resumeData.title || "this position", 
              resumeData.skills
            );
            break;
            
          case "improveExperience":
            // Find an experience section if it exists
            const experienceSection = resumeData.sections.find(section => 
              section.type.toLowerCase().includes("experience") || 
              section.type.toLowerCase().includes("work")
            );
            
            if (experienceSection) {
              response = await geminiService.improveExperienceItem(experienceSection.content);
            } else {
              response = "To strengthen your experience section, focus on using strong action verbs and quantifying your achievements whenever possible. For example, instead of saying 'Responsible for project management', say 'Led 5 cross-functional projects that increased efficiency by 30%'. Would you like me to help with specific entries in your experience section?";
            }
            break;
            
          default:
            response = geminiService.getFallbackResponse("default");
        }
      }
      
      // Add AI response - visible
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: response,
        isVisible: true 
      }]);
    } catch (error) {
      console.error("Error with specific request:", error);
      
      // Increment error count
      setApiErrorCount(prev => prev + 1);
      
      // Use fallback response
      const fallbackResponse = geminiService.getFallbackResponse(
        requestType === "improveSummary" ? "summary" : 
        requestType === "suggestSkills" ? "skills" : 
        requestType === "improveExperience" ? "experience" : "default"
      );
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: fallbackResponse,
        isVisible: true 
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  // Copy content to clipboard
  const copyToClipboard = (content: string, id: number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(`${id}`);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <div className={`w-full mt-6 rounded-lg shadow-lg bg-card border transition-all duration-300 ${isExpanded ? 'h-[30rem]' : 'h-12'}`}>
    {/* Header */}
    <div 
      className="flex items-center justify-between p-3 bg-primary text-primary-foreground rounded-t-lg cursor-pointer" 
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center">
        <Bot className="h-5 w-5 mr-2" />
        <h3 className="font-medium">Resunest AI Assistant</h3>
      </div>
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary-foreground/20">
        {isExpanded ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </Button>
    </div>
  
    {isExpanded && (
      <>
        {/* FIXME: Alot of hydration errors are getting caused by this.. but the output is fine. fix it */}
        <ScrollArea className="h-64 p-3" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages
              .filter(msg => msg.isVisible !== false)
              .map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`relative rounded-lg px-3 py-2 max-w-[90%] ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    <div className="prose dark:prose-invert">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    {msg.role === 'assistant' && msg.content.length > 20 && (
                      <div className="flex mt-2 space-x-2">
                        {activeTab === "sections" && resumeData.summary && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 text-xs"
                            onClick={() => onSuggestionApply(msg.content, "summary")}
                          >
                            Apply to Summary
                          </Button>
                        )}
  
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-7 text-xs px-2"
                                onClick={() => copyToClipboard(msg.content, i)}
                              >
                                {copied === `${i}` ? (
                                  <CheckCheck className="h-3 w-3 mr-1" />
                                ) : (
                                  <Copy className="h-3 w-3 mr-1" />
                                )}
                                {copied === `${i}` ? "Copied" : "Copy"}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copy to clipboard</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-lg px-3 py-2 bg-muted">
                  <div className="flex space-x-1">
                    <span className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
  
        {/* Quick suggestions */}
        <div className="px-3 py-2 border-t">
          <div className="flex flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2 mb-2 h-8"
              disabled={isLoading}
              onClick={() => handleSpecificRequest("improveSummary")}
            >
              <Lightbulb className="mr-1 h-3 w-3" />
              Improve Summary
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="mr-2 mb-2 h-8"
              disabled={isLoading}
              onClick={() => handleSpecificRequest("suggestSkills")}
            >
              <Lightbulb className="mr-1 h-3 w-3" />
              Suggest Skills
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="mb-2 h-8"
              disabled={isLoading}
              onClick={() => handleSpecificRequest("improveExperience")}
            >
              <Lightbulb className="mr-1 h-3 w-3" />
              Experience Tips
            </Button>
          </div>
        </div>
  
        {/* Input area */}
        <form 
          className="p-3 border-t flex items-end"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(inputValue);
          }}
        >
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask for resume help..."
            className="resize-none min-h-[40px] max-h-[120px]"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim()) {
                  sendMessage(inputValue);
                }
              }
            }}
            rows={1}
          />
          <Button type="submit" size="icon" className="ml-2 h-10 w-10 flex-shrink-0" disabled={isLoading || !inputValue.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </>
    )}
  </div>  
  )
}