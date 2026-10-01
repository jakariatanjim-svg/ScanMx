# ScanMx - Personal Document Scanner

A fully browser-based document scanner with advanced image editing and OCR capabilities. No API keys, no backend, no setup required.

## Features

### 📷 Image Capture
- **Camera Capture** - Use your device camera to scan documents in real-time
- **File Upload** - Drag-and-drop or click to upload images
- **Camera Switch** - Toggle between front and back cameras on mobile

### 🖼️ Image Editing (CamScanner-like)
- **Perspective Correction** - Auto-detect document edges and warp-correct angled shots
- **Manual Corner Adjustment** - Fine-tune detected corners for perfect alignment
- **Rotation** - Rotate 90° left/right, flip horizontal/vertical
- **Brightness/Contrast/Saturation** - Full control with sliders
- **Auto-Enhance** - One-click optimization for document scans
- **Filters** - Grayscale, Black & White, Magic Color presets

### 🔤 OCR Text Extraction
- **Bangla + English** - Primary language support
- **Multiple Languages** - Hindi, Arabic, and more
- **Confidence Score** - See OCR accuracy percentage
- **Progress Indicator** - Real-time OCR progress

### 📤 Export Options
- **Download Image** - Save processed image as PNG
- **Copy Text** - Copy extracted text to clipboard
- **Download Text** - Save as .txt file
- **Scan History** - Last 10 scans saved locally

## Installation

No installation required! Just open the `index.html` file in a modern browser.

### Option 1: Direct File
```bash
# Navigate to the ScanMx directory
cd e:\ScanMx

# Open in browser
start index.html  # Windows
# or
open index.html   # macOS
# or
xdg-open index.html  # Linux
```

### Option 2: Local Server (Recommended for camera)
```bash
# Using Python 3
python -m http.server 8000

# Using Node.js (if http-server installed)
npx http-server -p 8000

# Then open
# http://localhost:8000
```

**Note:** Camera requires HTTPS in production, but works on `localhost` for development.

## Usage

### 1. Load an Image
- **File Upload**: Click the upload area or drag-and-drop an image
- **Camera**: Click "Start Camera", position your document, then click "Capture"

### 2. Edit the Image
- Use **Rotation** buttons to orient the document correctly
- Adjust **Brightness/Contrast/Saturation** sliders
- Click **Auto Enhance** for automatic optimization
- Apply **Filters** (Grayscale, B&W, Magic Color)
- Click **Perspective Correction** to fix warped/angled documents
  - Drag the corner points to adjust boundaries
  - Click "Apply Correction" to flatten the document

### 3. Extract Text
- Select **OCR Language** from dropdown (default: Bangla + English)
- Click **Extract Text (OCR)**
- Wait for OCR to complete (2-10 seconds)
- Review extracted text in the output panel
- Check **Confidence Score** for accuracy

### 4. Export
- **Download Image**: Save the processed image as PNG
- **Copy**: Copy extracted text to clipboard
- **Download .txt**: Save text as a file

### 5. History
- Previous scans appear in the History panel
- Click any entry to reload that scan
- Use "Clear All" to remove history

## Technical Details

### Technologies Used
- **Tesseract.js v5** - OCR engine (runs via WebAssembly)
- **Canvas API** - Image manipulation
- **MediaDevices API** - Camera access
- **LocalStorage** - Scan history persistence
- **Tailwind CSS** - Styling framework

### Browser Compatibility
- ✅ Chrome 80+
- ✅ Firefox 75+
- ✅ Edge 80+
- ✅ Safari 13+ (limited camera support)

### Performance
- OCR processing: 2-10 seconds (depends on image size)
- Language pack download: ~15MB per language (cached after first load)
- Works offline after initial load

## Project Structure

```
e:\ScanMx\
├── index.html          — Main application
├── css\
│   └── styles.css      — Custom styles
├── js\
│   ├── app.js          — Main application controller
│   ├── camera.js       — Camera capture module
│   ├── imageProcessor.js — Image enhancement module
│   ├── perspective.js  — Perspective correction module
│   └── ocr.js          — OCR integration module
└── README.md           — This file
```

## Limitations

### Current Version
- Single-page scanning (no multi-page documents)
- No PDF export (can be added later)
- No cloud sync
- No handwriting recognition
- Perspective correction is basic (production would use OpenCV.js)

### Camera Access
- Requires HTTPS in production
- Some browsers may restrict camera on certain devices
- Mobile browsers may have additional restrictions

## Troubleshooting

### Camera Not Working
1. Ensure you're on HTTPS or localhost
2. Check browser permissions for camera access
3. Try a different browser
4. Check if another app is using the camera

### OCR Not Working
1. Wait for language pack to download (first time only)
2. Check internet connection
3. Try a clearer image
4. Try a different language setting

### Poor OCR Results
1. Ensure good lighting when capturing
2. Hold camera steady
3. Use higher resolution images
4. Apply Auto-Enhance or Grayscale filter
5. Try B&W filter for text documents

## Future Enhancements

Potential features for future versions:
- PDF export
- Multi-page document support
- Advanced perspective correction with OpenCV.js
- Batch processing
- Handwriting recognition
- QR/Barcode scanning
- Cloud storage integration
- Custom language pack download

## License

MIT License - Free for personal and commercial use.

## Credits

- **Tesseract.js** - https://github.com/naptha/tesseract.js
- **Tailwind CSS** - https://tailwindcss.com
- **Cropper.js** - https://fengyuanchen.github.io/cropperjs

---

**Built with ❤️ for personal document scanning needs**
