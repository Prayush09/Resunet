"use client"

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import TextAlign from "@tiptap/extension-text-align"
import Highlight from "@tiptap/extension-highlight"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import TextStyle from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import { Extension } from "@tiptap/core"
import { lowlight } from "lowlight"
import {
  Bold,
  Italic,
  UnderlineIcon,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  LinkIcon,
  Highlighter,
  ImageIcon,
  Code,
  TextQuote,
  Undo,
  Redo,
  PaintBucket,
  Type,
  Check,
} from "lucide-react"
import { Toggle } from "@/components/ui/toggle"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCallback, useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
  readOnly?: boolean
  sectionType?: string
}

const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return {
      types: ["textStyle"],
    }
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) => {
              if (!attributes.fontSize) {
                return {}
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },
  addCommands() {
    return {
      setFontSize:
        (fontSize: string) =>
        ({ chain }: any) => {
          return chain().setMark("textStyle", { fontSize }).run()
        },
    } as any // Type assertion to bypass TypeScript's complaints
  },
})

// List of colors for the color picker
const colors = [
  "#000000",
  "#343a40",
  "#495057",
  "#6c757d",
  "#adb5bd",
  "#ced4da",
  "#dee2e6",
  "#e9ecef",
  "#f8f9fa",
  "#ffffff",
  "#e03131",
  "#c2255c",
  "#9c36b5",
  "#6741d9",
  "#3b5bdb",
  "#1971c2",
  "#0c8599",
  "#099268",
  "#2b8a3e",
  "#5c940d",
  "#e8590c",
  "#f08c00",
  "#e67700",
  "#cc5de8",
  "#339af0",
  "#66d9e8",
  "#63e6be",
  "#8ce99a",
  "#d8f5a2",
  "#ffec99",
]

const FONT_SIZES = [
  { label: "Tiny", value: "0.75em" },
  { label: "Small", value: "0.875em" },
  { label: "Normal", value: "1em" },
  { label: "Large", value: "1.25em" },
  { label: "X-Large", value: "1.5em" },
  { label: "XX-Large", value: "1.75em" },
  { label: "Huge", value: "2em" },
]

export function RichTextEditor({
  content,
  onChange,
  placeholder = "Start typing...",
  className = "",
  readOnly = false,
  sectionType = "general",
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState<string>("")
  const [imageUrl, setImageUrl] = useState<string>("")
  const [isLinkOpen, setIsLinkOpen] = useState<boolean>(false)
  const [isImageOpen, setIsImageOpen] = useState<boolean>(false)
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false)
  const [isFontSizePickerOpen, setIsFontSizePickerOpen] = useState<boolean>(false)
  const [currentContent, setCurrentContent] = useState<string>(content)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const [showPlaceholder, setShowPlaceholder] = useState<boolean>(content === "" || !content)

  // Helper function to sanitize HTML content
  const sanitizeHtml = useCallback((html: string): string => {
    // Create a temporary div to parse the HTML
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = html

    // Return the sanitized HTML
    return tempDiv.innerHTML
  }, [])

  // Use memoized callbacks to improve performance
  const handleContentChange = useCallback(
    (html: string) => {
      onChange(html)
      setCurrentContent(html)
      setShowPlaceholder(html === "" || html === "<p></p>")
    },
    [onChange],
  )

  // Update the editor configuration to include the content state update
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Link.configure({
        openOnClick: false,
        linkOnPaste: true,
        validate: href => /^https?:\/\//.test(href) || /^mailto:/.test(href), // Only allows http/https/mailto links
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      TextStyle,
      Color,
      FontSize, // Add our custom FontSize extension
    ],
    content: content,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4",
          "prose-p:leading-relaxed prose-headings:leading-tight prose-li:leading-relaxed prose-li:my-0",
          "prose-p:my-1 prose-headings:mt-3 prose-headings:mb-1",
          readOnly ? "cursor-default" : "",
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      handleContentChange(html)
    },
    editable: !readOnly,
  })

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
      setShowPlaceholder(content === "" || content === "<p></p>")
    }
  }, [editor, content])

  // Check if editor is empty on mount
  useEffect(() => {
    if (editor) {
      setShowPlaceholder(editor.isEmpty)
    }
  }, [editor])

  // Basic formatting - memoized callbacks
  const toggleBold = useCallback(() => {
    editor?.chain().focus().toggleBold().run()
  }, [editor])

  const toggleItalic = useCallback(() => {
    editor?.chain().focus().toggleItalic().run()
  }, [editor])

  const toggleUnderline = useCallback(() => {
    editor?.chain().focus().toggleUnderline().run()
  }, [editor])

  // Lists
  const toggleBulletList = useCallback(() => {
    editor?.chain().focus().toggleBulletList().run()
  }, [editor])

  const toggleOrderedList = useCallback(() => {
    editor?.chain().focus().toggleOrderedList().run()
  }, [editor])

  // Headings
  const toggleHeading = useCallback(
    (level: 1 | 2 | 3) => {
      editor?.chain().focus().toggleHeading({ level }).run()
    },
    [editor],
  )

  // Undo/Redo
  const handleUndo = useCallback(() => {
    editor?.chain().focus().undo().run()
  }, [editor])

  const handleRedo = useCallback(() => {
    editor?.chain().focus().redo().run()
  }, [editor])

  // Alignment
  const setTextAlign = useCallback(
    (align: "left" | "center" | "right" | "justify") => {
      editor?.chain().focus().setTextAlign(align).run()
    },
    [editor],
  )

  // Quotes and code blocks
  const toggleBlockquote = useCallback(() => {
    editor?.chain().focus().toggleBlockquote().run()
  }, [editor])

  const toggleCodeBlock = useCallback(() => {
    editor?.chain().focus().toggleCodeBlock().run()
  }, [editor])

  // Link handling
  const setLink = useCallback(() => {
    if (!linkUrl.trim()) {
      editor?.chain().focus().unsetLink().run()
      setIsLinkOpen(false)
      return
    }

    // Add https if not present and not already having a protocol
    const url = linkUrl.trim();
    let httpUrl = url;
    if (!url.match(/^(https?:\/\/|mailto:)/)) {
      httpUrl = `https://${url}`;
    }

    editor?.chain().focus().extendMarkRange("link").setLink({ href: httpUrl }).run()
    setLinkUrl("")
    setIsLinkOpen(false)
  }, [editor, linkUrl])

  // Image handling
  const addImage = useCallback(() => {
    if (!imageUrl.trim()) return;

    editor?.chain().focus().setImage({ src: imageUrl.trim() }).run()
    setImageUrl("")
    setIsImageOpen(false)
  }, [editor, imageUrl])

  // Highlight text
  const toggleHighlight = useCallback(() => {
    editor?.chain().focus().toggleHighlight().run()
  }, [editor])

  // Set text color
  const setTextColor = useCallback(
    (color: string) => {
      editor?.chain().focus().setColor(color).run()
      setIsColorPickerOpen(false)
    },
    [editor],
  )

  // Set font size
  const setFontSize = useCallback(
    (size: string) => {
      //@ts-ignore
      editor?.commands.setFontSize(size)
      setIsFontSizePickerOpen(false)
    },
    [editor],
  )

  // Initialize linkUrl when a link is selected
  useEffect(() => {
    if (editor?.isActive('link')) {
      const attrs = editor.getAttributes('link');
      if (attrs.href) {
        setLinkUrl(attrs.href);
      }
    } else {
      setLinkUrl('');
    }
  }, [editor?.isActive('link')]);

  if (!editor) {
    return null
  }

  return (
    <div className={cn("border rounded-md overflow-hidden relative", className)} ref={editorContainerRef}>
      {!readOnly && (
        <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-muted/40">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleUndo}
              disabled={!editor.can().undo()}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleRedo}
              disabled={!editor.can().redo()}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border mx-1" />

          <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={toggleBold} aria-label="Toggle bold">
            <Bold className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("italic")}
            onPressedChange={toggleItalic}
            aria-label="Toggle italic"
          >
            <Italic className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("underline")}
            onPressedChange={toggleUnderline}
            aria-label="Toggle underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </Toggle>

          <div className="w-px h-6 bg-border mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive("bulletList")}
            onPressedChange={toggleBulletList}
            aria-label="Toggle bullet list"
          >
            <List className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("orderedList")}
            onPressedChange={toggleOrderedList}
            aria-label="Toggle ordered list"
          >
            <ListOrdered className="h-4 w-4" />
          </Toggle>

          <div className="w-px h-6 bg-border mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 1 })}
            onPressedChange={() => toggleHeading(1)}
            aria-label="Toggle heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 2 })}
            onPressedChange={() => toggleHeading(2)}
            aria-label="Toggle heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("heading", { level: 3 })}
            onPressedChange={() => toggleHeading(3)}
            aria-label="Toggle heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </Toggle>

          <div className="w-px h-6 bg-border mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "left" })}
            onPressedChange={() => setTextAlign("left")}
            aria-label="Align left"
          >
            <AlignLeft className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "center" })}
            onPressedChange={() => setTextAlign("center")}
            aria-label="Align center"
          >
            <AlignCenter className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "right" })}
            onPressedChange={() => setTextAlign("right")}
            aria-label="Align right"
          >
            <AlignRight className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: "justify" })}
            onPressedChange={() => setTextAlign("justify")}
            aria-label="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Toggle>

          <div className="w-px h-6 bg-border mx-1" />

          <Toggle
            size="sm"
            pressed={editor.isActive("blockquote")}
            onPressedChange={toggleBlockquote}
            aria-label="Toggle blockquote"
          >
            <TextQuote className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("codeBlock")}
            onPressedChange={toggleCodeBlock}
            aria-label="Toggle code block"
          >
            <Code className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive("highlight")}
            onPressedChange={toggleHighlight}
            aria-label="Toggle highlight"
          >
            <Highlighter className="h-4 w-4" />
          </Toggle>

          <Popover open={isLinkOpen} onOpenChange={setIsLinkOpen}>
            <PopoverTrigger asChild>
              <Toggle
                size="sm"
                pressed={editor.isActive("link")}
                onPressedChange={() => {
                  if (editor.isActive("link")) {
                    // If link is active, populate field with current URL
                    const attrs = editor.getAttributes("link");
                    if (attrs.href) {
                      setLinkUrl(attrs.href);
                    }
                  }
                  setIsLinkOpen(true);
                }}
                aria-label="Add link"
              >
                <LinkIcon className="h-4 w-4" />
              </Toggle>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="flex flex-col space-y-2">
                <Input
                  type="url"
                  placeholder="Enter URL"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      setLink()
                    }
                  }}
                  autoFocus
                />
                <div className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      if (editor.isActive("link")) {
                        editor.chain().focus().unsetLink().run();
                      }
                      setIsLinkOpen(false);
                    }}
                  >
                    {editor.isActive("link") ? "Remove Link" : "Cancel"}
                  </Button>
                  <Button size="sm" onClick={setLink}>
                    {editor.isActive("link") ? "Update Link" : "Add Link"}
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Popover open={isImageOpen} onOpenChange={setIsImageOpen}>
            <PopoverTrigger asChild>
              <Toggle size="sm" onPressedChange={() => setIsImageOpen(true)} aria-label="Add image">
                <ImageIcon className="h-4 w-4" />
              </Toggle>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <div className="flex flex-col space-y-2">
                <Input
                  type="url"
                  placeholder="Enter image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addImage()
                    }
                  }}
                  autoFocus
                />
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={() => setIsImageOpen(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={addImage}>
                    Add Image
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <div className="w-px h-6 bg-border mx-1" />

          <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
            <PopoverTrigger asChild>
              <Toggle size="sm" onPressedChange={() => setIsColorPickerOpen(true)} aria-label="Text color">
                <PaintBucket className="h-4 w-4" />
              </Toggle>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2">
              <Tabs defaultValue="colors">
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="colors">Colors</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
                <TabsContent value="colors" className="mt-2">
                  <div className="grid grid-cols-5 gap-1">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-md border border-muted flex items-center justify-center hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => setTextColor(color)}
                        aria-label={`Set text color to ${color}`}
                      >
                        {editor.isActive("textStyle", { color }) && (
                          <Check
                            className="h-4 w-4"
                            color={color === "#ffffff" || color === "#f8f9fa" ? "#000000" : "#ffffff"}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </TabsContent>
                <TabsContent value="custom" className="mt-2">
                  <div className="flex flex-col space-y-2">
                    <Input type="color" className="h-8" onChange={(e) => setTextColor(e.target.value)} />
                  </div>
                </TabsContent>
              </Tabs>
            </PopoverContent>
          </Popover>

          <Popover open={isFontSizePickerOpen} onOpenChange={setIsFontSizePickerOpen}>
            <PopoverTrigger asChild>
              <Toggle size="sm" onPressedChange={() => setIsFontSizePickerOpen(true)} aria-label="Font size">
                <Type className="h-4 w-4" />
              </Toggle>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="flex flex-col space-y-1">
                {FONT_SIZES.map((size) => (
                  <Button
                    key={size.value}
                    variant="ghost"
                    className="justify-start font-normal"
                    onClick={() => setFontSize(size.value)}
                  >
                    <span style={{ fontSize: size.value }}>{size.label}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}

      {!readOnly && editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center flex-wrap bg-background border rounded-md shadow-md overflow-hidden p-1">
            <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={toggleBold} aria-label="Toggle bold">
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("italic")}
              onPressedChange={toggleItalic}
              aria-label="Toggle italic"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("underline")}
              onPressedChange={toggleUnderline}
              aria-label="Toggle underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Toggle>
          </div>
        </BubbleMenu>
      )}

      {!readOnly && editor && (
        <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center bg-background border rounded-md shadow-md overflow-hidden">
            <Toggle
              size="sm"
              pressed={editor.isActive("heading", { level: 1 })}
              onPressedChange={() => toggleHeading(1)}
              aria-label="Toggle heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("heading", { level: 2 })}
              onPressedChange={() => toggleHeading(2)}
              aria-label="Toggle heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("bulletList")}
              onPressedChange={toggleBulletList}
              aria-label="Toggle bullet list"
            >
              <List className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("orderedList")}
              onPressedChange={toggleOrderedList}
              aria-label="Toggle ordered list"
            >
              <ListOrdered className="h-4 w-4" />
            </Toggle>
          </div>
        </FloatingMenu>
      )}

      <div className="relative">
        <EditorContent editor={editor} className={cn("min-h-[200px]", readOnly ? "cursor-default" : "")} />

        {showPlaceholder && !readOnly && (
          <div className="absolute top-[20px] left-[20px] text-muted-foreground pointer-events-none">{placeholder}</div>
        )}
      </div>

      <style>{`
        /* Improve vertical spacing */
        .ProseMirror p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          line-height: 1.15;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          margin-top: 0.8em;
          margin-bottom: 0.3em;
          line-height: 1.15;
        }
        .ProseMirror ul, .ProseMirror ol {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror li {
          margin-top: 0.125em;
          margin-bottom: 0.125em;
        }
        .ProseMirror blockquote {
          margin-top: 0.75em;
          margin-bottom: 0.75em;
          line-height: 1.15;
        }
      `}</style>
      {!readOnly && editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center flex-wrap bg-background border rounded-md shadow-md overflow-hidden p-1">
            <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={toggleBold} aria-label="Toggle bold">
              <Bold className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("italic")}
              onPressedChange={toggleItalic}
              aria-label="Toggle italic"
            >
              <Italic className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("underline")}
              onPressedChange={toggleUnderline}
              aria-label="Toggle underline"
            >
              <UnderlineIcon className="h-4 w-4" />
            </Toggle>

            <div className="w-px h-6 bg-border mx-1" />

            <Toggle
              size="sm"
              pressed={editor.isActive("highlight")}
              onPressedChange={toggleHighlight}
              aria-label="Toggle highlight"
            >
              <Highlighter className="h-4 w-4" />
            </Toggle>

            <Popover>
              <PopoverTrigger asChild>
                <Toggle
                  size="sm"
                  pressed={editor.isActive("link")}
                  onPressedChange={() => {
                    if (editor.isActive("link")) {
                      const attrs = editor.getAttributes("link");
                      if (attrs.href) {
                        setLinkUrl(attrs.href);
                      }
                    } else {
                      setLinkUrl("");
                    }
                    setIsLinkOpen(true);
                  }}
                  aria-label="Add link"
                >
                  <LinkIcon className="h-4 w-4" />
                </Toggle>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-2">
                <div className="flex flex-col space-y-2">
                  <Input
                    type="url"
                    placeholder="Enter URL"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        setLink()
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        if (editor.isActive("link")) {
                          editor.chain().focus().unsetLink().run();
                        }
                        setIsLinkOpen(false);
                      }}
                    >
                      {editor.isActive("link") ? "Remove Link" : "Cancel"}
                    </Button>
                    <Button size="sm" onClick={setLink}>
                      {editor.isActive("link") ? "Update Link" : "Add Link"}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </BubbleMenu>
      )}

      {!readOnly && editor && (
        <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center bg-background border rounded-md shadow-md overflow-hidden">
            <Toggle
              size="sm"
              pressed={editor.isActive("heading", { level: 1 })}
              onPressedChange={() => toggleHeading(1)}
              aria-label="Toggle heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("heading", { level: 2 })}
              onPressedChange={() => toggleHeading(2)}
              aria-label="Toggle heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("bulletList")}
              onPressedChange={toggleBulletList}
              aria-label="Toggle bullet list"
            >
              <List className="h-4 w-4" />
            </Toggle>
            <Toggle
              size="sm"
              pressed={editor.isActive("orderedList")}
              onPressedChange={toggleOrderedList}
              aria-label="Toggle ordered list"
            >
              <ListOrdered className="h-4 w-4" />
            </Toggle>
          </div>
        </FloatingMenu>
      )}

      <div className="relative">
        <EditorContent editor={editor} className={cn("min-h-[200px]", readOnly ? "cursor-default" : "")} />

        {showPlaceholder && !readOnly && (
          <div className="absolute top-[20px] left-[20px] text-muted-foreground pointer-events-none">{placeholder}</div>
        )}
      </div>

      <style>{`
        /* Improve vertical spacing */
        .ProseMirror p {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
          line-height: 1.15;
        }
        .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 {
          margin-top: 0.8em;
          margin-bottom: 0.3em;
          line-height: 1.15;
        }
        .ProseMirror ul, .ProseMirror ol {
          margin-top: 0.5em;
          margin-bottom: 0.5em;
        }
        .ProseMirror li {
          margin-top: 0.125em;
          margin-bottom: 0.125em;
        }
        .ProseMirror blockquote {
          margin-top: 0.75em;
          margin-bottom: 0.75em;
          line-height: 1.15;
        }
      `}</style>
    </div>
  )
}