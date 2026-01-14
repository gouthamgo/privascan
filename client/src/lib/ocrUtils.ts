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
    // Remove lines starting with parentheses (binding hole artifacts)
    .replace(/^\([^)]*\)\s*\n/gm, "")
    // Remove lines of mostly symbols
    .replace(/^[\\|/(){}\[\]]+\s*\n/gm, "")
    // Remove quoted short words like "em
    .replace(/^["']\w{1,3}\s*\n/gm, "")
    // Remove quoted short words at end of lines
    .replace(/\s+["']\w{1,3}\s*$/gm, "")
    // Remove lines with excessive symbols and few letters (like "(0 \ oN Nl | fi fl HERI i I ll 1) I fh li")
    .replace(/^[^a-zA-Z]*[a-zA-Z]{1,2}[^a-zA-Z]*[a-zA-Z]{1,2}[^a-zA-Z]*[a-zA-Z]{1,2}[^a-zA-Z]*$/gm, "");

  // Remove stray list markers that appear randomly in text (like "1)", "2)", "a)", etc.)
  // These are often OCR artifacts from bullet points or numbered lists misread
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
    // Remove stray single characters that are likely noise (but keep "I" and "a")
    .replace(/\s+[b-hj-zB-HJ-Z]\s+/g, " ");

  // Remove excessive whitespace and line breaks at start/end
  cleaned = cleaned.trim();

  // Normalize multiple spaces to single space
  cleaned = cleaned.replace(/  +/g, " ");

  // Normalize line breaks (remove excessive blank lines)
  cleaned = cleaned.replace(/\n\n+/g, "\n");

  // Remove lines that are mostly non-alphabetic characters (likely noise)
  const lines = cleaned.split("\n");
  const filteredLines = lines.filter((line) => {
    const trimmed = line.trim();
    if (trimmed.length === 0) return false; // Remove empty lines

    const alphaCount = (trimmed.match(/[a-zA-Z]/g) || []).length;
    const totalChars = trimmed.length;

    // Keep line if it has at least 50% alphabetic characters
    // Slightly less aggressive to preserve more content
    return alphaCount / totalChars > 0.5;
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
