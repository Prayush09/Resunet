export default function stripHtml(html: string | undefined | null): string {
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