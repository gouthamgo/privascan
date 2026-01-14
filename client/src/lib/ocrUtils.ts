/**
 * OCR Utility Functions
 * Image preprocessing and text cleaning for improved accuracy
 */

/**
 * Clean extracted OCR text by removing common artifacts and noise
 */
export function cleanOCRText(text: string): string {
  if (!text) return "";

  let cleaned = text;

  // Remove common OCR artifacts from spiral binding, grid lines, etc.
  cleaned = cleaned
    // Remove lines of scattered capitals
    .replace(/^[A-Z\s]{2,10}(?:\s+[A-Z]{2,4}){2,}\s*\n/gm, "")
    // Remove repeated E's with dashes
    .replace(/^[E]{2,}[\s—–-]*\n/gm, "")
    // Remove patterns like "ES ERNE RE EEE"
    .replace(/^[A-Z]{1,3}\s+[A-Z]{2,4}\s+[A-Z]{2,4}\s+[A-Z]{1,3}\s*\n/gm, "")
    // Remove lines starting with parentheses followed by noise
    .replace(/^\([^)]*\).*\n/gm, "")
    // Remove lines of mostly symbols
    .replace(/^[\\|/(){}\[\]0-9\s]+\n/gm, "")
    // Remove quoted short words like "em
    .replace(/^["']\w{1,3}\s*\n/gm, "")
    // Remove quoted short words at end of lines
    .replace(/\s+["']\w{1,3}\s*$/gm, "");

  // Remove stray list markers that appear randomly in text
  cleaned = cleaned
    // Remove standalone number/letter with parenthesis in the middle of text
    .replace(/\s+\d+\)\s+/g, " ")
    .replace(/\s+[a-zA-Z]\)\s+/g, " ")
    // Remove at start of line if followed by lowercase (likely not a real list)
    .replace(/^\d+\)\s+(?=[a-z])/gm, "")
    // Remove standalone single digits or letters surrounded by spaces
    .replace(/\s+\d\s+(?=[A-Z])/g, " ")
    // Remove pipe characters often misread from edges
    .replace(/\s*\|\s*/g, " ")
    // Remove stray brackets
    .replace(/\s*[\[\]]\s*/g, " ")
    // Remove backslashes (common OCR artifact)
    .replace(/\s*\\\s*/g, " ")
    // Remove stray single characters that are likely noise (but keep "I" and "a")
    .replace(/\s+[b-hj-zB-HJ-Z]\s+/g, " ");

  // Remove excessive whitespace and line breaks at start/end
  cleaned = cleaned.trim();

  // Normalize multiple spaces to single space
  cleaned = cleaned.replace(/  +/g, " ");

  // Normalize line breaks (remove excessive blank lines)
  cleaned = cleaned.replace(/\n\n+/g, "\n");

  // Filter out noise lines
  const lines = cleaned.split("\n");
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false;

    // Count words and analyze structure
    const words = trimmed.split(/\s+/);
    const wordCount = words.length;

    // Check for lines with many short fragments (likely noise)
    // Pattern like "(0 \ oN Nl fi fl HERI i I ll I fh li"
    const shortWordCount = words.filter(w => w.length <= 2).length;
    const shortWordRatio = shortWordCount / wordCount;

    // If more than 60% of words are 1-2 chars and there are many words, it's noise
    if (wordCount >= 4 && shortWordRatio > 0.6) {
      return false;
    }

    // Check for ligature artifact patterns (fi, fl, ff, fh, li, ll, etc.)
    const ligaturePattern = /^[\s\d()\[\]\\|\/]*(?:[fli]{2}|[A-Z]{1,2}[\s\\|]+)+[\s\d()\[\]\\|\/]*$/i;
    if (ligaturePattern.test(trimmed)) {
      return false;
    }

    // Check alphabetic ratio
    const alphaCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    const totalChars = trimmed.length;

    // Keep line if it has at least 50% alphabetic characters
    if (alphaCount / totalChars <= 0.5) {
      return false;
    }

    // Check average word length - real text usually has longer average words
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / wordCount;
    if (wordCount >= 3 && avgWordLength < 2.5) {
      return false;
    }

    return true;
  });

  cleaned = filteredLines.join("\n").trim();

  // Final cleanup - normalize spaces again after all transformations
  cleaned = cleaned.replace(/  +/g, " ");

  return cleaned;
}

/**
 * Preprocess image data for better OCR results
 * Converts image to canvas with enhanced contrast
 */
export async function preprocessImage(
  file: File
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;

        // Draw original image
        ctx.drawImage(img, 0, 0);

        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Apply contrast enhancement and grayscale conversion
        // This helps Tesseract distinguish text from background
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Convert to grayscale using luminosity method
          const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);

          // Apply contrast enhancement (stretch histogram)
          const enhanced = Math.round((gray - 128) * 1.5 + 128);
          const clamped = Math.max(0, Math.min(255, enhanced));

          // Apply threshold-like effect for better text detection
          const final = clamped > 200 ? 255 : clamped < 100 ? 0 : clamped;

          data[i] = final;
          data[i + 1] = final;
          data[i + 2] = final;
          // Keep alpha channel unchanged
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Convert canvas to blob for Tesseract processing
 */
export async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to convert canvas to blob"));
        }
      },
      "image/png",
      0.95
    );
  });
}
