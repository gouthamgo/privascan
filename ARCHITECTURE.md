# PrivaScan Architecture Documentation

## Overview

**PrivaScan** is a privacy-first Optical Character Recognition (OCR) web application that extracts text from images entirely in the browser. No data is ever uploaded to any server, ensuring complete user privacy.

---

## What It Does

### Core Functionality

1. **Image Upload** - Users upload images via drag-and-drop or file picker
2. **Image Preprocessing** - Enhances image quality for better OCR accuracy
3. **Text Extraction** - Uses Tesseract.js to perform OCR in the browser
4. **Text Cleanup** - Removes artifacts, noise, and stray characters from extracted text
5. **Result Export** - Copy to clipboard or download as .txt file

### Privacy Guarantee

- All processing happens client-side in the browser
- Images never leave the user's device
- No external API calls for OCR functionality
- No logging or tracking of user data

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         BROWSER                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    React Application                       │  │
│  │  ┌─────────────┐  ┌──────────────┐  ┌─────────────────┐  │  │
│  │  │ FileUploader│→ │ OCRProcessor │→ │  ResultViewer   │  │  │
│  │  └─────────────┘  └──────────────┘  └─────────────────┘  │  │
│  │         │                │                    │           │  │
│  │         ▼                ▼                    ▼           │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │                   Tesseract.js                       │ │  │
│  │  │              (WebAssembly OCR Engine)                │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express Server                              │
│              (Static File Serving + Security Headers)            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
privascan/
├── client/                     # Frontend React Application
│   ├── src/
│   │   ├── main.tsx           # React DOM entry point
│   │   ├── App.tsx            # Root component with routing
│   │   ├── index.css          # Tailwind CSS + Design System
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.tsx       # Main application page
│   │   │   └── NotFound.tsx   # 404 page
│   │   │
│   │   ├── components/
│   │   │   ├── FileUploader.tsx    # Image upload UI
│   │   │   ├── OCRProcessor.tsx    # OCR orchestration
│   │   │   ├── ResultViewer.tsx    # Results display
│   │   │   ├── ErrorBoundary.tsx   # Error handling (production-safe)
│   │   │   └── ui/                 # Radix UI components
│   │   │
│   │   ├── lib/
│   │   │   ├── ocrUtils.ts    # Image preprocessing & text cleanup
│   │   │   └── utils.ts       # General utilities
│   │   │
│   │   ├── contexts/
│   │   │   └── ThemeProvider.tsx   # Dark/light theme
│   │   │
│   │   ├── hooks/
│   │   │   ├── useComposition.ts
│   │   │   ├── useMobile.tsx
│   │   │   └── usePersistFn.ts
│   │   │
│   │   └── const.ts           # OAuth utilities with secure state
│   │
│   └── public/                # Static assets
│
├── server/
│   └── index.ts               # Express server with security headers
│
├── shared/
│   └── const.ts               # Shared constants
│
├── package.json
├── vite.config.ts             # Vite build configuration
├── tsconfig.json              # TypeScript configuration
└── components.json            # Shadcn/ui configuration
```

---

## Data Flow

```
┌──────────────┐
│  User drops  │
│    image     │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────────────────────────────────┐
│                      FileUploader.tsx                         │
│  - Accepts drag-and-drop or file picker input                │
│  - Validates file type (PNG, JPG, GIF, BMP, WebP)            │
│  - Animated border feedback on drag                          │
│  - Passes file to OCRProcessor                               │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                      OCRProcessor.tsx                         │
│                                                               │
│  Step 1: preprocessImage()                                   │
│  ├── Convert to grayscale (luminosity method)               │
│  ├── Apply contrast enhancement (1.5x)                       │
│  └── Apply threshold for text clarity                        │
│                                                               │
│  Step 2: Initialize Tesseract Worker                         │
│  ├── Load WebAssembly core                                   │
│  └── Configure language (English)                            │
│                                                               │
│  Step 3: worker.recognize()                                  │
│  ├── Process preprocessed image                              │
│  └── Extract raw text                                        │
│                                                               │
│  Step 4: cleanOCRText()                                      │
│  ├── Remove scattered capital letters                        │
│  ├── Remove stray list markers (1), 2), etc.)               │
│  ├── Remove pipe characters and brackets                     │
│  ├── Filter low-quality lines (<50% alphabetic)             │
│  └── Normalize whitespace                                    │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                      ResultViewer.tsx                         │
│  - Display extracted text in elegant card UI                 │
│  - Show character and word counts                            │
│  - Copy to clipboard with feedback                           │
│  - Download as privascan-{timestamp}.txt                     │
│  - Start new scan button                                     │
└──────────────────────────────────────────────────────────────┘
```

---

## Component Architecture

### Core Components

| Component | File | Responsibility |
|-----------|------|----------------|
| App | `App.tsx` | Root component, routing, theme provider |
| Home | `pages/Home.tsx` | Main page layout, orchestrates flow |
| FileUploader | `components/FileUploader.tsx` | Image upload with animated drag-drop |
| OCRProcessor | `components/OCRProcessor.tsx` | OCR execution with step indicators |
| ResultViewer | `components/ResultViewer.tsx` | Display and export results |
| ErrorBoundary | `components/ErrorBoundary.tsx` | Graceful error handling (hides stack in prod) |

### UI Component Library

The app uses **Radix UI** primitives wrapped with **Tailwind CSS** styling (Shadcn/ui pattern):

- Button, Card, Dialog, Dropdown Menu
- Form, Input, Label, Popover
- Progress, Scroll Area, Select
- Toast (Sonner), Tooltip

---

## Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.1 | UI framework |
| Vite | 7.1.7 | Build tool & dev server |
| TypeScript | 5.6.3 | Type safety |
| Tailwind CSS | 4.1.14 | Utility-first styling |
| Tesseract.js | 7.0.0 | OCR engine (WebAssembly) |
| Radix UI | Latest | Accessible UI primitives |
| Wouter | 3.3.5 | Lightweight routing |
| Framer Motion | 12.23.22 | Animations |
| React Hook Form | 7.64.0 | Form handling |
| Sonner | 2.0.7 | Toast notifications |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Express | 4.21.2 | Static file server + security headers |
| Node.js | 20+ | Runtime |

### Build Tools

| Technology | Purpose |
|------------|---------|
| ESBuild | Fast bundling |
| PostCSS | CSS processing |
| Prettier | Code formatting |

---

## OCR Pipeline Details

### 1. Image Preprocessing (`lib/ocrUtils.ts`)

```typescript
preprocessImage(file: File): Promise<HTMLCanvasElement>
```

- Loads image onto HTML Canvas
- Converts to grayscale using luminosity formula (0.299R + 0.587G + 0.114B)
- Applies contrast enhancement (factor: 1.5)
- Applies threshold effect for better text detection
- Returns canvas element for Tesseract processing

### 2. Text Extraction

Uses Tesseract.js worker with:
- Language: English (`eng`)
- WebAssembly execution for near-native performance
- Progress callbacks for UI updates (Prepare → Load → Scan → Clean)

### 3. Text Cleanup (`lib/ocrUtils.ts`)

```typescript
cleanOCRText(text: string): string
```

Removes common OCR artifacts:
- Scattered capital letters (binding hole shadows)
- Repeated characters like "EEEE" or "----" (grid lines)
- Stray list markers (1), 2), a), etc.) appearing mid-text
- Pipe characters and brackets (edge artifacts)
- Single stray letters (except "I" and "a")
- Lines with less than 50% alphabetic content
- Excessive whitespace and empty lines

---

## Design System

### Luminous Paper Aesthetic

A warm, elegant design that feels trustworthy and professional:

- **Typography**:
  - Display: Instrument Serif (elegant headings)
  - Body: DM Sans (clean, readable)
  - Mono: JetBrains Mono (code/results)

- **Colors (Light Theme)**:
  - Background: Warm cream (`oklch(0.985 0.005 80)`)
  - Primary: Deep teal (`oklch(0.45 0.12 175)`)
  - Accent: Warm amber (`oklch(0.60 0.14 35)`)
  - Cards: Paper white with subtle shadows

- **Colors (Dark Theme)**:
  - Background: Deep ink (`oklch(0.14 0.015 260)`)
  - Primary: Bright teal (`oklch(0.70 0.14 175)`)
  - Accent: Warm gold (`oklch(0.70 0.16 40)`)

- **Effects**:
  - Paper card shadows with layered depth
  - Animated gradient borders on focus
  - Shimmer effect on progress bars
  - Staggered fade-up animations on load

### Theme Support

- Light theme (default)
- Dark theme available
- System preference detection
- Persistent preference storage in localStorage

---

## Security Implementation

### 1. OAuth State Security (`client/src/const.ts`)

```typescript
// Uses crypto.getRandomValues() for CSRF-resistant state
const generateSecureState = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
};
```

- Cryptographically secure random state generation
- State stored in sessionStorage for validation
- Prevents OAuth CSRF attacks

### 2. Error Handling (`client/src/components/ErrorBoundary.tsx`)

- Stack traces hidden in production (`import.meta.env.DEV` check)
- User-friendly error messages
- Detailed errors only in development mode

### 3. Security Headers (`server/index.ts`)

The Express server implements comprehensive security headers:

| Header | Value | Purpose |
|--------|-------|---------|
| X-Frame-Options | DENY | Prevents clickjacking |
| X-Content-Type-Options | nosniff | Prevents MIME sniffing |
| X-XSS-Protection | 1; mode=block | XSS filter for older browsers |
| Referrer-Policy | strict-origin-when-cross-origin | Controls referrer info |
| Permissions-Policy | camera=(), microphone=()... | Restricts browser features |
| Content-Security-Policy | Comprehensive rules | Restricts resource loading |
| Strict-Transport-Security | max-age=31536000 (prod) | Forces HTTPS |

### 4. Additional Security Measures

- `X-Powered-By` header disabled
- Static file caching with ETags
- No sensitive data in client-side storage
- All OCR processing is local (no data exfiltration possible)

---

## Build & Deployment

### Development

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev server (port 3000)
pnpm check            # Run TypeScript type checking
```

### Production

```bash
pnpm build            # Build client + server
pnpm start            # Run production server
```

### Build Output

```
dist/
├── public/          # Static assets + React bundle
│   ├── index.html
│   └── assets/      # JS, CSS bundles
└── index.js         # Express server bundle
```

### Bundle Size

- **HTML**: ~368 KB
- **CSS**: ~119 KB (gzip: ~19 KB)
- **JS**: ~416 KB (gzip: ~129 KB)

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_OAUTH_PORTAL_URL` | OAuth provider URL |
| `VITE_APP_ID` | Application ID for OAuth |
| `VITE_ANALYTICS_ENDPOINT` | Analytics service URL (optional) |
| `VITE_ANALYTICS_WEBSITE_ID` | Analytics website ID (optional) |
| `PORT` | Server port (default: 3000) |
| `NODE_ENV` | Environment (development/production) |

---

## Future Considerations

Potential enhancements (not currently implemented):

- Multi-language OCR support
- Batch image processing
- PDF document support
- Handwriting recognition mode
- Mobile camera integration
- PWA offline support
- Image rotation/crop before OCR
