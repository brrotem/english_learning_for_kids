# Icon Generation Instructions

The extension currently uses SVG placeholder icons. For production, you should create proper PNG icons.

## Required Icon Sizes
- **icon16.png** - 16x16 pixels (toolbar, small displays)
- **icon48.png** - 48x48 pixels (extension management)
- **icon128.png** - 128x128 pixels (Chrome Web Store)

## Creating Icons

### Option 1: Using Online Tools
1. Go to https://www.canva.com or https://www.figma.com
2. Create a 128x128px design
3. Use the design:
   - Background: Purple gradient (#667eea to #764ba2)
   - Icon: Open book with letter "E"
   - Add star/sparkle decorations
   - Use rounded corners (24px radius)
4. Export as PNG at different sizes

### Option 2: Using SVG to PNG Converter
1. Open the `icon128.svg` file
2. Use an online converter like:
   - https://cloudconvert.com/svg-to-png
   - https://www.svgtopng.com/
3. Convert to PNG at 128x128, 48x48, and 16x16 sizes

### Option 3: Using Image Editor
1. Open the SVG in Inkscape or Adobe Illustrator
2. Export as PNG at each required size
3. Ensure transparent background
4. Save with appropriate filenames

## Design Guidelines
- **Colors**: Purple/blue gradient matching app theme
- **Style**: Friendly, kid-appropriate, colorful
- **Symbol**: Book, letter "E", or learning-related icon
- **Clarity**: Must be recognizable at 16x16 pixels

## Current Placeholder
The extension uses SVG icons as placeholders. Replace with PNG files before publishing to Chrome Web Store.

## Files to Create
```
assets/icons/
├── icon16.png   (16x16)
├── icon48.png   (48x48)
└── icon128.png  (128x128)
```
