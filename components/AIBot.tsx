"use client"

import { useState, useEffect, useRef } from "react"
import { Bot, Send, Lightbulb, X, Copy, CheckCheck, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { geminiService } from "@/lib/gemini-service"
import ReactMarkdown from "react-markdown"
import { Spinner } from "@/components/ui/spinner"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

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
      content: geminiService.getInitialGreeting(),
      isVisible: true,
    },
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [suggestionInProgress, setSuggestionInProgress] = useState(false)
  const [apiErrorCount, setApiErrorCount] = useState(0)
  const [inputValue, setInputValue] = useState("")
  const [copied, setCopied] = useState<string | null>(null)
  const [realTimeSuggestion, setRealTimeSuggestion] = useState<any>(null)
  const [textToAnalyze, setTextToAnalyze] = useState<string>("")
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Set user interacted state when user interacts with the component
  useEffect(() => {
    const handleUserInteraction = () => {
      geminiService.setUserInteracted(true)
    }

    // If the component is expanded, consider it as user interaction
    if (isExpanded) {
      handleUserInteraction()
    }

    return () => {
      // Cleanup if needed
    }
  }, [isExpanded])

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight
      }
    }
  }, [messages])

  // Real-time text analysis debounce
  useEffect(() => {
    const analysisTimeout = setTimeout(async () => {
      if (textToAnalyze && textToAnalyze.length > 30 && !isAnalyzing) {
        setIsAnalyzing(true)
        try {
          const result = await geminiService.analyzeTextInRealTime(textToAnalyze, activeTab, resumeData.title)
          setRealTimeSuggestion(result)
        } catch (error) {
          console.error("Error analyzing text:", error)
        } finally {
          setIsAnalyzing(false)
        }
      }
    }, 1500) // Debounce by 1.5 seconds

    return () => clearTimeout(analysisTimeout)
  }, [textToAnalyze, activeTab, resumeData.title])

  const generateContextualSuggestion = async (tab: string) => {
    try {
      setSuggestionInProgress(true)
      setIsLoading(true)

      // Mark user as interacted
      geminiService.setUserInteracted(true)

      // Internal prompt message - NOT visible to user
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: `Generate suggestions for the ${tab} section of my resume.`,
          isVisible: false,
        },
      ])

      let response = ""

      // If the API has failed more than twice, use fallback responses
      if (apiErrorCount > 2) {
        const fallbackType =
          tab === "sections" ? "summary" : tab === "skills" ? "skills" : tab === "patents" ? "experience" : "default"

        response = geminiService.getFallbackResponse(fallbackType)
      } else {
        switch (tab) {
          case "sections":
            response = await geminiService.analyzeResume({
              title: resumeData.title,
              summary: resumeData.summary || undefined,
              skills: resumeData.skills.map((skill) => skill.name),
            })
            break

          case "skills":
            response = await geminiService.suggestSkills(
              resumeData.title || "this position",
              resumeData.skills.map((skill) => skill.name),
            )
            break

          case "patents":
            // For patents, we'll use a more specific API call instead of hardcoded response
            const patentSection = resumeData.sections.find((section) => section.type.toLowerCase().includes("patent"))

            if (patentSection) {
              response = await geminiService.improveExperienceItem(patentSection.content, resumeData.title)
            } else {
              response = await geminiService.generateContent(
                "What are some best practices for presenting patents in a resume?",
                { jobTitle: resumeData.title || "" },
              )
            }
            break

          case "projects":
            // For projects section
            const projectSection = resumeData.sections.find((section) => section.type.toLowerCase().includes("project"))

            if (projectSection) {
              response = await geminiService.suggestProjectHighlights(projectSection.content, resumeData.title)
            } else {
              response = await geminiService.getFallbackResponse("projects")
            }
            break

          case "education":
            // For education section
            const educationSection = resumeData.sections.find((section) =>
              section.type.toLowerCase().includes("education"),
            )

            if (educationSection) {
              response = await geminiService.suggestEducationFormatting(educationSection.content)
            } else {
              response = await geminiService.getFallbackResponse("education")
            }
            break

          default:
            response = await geminiService.analyzeResume({
              title: resumeData.title,
              summary: resumeData.summary || undefined,
              skills: resumeData.skills.map((skill) => skill.name),
            })
        }
      }

      // Add AI response - visible to user
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          isVisible: true,
        },
      ])
    } catch (error) {
      console.error("Error generating contextual suggestion:", error)

      // Increment error count
      setApiErrorCount((prev) => prev + 1)

      // Use fallback content
      const fallbackType =
        tab === "sections" ? "summary" : tab === "skills" ? "skills" : tab === "patents" ? "experience" : "default"

      const fallbackResponse = geminiService.getFallbackResponse(fallbackType)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallbackResponse,
          isVisible: true,
        },
      ])
    } finally {
      setIsLoading(false)
      setSuggestionInProgress(false)
    }
  }

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputValue])

  // Generate contextual suggestions based on active tab
  useEffect(() => {
    if (isExpanded && !suggestionInProgress && messages.length <= 1) {
      generateContextualSuggestion(activeTab)
    }
  }, [activeTab, isExpanded, suggestionInProgress, messages.length])

  // Send message to AI
  async function sendMessage(content: string) {
    if (!content.trim()) return

    try {
      setIsLoading(true)

      // Mark user as interacted
      geminiService.setUserInteracted(true)

      // Add user message to chat - visible
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content,
          isVisible: true,
        },
      ])

      // If the API has failed more than twice, use fallback responses
      if (apiErrorCount > 2) {
        const keywords = content.toLowerCase()
        let fallbackType = "default"

        if (keywords.includes("summary") || keywords.includes("profile")) {
          fallbackType = "summary"
        } else if (keywords.includes("skill")) {
          fallbackType = "skills"
        } else if (keywords.includes("experience") || keywords.includes("work") || keywords.includes("job")) {
          fallbackType = "experience"
        } else if (keywords.includes("education") || keywords.includes("degree") || keywords.includes("school")) {
          fallbackType = "education"
        } else if (keywords.includes("project")) {
          fallbackType = "projects"
        }

        const fallbackResponse = geminiService.getFallbackResponse(fallbackType)
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: fallbackResponse,
              isVisible: true,
            },
          ])
          setIsLoading(false)
        }, 1000)
        return
      }

      // Call the Gemini API through our service
      const response = await geminiService.generateContent(content, {
        title: resumeData.title,
        summary: resumeData.summary || "",
        activeTab,
        sections: resumeData.sections.map((section) => ({
          type: section.type,
          content: section.content,
        })),
        skills: resumeData.skills.map((skill) => ({
          name: skill.name,
          proficiency: skill.proficiency,
        })),
      })

      // Add AI response - visible
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          isVisible: true,
        },
      ])
    } catch (error) {
      console.error("Error with Gemini API request:", error)

      // Increment error count
      setApiErrorCount((prev) => prev + 1)

      // Use fallback content based on user query
      const keywords = content.toLowerCase()
      let fallbackType = "default"

      if (keywords.includes("summary") || keywords.includes("profile")) {
        fallbackType = "summary"
      } else if (keywords.includes("skill")) {
        fallbackType = "skills"
      } else if (keywords.includes("experience") || keywords.includes("work") || keywords.includes("job")) {
        fallbackType = "experience"
      } else if (keywords.includes("education") || keywords.includes("degree") || keywords.includes("school")) {
        fallbackType = "education"
      } else if (keywords.includes("project")) {
        fallbackType = "projects"
      }

      const fallbackResponse = geminiService.getFallbackResponse(fallbackType)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallbackResponse,
          isVisible: true,
        },
      ])
    } finally {
      setIsLoading(false)
      setInputValue("")
    }
  }

  async function handleSpecificRequest(requestType: string) {
    setIsLoading(true)

    // Mark user as interacted
    geminiService.setUserInteracted(true)

    try {
      let response = ""
      // Add user message to chat - visible to the user
      let userMessage = ""

      switch (requestType) {
        case "improveSummary":
          userMessage = "Can you improve my professional summary?"
          break

        case "suggestSkills":
          userMessage = "Suggest skills for my resume"
          break

        case "improveExperience":
          userMessage = "How can I strengthen my experience section?"
          break

        case "generateAchievements":
          userMessage = "Generate achievement examples for my role"
          break

        case "coverLetterPoints":
          userMessage = "Help me with cover letter talking points"
          break

        default:
          userMessage = "What should I improve in my resume?"
      }

      // Add visible user message
      setMessages((prev) => [
        ...prev,
        {
          role: "user",
          content: userMessage,
          isVisible: true,
        },
      ])

      // If API has failed too many times, use fallback
      if (apiErrorCount > 2) {
        response = geminiService.getFallbackResponse(
          requestType === "improveSummary"
            ? "summary"
            : requestType === "suggestSkills"
              ? "skills"
              : requestType === "improveExperience"
                ? "experience"
                : requestType === "generateAchievements"
                  ? "experience"
                  : requestType === "coverLetterPoints"
                    ? "default"
                    : "default",
        )
      } else {
        switch (requestType) {
          case "improveSummary":
            if (resumeData.summary) {
              response = await geminiService.improveSummary(resumeData.summary, resumeData.title || "")
            } else {
              response = await geminiService.generateContent(
                "I need to create a professional summary for my resume. Can you help me with some guidance or templates?",
                { jobTitle: resumeData.title || "" },
              )
            }
            break

          case "suggestSkills":
            response = await geminiService.suggestSkills(
              resumeData.title || "this position",
              resumeData.skills.map((skill) => skill.name),
            )
            break

          case "improveExperience":
            // Find an experience section if it exists
            const experienceSection = resumeData.sections.find(
              (section) =>
                section.type.toLowerCase().includes("experience") || section.type.toLowerCase().includes("work"),
            )

            if (experienceSection) {
              response = await geminiService.improveExperienceItem(experienceSection.content, resumeData.title)
            } else {
              response = await geminiService.generateContent(
                "What are some best practices for writing compelling experience sections in resumes?",
                { jobTitle: resumeData.title || "" },
              )
            }
            break

          case "generateAchievements":
            response = await geminiService.generateAchievementIdeas(resumeData.title || "professional")
            break

          case "coverLetterPoints":
            // Get resume highlights
            const highlights =
              resumeData.summary ||
              resumeData.sections.find(
                (section) =>
                  section.type.toLowerCase().includes("experience") || section.type.toLowerCase().includes("work"),
              )?.content ||
              ""

            response = await geminiService.generateCoverLetterPoints(highlights)
            break

          default:
            response = await geminiService.analyzeResume({
              title: resumeData.title,
              summary: resumeData.summary || undefined,
              skills: resumeData.skills.map((skill) => skill.name),
            })
        }
      }

      // Add AI response - visible
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: response,
          isVisible: true,
        },
      ])
    } catch (error) {
      console.error("Error with specific request:", error)

      // Increment error count
      setApiErrorCount((prev) => prev + 1)

      // Use fallback response
      const fallbackResponse = geminiService.getFallbackResponse(
        requestType === "improveSummary"
          ? "summary"
          : requestType === "suggestSkills"
            ? "skills"
            : requestType === "improveExperience"
              ? "experience"
              : "default",
      )

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fallbackResponse,
          isVisible: true,
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Apply real-time suggestion
  const applySuggestion = (suggestion: any) => {
    if (suggestion && textToAnalyze) {
      const updatedText = textToAnalyze.replace(suggestion.originalPhrase, suggestion.suggestion)
      onSuggestionApply(updatedText)
      setRealTimeSuggestion(null)
    }
  }

  // Copy content to clipboard
  const copyToClipboard = (content: string, id: number) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(`${id}`)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  // Extract text content from HTML
  const extractTextFromHtml = (html: string): string => {
    // Create a temporary element to parse the HTML
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html

    // Get the text content
    return tempDiv.textContent || tempDiv.innerText || ""
  }

  // Handle applying suggestion to a specific field
  const handleApplySuggestion = (content: string, targetField?: string) => {
    // Check if the content is HTML (contains HTML tags)
    const isHtml = /<[a-z][\s\S]*>/i.test(content)

    // If it's already properly formatted HTML, use it directly
    if (isHtml) {
      onSuggestionApply(content, targetField)
    } else {
      // If it's plain text or markdown, convert it to proper HTML
      const formattedContent = formatTextToHtml(content)
      onSuggestionApply(formattedContent, targetField)
    }
  }

  // Format plain text or markdown to HTML
  const formatTextToHtml = (text: string): string => {
    // Replace markdown-style bullet points with HTML
    let html = text.replace(/^\s*[-*]\s+(.+)$/gm, "<li>$1</li>")

    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li>.+<\/li>\n?)+/g, "<ul>$&</ul>")

    // Replace markdown-style numbered lists with HTML
    html = html.replace(/^\s*(\d+)\.\s+(.+)$/gm, "<li>$2</li>")

    // Wrap consecutive numbered list items in ol tags
    html = html.replace(/(<li>.+<\/li>\n?)+/g, (match) => {
      // Only wrap in ol if not already wrapped in ul
      if (!match.startsWith("<ul>")) {
        return "<ol>" + match + "</ol>"
      }
      return match
    })

    // Replace markdown headings with HTML
    html = html.replace(/^#{1,6}\s+(.+)$/gm, (match, content) => {
      const level = match.trim().indexOf(" ")
      return `<h${level}>${content}</h${level}>`
    })

    // Replace markdown bold with HTML
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

    // Replace markdown italic with HTML
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>")

    // Replace double newlines with paragraph breaks
    html = html.replace(/\n\n/g, "</p><p>")

    // Wrap the entire text in paragraphs if not already wrapped
    if (!html.startsWith("<")) {
      html = `<p>${html}</p>`
    }

    return html
  }

  // Render different layouts for desktop and mobile
  if (isDesktop) {
    return (
      <div
        className={cn(
          "fixed top-16 bottom-0 right-0 z-40 flex flex-col bg-card border-l shadow-lg transition-all duration-300",
          isExpanded ? "w-96" : "w-0", // Changed from w-12 to w-0
        )}
      >
        {/* Toggle button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded-l-md shadow-md"
          aria-label={isExpanded ? "Collapse AI assistant" : "Expand AI assistant"}
        >
          {isExpanded ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
  
        {/* Header */}
        <div className={`flex items-center justify-between p-3 bg-primary text-primary-foreground ${!isExpanded && 'hidden'}`}>
          <div className="flex items-center">
            <Bot className="h-5 w-5 mr-2" />
            <h3 className="font-medium">Resume AI Assistant</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-primary-foreground/20"
            onClick={() => setIsExpanded(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
  
        {isExpanded && (
          <>
            <ScrollArea className="flex-1 p-3" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages
                  .filter((msg) => msg.isVisible !== false)
                  .map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`relative rounded-lg px-3 py-2 max-w-[90%] ${
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <div className="prose dark:prose-invert max-w-none">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                        {msg.role === "assistant" && msg.content.length > 20 && (
                          <div className="flex flex-wrap mt-2 gap-2">
                            {activeTab === "sections" && resumeData.summary && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleApplySuggestion(msg.content, "summary")}
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
                                    onClick={() => copyToClipboard(extractTextFromHtml(msg.content), i)}
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
                        <span
                          className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                          className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                          className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></span>
                      </div>
                    </div>
                  </div>
                )}
  
                {/* Real-time suggestion component */}
                {realTimeSuggestion && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <div className="text-sm">
                        <p className="font-medium">Suggestion:</p>
                        <p>
                          Replace "<span className="text-red-500">{realTimeSuggestion.originalPhrase}</span>" with "
                          <span className="text-green-500">{realTimeSuggestion.suggestion}</span>"
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{realTimeSuggestion.reason}</p>
                        <div className="flex mt-2 space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => applySuggestion(realTimeSuggestion)}
                          >
                            Apply
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => setRealTimeSuggestion(null)}
                          >
                            Dismiss
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
  
            {/* Quick suggestions */}
            <div className="px-3 py-2 border-t">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={isLoading}
                  onClick={() => handleSpecificRequest("improveSummary")}
                >
                  <Lightbulb className="mr-1 h-3 w-3" />
                  Improve Summary
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={isLoading}
                  onClick={() => handleSpecificRequest("suggestSkills")}
                >
                  <Lightbulb className="mr-1 h-3 w-3" />
                  Suggest Skills
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={isLoading}
                  onClick={() => handleSpecificRequest("generateAchievements")}
                >
                  <Lightbulb className="mr-1 h-3 w-3" />
                  Achievement Ideas
                </Button>
              </div>
            </div>
  
            {/* Input area */}
            <form
              className="p-3 border-t flex items-end"
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(inputValue)
              }}
            >
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value)
                  // Update the text to analyze for real-time suggestions when user is typing in a specific tab
                  if (
                    e.target.value.length > 30 &&
                    ["sections", "education", "experience", "projects"].includes(activeTab)
                  ) {
                    setTextToAnalyze(e.target.value)
                  }
                }}
                placeholder="Ask for resume help..."
                className="resize-none min-h-[40px] max-h-[120px]"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    if (inputValue.trim()) {
                      sendMessage(inputValue)
                    }
                  }
                }}
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                className="ml-2 h-10 w-10 flex-shrink-0"
                disabled={isLoading || !inputValue.trim()}
              >
                {isLoading ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </>
        )}
      </div>
    )
  }

  // Mobile layout
  return (
    <div
      className={`w-full mt-6 rounded-lg shadow-lg bg-card border transition-all duration-300 ${isExpanded ? "h-[30rem]" : "h-12"}`}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-3 bg-primary text-primary-foreground rounded-t-lg cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <Bot className="h-5 w-5 mr-2" />
          <h3 className="font-medium">Resume AI Assistant</h3>
        </div>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-primary-foreground/20">
          {isExpanded ? <X className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
        </Button>
      </div>

      {isExpanded && (
        <>
          <ScrollArea className="h-64 p-3" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages
                .filter((msg) => msg.isVisible !== false)
                .map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`relative rounded-lg px-3 py-2 max-w-[90%] ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="prose dark:prose-invert max-w-none">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.role === "assistant" && msg.content.length > 20 && (
                        <div className="flex flex-wrap mt-2 gap-2">
                          {activeTab === "sections" && resumeData.summary && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleApplySuggestion(msg.content, "summary")}
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
                                  onClick={() => copyToClipboard(extractTextFromHtml(msg.content), i)}
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
                      <span
                        className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      ></span>
                      <span
                        className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      ></span>
                      <span
                        className="h-2 w-2 bg-muted-foreground/70 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      ></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Real-time suggestion component */}
              {realTimeSuggestion && (
                <div className="flex justify-start">
                  <div className="rounded-lg px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <div className="text-sm">
                      <p className="font-medium">Suggestion:</p>
                      <p>
                        Replace "<span className="text-red-500">{realTimeSuggestion.originalPhrase}</span>" with "
                        <span className="text-green-500">{realTimeSuggestion.suggestion}</span>"
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{realTimeSuggestion.reason}</p>
                      <div className="flex mt-2 space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => applySuggestion(realTimeSuggestion)}
                        >
                          Apply
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => setRealTimeSuggestion(null)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick suggestions */}
          <div className="px-3 py-2 border-t">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={isLoading}
                onClick={() => handleSpecificRequest("improveSummary")}
              >
                <Lightbulb className="mr-1 h-3 w-3" />
                Improve Summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={isLoading}
                onClick={() => handleSpecificRequest("suggestSkills")}
              >
                <Lightbulb className="mr-1 h-3 w-3" />
                Suggest Skills
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                disabled={isLoading}
                onClick={() => handleSpecificRequest("generateAchievements")}
              >
                <Lightbulb className="mr-1 h-3 w-3" />
                Achievement Ideas
              </Button>
            </div>
          </div>

          {/* Input area */}
          <form
            className="p-3 border-t flex items-end"
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage(inputValue)
            }}
          >
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value)
                // Update the text to analyze for real-time suggestions when user is typing in a specific tab
                if (
                  e.target.value.length > 30 &&
                  ["sections", "education", "experience", "projects"].includes(activeTab)
                ) {
                  setTextToAnalyze(e.target.value)
                }
              }}
              placeholder="Ask for resume help..."
              className="resize-none min-h-[40px] max-h-[120px]"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  if (inputValue.trim()) {
                    sendMessage(inputValue)
                  }
                }
              }}
              rows={1}
            />
            <Button
              type="submit"
              size="icon"
              className="ml-2 h-10 w-10 flex-shrink-0"
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? <Spinner size="sm" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </>
      )}
    </div>
  )
}
