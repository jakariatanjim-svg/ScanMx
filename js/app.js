/* Main Application Controller */

class ScanApp {
    constructor() {
        this.imageProcessor = new ImageProcessor();
        this.cameraManager = new CameraManager();
        this.perspectiveCorrector = new PerspectiveCorrector();
        this.ocrManager = new OCRManager();
        
        this.currentImage = null;
        this.currentImageDataURL = null;
        this.scanHistory = [];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.loadHistory();
        this.setupUIElements();
    }

    setupUIElements() {
        // Create camera preview element
        const videoContainer = document.createElement('div');
        videoContainer.className = 'camera-preview';
        videoContainer.id = 'camera-preview';
        
        const video = document.createElement('video');
        video.autoplay = true;
        video.playsInline = true;
        
        videoContainer.appendChild(video);
        document.querySelector('.camera-section')?.appendChild(videoContainer);
    }

    setupEventListeners() {
        // File upload
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Drag and drop
        const fileDropZone = document.getElementById('file-drop-zone');
        if (fileDropZone) {
            fileDropZone.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileDropZone.style.borderColor = '#2563eb';
            });
            
            fileDropZone.addEventListener('dragleave', () => {
                fileDropZone.style.borderColor = '#e2e8f0';
            });
            
            fileDropZone.addEventListener('drop', (e) => {
                e.preventDefault();
                fileDropZone.style.borderColor = '#e2e8f0';
                this.handleDrop(e);
            });
        }

        // Camera controls
        document.getElementById('start-camera')?.addEventListener('click', () => this.startCamera());
        document.getElementById('stop-camera')?.addEventListener('click', () => this.stopCamera());
        document.getElementById('switch-camera')?.addEventListener('click', () => this.switchCamera());
        document.getElementById('capture-photo')?.addEventListener('click', () => this.capturePhoto());

        // Image processing controls
        document.getElementById('auto-enhance')?.addEventListener('click', () => this.autoEnhance());
        document.getElementById('rotate-left')?.addEventListener('click', () => this.rotate(-90));
        document.getElementById('rotate-right')?.addEventListener('click', () => this.rotate(90));
        document.getElementById('flip-h')?.addEventListener('click', () => this.flip('horizontal'));
        document.getElementById('flip-v')?.addEventListener('click', () => this.flip('vertical'));
        document.getElementById('detect-edges')?.addEventListener('click', () => this.detectAndCorrectPerspective());

        // Filter buttons
        this.setupFilterButton('filter-none', 'none');
        this.setupFilterButton('filter-grayscale', 'grayscale');
        this.setupFilterButton('filter-bw', 'bw');
        this.setupFilterButton('filter-magic', 'magic');

        // Sliders
        this.setupSlider('brightness', 'brightness');
        this.setupSlider('contrast', 'contrast');
        this.setupSlider('saturation', 'saturation');

        // OCR controls
        document.getElementById('extract-text')?.addEventListener('click', () => this.extractText());
        document.getElementById('copy-text')?.addEventListener('click', () => this.copyText());
        document.getElementById('download-text')?.addEventListener('click', () => this.downloadText());
        document.getElementById('download-image')?.addEventListener('click', () => this.downloadImage());

        // History
        document.getElementById('clear-history')?.addEventListener('click', () => this.clearHistory());
    }

    setupFilterButton(elementId, filter) {
        document.getElementById(elementId)?.addEventListener('click', () => {
            this.applyFilter(filter);
            this.updateSliderValues(100, 100, 100); // Reset sliders
        });
    }

    setupSlider(elementId, setting) {
        document.getElementById(elementId)?.addEventListener('input', (e) => {
            const value = parseInt(e.target.value);
            this.applySettings({ [setting]: value });
        });
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        } else {
            alert('Please select a valid image file');
        }
    }

    handleDrop(e) {
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        } else {
            alert('Please drop a valid image file');
        }
    }

    async loadImage(source) {
        try {
            // Reset state
            this.currentImageDataURL = null;
            
            // Load image into processor
            await this.imageProcessor.loadImage(source);
            
            // Apply initial settings
            const canvas = this.imageProcessor.applySettings({
                brightness: 100,
                contrast: 100,
                saturation: 100,
                filter: 'none'
            });
            
            this.currentImageDataURL = canvas.toDataURL();
            
            // Update preview
            this.updatePreview(this.currentImageDataURL);
            
            // Show output panel
            document.getElementById('detect-edges').disabled = false;
            
            // Save to current image for history
            this.currentImage = {
                dataURL: this.currentImageDataURL,
                timestamp: new Date(),
                text: '',
                settings: { brightness: 100, contrast: 100, saturation: 100 }
            };
            
        } catch (error) {
            console.error('Error loading image:', error);
            alert('Error loading image: ' + error.message);
        }
    }

    async startCamera() {
        try {
            document.getElementById('start-camera').disabled = true;
            
            await this.cameraManager.init('camera-preview');
            await this.cameraManager.startCamera();
            
            document.getElementById('camera-section').classList.add('active');
            document.getElementById('camera-controls').style.display = 'flex';
            document.getElementById('stop-camera').disabled = false;
            
            // Hide file input
            document.getElementById('file-drop-zone').style.display = 'none';
            
        } catch (error) {
            console.error('Camera error:', error);
            alert('Camera error: ' + error.message);
            document.getElementById('start-camera').disabled = false;
        }
    }

    stopCamera() {
        this.cameraManager.stopCamera();
        document.getElementById('camera-section').classList.remove('active');
        document.getElementById('camera-controls').style.display = 'none';
        document.getElementById('start-camera').disabled = false;
        document.getElementById('stop-camera').disabled = true;
        
        // Show file input again
        document.getElementById('file-drop-zone').style.display = 'block';
    }

    switchCamera() {
        this.cameraManager.switchCamera();
    }

    async capturePhoto() {
        try {
            const canvas = this.cameraManager.captureFrame();
            const dataURL = canvas.toDataURL();
            
            // Create a Blob from the canvas
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            this.loadImage(blob);
            
            this.stopCamera();
            
        } catch (error) {
            console.error('Capture error:', error);
            alert('Capture error: ' + error.message);
        }
    }

    updatePreview(dataURL) {
        const preview = document.getElementById('editor-image');
        if (preview) {
            preview.src = dataURL;
        }
    }

    applySettings(settings) {
        if (!this.currentImageDataURL) return;
        
        const canvas = this.imageProcessor.applySettings(settings);
        this.currentImageDataURL = canvas.toDataURL();
        
        this.updatePreview(this.currentImageDataURL);
        
        if (this.currentImage) {
            this.currentImage.settings = {
                brightness: settings.brightness,
                contrast: settings.contrast,
                saturation: settings.saturation
            };
        }
    }

    updateSliderValues(brightness, contrast, saturation) {
        if (document.getElementById('brightness')) {
            document.getElementById('brightness').value = brightness;
        }
        if (document.getElementById('contrast')) {
            document.getElementById('contrast').value = contrast;
        }
        if (document.getElementById('saturation')) {
            document.getElementById('saturation').value = saturation;
        }
    }

    applyFilter(filter) {
        this.applySettings({ filter });
    }

    autoEnhance() {
        const canvas = this.imageProcessor.autoEnhance();
        if (canvas) {
            this.currentImageDataURL = canvas.toDataURL();
            this.updatePreview(this.currentImageDataURL);
        }
    }

    rotate(degrees) {
        const canvas = this.imageProcessor.rotate(degrees);
        if (canvas) {
            this.currentImageDataURL = canvas.toDataURL();
            this.updatePreview(this.currentImageDataURL);
        }
    }

    flip(direction) {
        const canvas = direction === 'horizontal' 
            ? this.imageProcessor.flipHorizontal() 
            : this.imageProcessor.flipVertical();
        if (canvas) {
            this.currentImageDataURL = canvas.toDataURL();
            this.updatePreview(this.currentImageDataURL);
        }
    }

    async detectAndCorrectPerspective() {
        // Show modal with canvas for corner adjustment
        const modal = document.getElementById('perspective-modal');
        const canvas = document.getElementById('perspective-canvas');
        const ctx = canvas.getContext('2d');
        
        if (!this.currentImageDataURL) {
            alert('Please load an image first');
            return;
        }

        // Load current image onto canvas
        const img = new Image();
        img.src = this.currentImageDataURL;
        await new Promise(resolve => img.onload = resolve);
        
        canvas.width = Math.min(img.width, 800);
        canvas.height = (img.height / img.width) * canvas.width;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Show modal
        modal.classList.add('active');
        
        // Setup corner adjustment
        this.setupCornerAdjustment(canvas, img);
    }

    setupCornerAdjustment(canvas, originalImage) {
        const ctx = canvas.getContext('2d');
        const corners = this.perspectiveCorrector.findDocumentCorners(canvas);
        
        // Draw corners
        this.drawCorners(canvas, corners);
        
        // Store reference
        this.pendingPerspective = {
            canvas: canvas,
            originalImage: originalImage,
            corners: corners
        };

        // Save corners to local storage for persistence
        localStorage.setItem('pendingPerspective', JSON.stringify(this.pendingPerspective));
    }

    drawCorners(canvas, corners) {
        const ctx = canvas.getContext('2d');
        
        // Clear previous drawing
        const img = new Image();
        img.src = this.currentImageDataURL;
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            // Draw corners
            ctx.fillStyle = '#ef4444';
            corners.forEach((corner, index) => {
                ctx.beginPath();
                ctx.arc(corner.x, corner.y, 8, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#ef4444';
                ctx.font = 'bold 12px Arial';
                ctx.fillText(index + 1, corner.x + 12, corner.y);
            });
            
            // Draw outline
            ctx.strokeStyle = '#2563eb';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(corners[0].x, corners[0].y);
            ctx.lineTo(corners[1].x, corners[1].y);
            ctx.lineTo(corners[2].x, corners[2].y);
            ctx.lineTo(corners[3].x, corners[3].y);
            ctx.closePath();
            ctx.stroke();
        };
    }

    async applyPerspectiveCorrection() {
        if (!this.pendingPerspective) return;
        
        const { canvas, originalImage, corners } = this.pendingPerspective;
        
        // Create temporary canvas with original dimensions
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = originalImage.width;
        tempCanvas.height = originalImage.height;
        
        const ctx = tempCanvas.getContext('2d');
        ctx.drawImage(originalImage, 0, 0);
        
        // Apply perspective correction
        const correctedCanvas = this.perspectiveCorrector.applyPerspectiveCorrection(tempCanvas, corners);
        
        // Update current image
        this.currentImageDataURL = correctedCanvas.toDataURL();
        this.updatePreview(this.currentImageDataURL);
        
        // Update current image data
        if (this.currentImage) {
            this.currentImage.dataURL = this.currentImageDataURL;
            this.currentImage.settings.perspective = true;
        }
        
        // Hide modal
        document.getElementById('perspective-modal').classList.remove('active');
        
        this.pendingPerspective = null;
        localStorage.removeItem('pendingPerspective');
    }

    cancelPerspectiveCorrection() {
        document.getElementById('perspective-modal').classList.remove('active');
        this.pendingPerspective = null;
        localStorage.removeItem('pendingPerspective');
    }

    async extractText() {
        if (!this.currentImageDataURL) {
            alert('Please load an image first');
            return;
        }

        // Initialize OCR
        document.getElementById('extract-text').disabled = true;
        document.getElementById('progress-container').style.display = 'block';
        
        try {
            await this.ocrManager.initialize('ben+eng', (progress) => {
                const progressBar = document.querySelector('.progress-bar');
                const progressText = document.getElementById('progress-text');
                
                if (progressBar && progressText) {
                    progressBar.style.width = progress.progress + '%';
                    progressText.textContent = `Progress: ${progress.progress}%`;
                }
            });

            // Convert dataURL to canvas for OCR
            const img = new Image();
            img.src = this.currentImageDataURL;
            await new Promise(resolve => img.onload = resolve);
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            // Recognize text
            const result = await this.ocrManager.recognize(canvas);
            
            // Display result
            const textOutput = document.getElementById('text-output');
            textOutput.textContent = result.text;
            
            document.getElementById('confidence-value').textContent = result.confidence + '%';
            document.getElementById('confidence-fill').style.width = result.confidence + '%';

            // Update current image
            if (this.currentImage) {
                this.currentImage.text = result.text;
                this.currentImage.confidence = result.confidence;
            }
            
            // Add to history
            this.addToHistory();
            
        } catch (error) {
            console.error('OCR error:', error);
            alert('OCR error: ' + error.message);
        } finally {
            document.getElementById('extract-text').disabled = false;
            document.getElementById('progress-container').style.display = 'none';
        }
    }

    copyText() {
        const textOutput = document.getElementById('text-output');
        const text = textOutput.textContent.trim();
        
        if (!text) {
            alert('No text to copy');
            return;
        }

        navigator.clipboard.writeText(text)
            .then(() => {
                alert('Text copied to clipboard!');
            })
            .catch(() => {
                alert('Failed to copy text');
            });
    }

    downloadText() {
        const textOutput = document.getElementById('text-output');
        const text = textOutput.textContent.trim();
        
        if (!text) {
            alert('No text to download');
            return;
        }

        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `scan_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }

    downloadImage() {
        if (!this.currentImageDataURL) {
            alert('No image to download');
            return;
        }

        const a = document.createElement('a');
        a.href = this.currentImageDataURL;
        a.download = `scan_${new Date().toISOString().slice(0, 10)}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    addToHistory() {
        if (!this.currentImage) return;

        // Remove old entry if exists
        this.scanHistory = this.scanHistory.filter(
            img => img.dataURL !== this.currentImage.dataURL
        );

        // Add new entry
        this.scanHistory.unshift(this.currentImage);

        // Keep only last 10
        if (this.scanHistory.length > 10) {
            this.scanHistory = this.scanHistory.slice(0, 10);
        }

        this.saveHistory();
        this.updateHistoryPanel();
    }

    loadHistory() {
        const saved = localStorage.getItem('scanHistory');
        if (saved) {
            try {
                this.scanHistory = JSON.parse(saved);
            } catch (e) {
                this.scanHistory = [];
            }
        }
        this.updateHistoryPanel();
    }

    saveHistory() {
        localStorage.setItem('scanHistory', JSON.stringify(this.scanHistory));
    }

    clearHistory() {
        if (confirm('Clear all scan history?')) {
            this.scanHistory = [];
            this.saveHistory();
            this.updateHistoryPanel();
        }
    }

    updateHistoryPanel() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        if (this.scanHistory.length === 0) {
            historyList.innerHTML = '<p class="text-gray-500">No scan history yet</p>';
            return;
        }

        historyList.innerHTML = this.scanHistory.map((scan, index) => {
            const date = new Date(scan.timestamp);
            return `
                <div class="history-item" onclick="app.loadFromHistory(${index})">
                    <div class="flex justify-between items-center">
                        <span class="text-sm font-medium">Scan ${index + 1}</span>
                        <span class="text-xs text-gray-500">${date.toLocaleDateString()} ${date.toLocaleTimeString()}</span>
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                        ${scan.text ? `${scan.text.substring(0, 100)}...` : 'No text extracted'}
                    </div>
                </div>
            `;
        }).join('');
    }

    loadFromHistory(index) {
        if (!this.scanHistory[index]) return;
        
        const scan = this.scanHistory[index];
        
        // Update preview
        this.currentImageDataURL = scan.dataURL;
        this.updatePreview(this.currentImageDataURL);
        
        // Update current image
        this.currentImage = {
            ...scan,
            dataURL: scan.dataURL
        };
        
        // Load OCR if available
        if (scan.text) {
            document.getElementById('text-output').textContent = scan.text;
            document.getElementById('confidence-value').textContent = (scan.confidence || 0) + '%';
            document.getElementById('confidence-fill').style.width = (scan.confidence || 0) + '%';
        }
        
        // Reload image processor
        const img = new Image();
        img.src = scan.dataURL;
        img.onload = () => {
            this.imageProcessor.loadImage(img)
                .then(() => {
                    this.imageProcessor.applySettings(scan.settings);
                });
        };
        
        // Show modal
        document.getElementById('history-modal').classList.add('active');
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new ScanApp();
    console.log('ScanMx initialized');
});

// Export for global access
window.app = app;
