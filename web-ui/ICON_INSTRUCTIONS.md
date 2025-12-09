# Icon Generation Instructions

Due to image generation quota limits, please create the following app icons manually:

## Required Icons

### 1. icon-512.png (512x512px)
- **Location**: `/public/icon-512.png`
- **Design**: Lightning bolt symbol (⚡) in blue-to-purple gradient (#3b82f6 to #a855f7)
- **Background**: Dark (#0a0a0a)
- **Format**: PNG with transparency
- **Purpose**: PWA app icon (large)

### 2. icon-192.png (192x192px)
- **Location**: `/public/icon-192.png`
- **Design**: Same as icon-512.png, scaled down
- **Purpose**: PWA app icon (small)

### 3. apple-touch-icon.png (180x180px)
- **Location**: `/public/apple-touch-icon.png`
- **Design**: Same as icon-512.png, scaled to 180x180
- **Purpose**: Apple devices home screen icon

### 4. og-image.png (1200x630px)
- **Location**: `/public/og-image.png`
- **Design**: TaskJarvis branding with tagline "AI-Powered Task Manager"
- **Purpose**: Open Graph social media preview

### 5. twitter-image.png (1200x600px)
- **Location**: `/public/twitter-image.png`
- **Design**: Similar to og-image.png
- **Purpose**: Twitter Card preview

## Quick Generation Options

### Option 1: Using Figma/Canva
1. Create a 512x512 canvas with dark background
2. Add a centered lightning bolt icon
3. Apply blue-to-purple gradient
4. Export as PNG
5. Use online tools to resize for other dimensions

### Option 2: Using AI Tools
Use DALL-E, Midjourney, or similar with this prompt:
"Modern minimalist app icon, lightning bolt symbol, blue to purple gradient (#3b82f6 to #a855f7), dark background (#0a0a0a), flat design, 512x512, professional"

### Option 3: Use Placeholder
For now, you can use the existing favicon.ico and we'll replace with proper icons later.

## After Creating Icons

1. Place all icons in the `/public` directory
2. The manifest.json and layout.tsx are already configured to use them
3. Test PWA installation in Chrome DevTools
