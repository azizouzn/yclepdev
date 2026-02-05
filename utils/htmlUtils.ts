
export const extractBodyContent = (html: string | undefined | null): string => {
    if (!html) {
        return '';
    }

    // Use DOMParser to robustly handle full HTML documents.
    // It is safe for fragments as well; they will be parsed into a body.
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // The parser will always create a <html> and <body>. 
        // If the input was a fragment, it will be inside the body.
        // If the input was a full document, we'll get its body content.
        return doc.body.innerHTML;
    } catch (e) {
        console.error("DOM parsing failed for HTML content, returning original string.", e);
        // If parsing somehow fails, return the original string as a last resort.
        return html;
    }
};
