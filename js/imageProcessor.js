/* Image Processor Module - Handles image enhancement and filters */

class ImageProcessor {
    constructor() {
        this.originalImage = null;
        this.currentCanvas = null;
        this.settings = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            filter: 'none' // 'none', 'grayscale', 'bw', 'magic'
        };
    }

    loadImage(source) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                this.originalImage = img;
                this.currentCanvas = this.createCanvas(img.width, img.height);
                const ctx = this.currentCanvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                resolve(this.currentCanvas);
            };
            
            img.onerror = () => reject(new Error('Failed to load image'));
            
            if (source instanceof Blob) {
                img.src = URL.createObjectURL(source);
            } else if (typeof source === 'string') {
                img.src = source;
            } else if (source instanceof HTMLCanvasElement) {
                img.src = source.toDataURL();
            } else {
                reject(new Error('Invalid image source'));
            }
        });
    }

    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    applySettings(settings) {
        if (!this.originalImage) return null;
        
        this.settings = { ...this.settings, ...settings };
        
        const canvas = this.createCanvas(this.originalImage.width, this.originalImage.height);
        const ctx = canvas.getContext('2d');
        
        // Draw original image
        ctx.drawImage(this.originalImage, 0, 0);
        
        // Get image data
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = imageData.data;
        
        // Apply brightness
        const brightness = this.settings.brightness / 100;
        
        // Apply contrast
        const contrast = this.settings.contrast / 100;
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        
        // Apply saturation
        const saturation = this.settings.saturation / 100;
        
        for (let i = 0; i < data.length; i += 4) {
            let r = data[i];
            let g = data[i + 1];
            let b = data[i + 2];
            
            // Apply brightness
            r *= brightness;
            g *= brightness;
            b *= brightness;
            
            // Apply contrast
            r = factor * (r - 128) + 128;
            g = factor * (g - 128) + 128;
            b = factor * (b - 128) + 128;
            
            // Apply saturation
            const gray = 0.2989 * r + 0.587 * g + 0.114 * b;
            r = gray + saturation * (r - gray);
            g = gray + saturation * (g - gray);
            b = gray + saturation * (b - gray);
            
            // Apply filter
            if (this.settings.filter === 'grayscale') {
                const avg = (r + g + b) / 3;
                r = g = b = avg;
            } else if (this.settings.filter === 'bw') {
                const avg = (r + g + b) / 3;
                r = g = b = avg > 128 ? 255 : 0;
            } else if (this.settings.filter === 'magic') {
                // Magic color - enhance colors and contrast
                r = Math.min(255, r * 1.2);
                g = Math.min(255, g * 1.1);
                b = Math.min(255, b * 1.3);
            }
            
            // Clamp values
            data[i] = Math.max(0, Math.min(255, r));
            data[i + 1] = Math.max(0, Math.min(255, g));
            data[i + 2] = Math.max(0, Math.min(255, b));
        }
        
        ctx.putImageData(imageData, 0, 0);
        this.currentCanvas = canvas;
        
        return canvas;
    }

    autoEnhance() {
        if (!this.originalImage) return null;
        
        // Auto-enhance settings for document scanning
        this.settings = {
            brightness: 110,
            contrast: 130,
            saturation: 80,
            filter: 'none'
        };
        
        return this.applySettings(this.settings);
    }

    rotate(degrees) {
        if (!this.currentCanvas) return null;
        
        const canvas = this.createCanvas(
            degrees % 180 === 0 ? this.currentCanvas.width : this.currentCanvas.height,
            degrees % 180 === 0 ? this.currentCanvas.height : this.currentCanvas.width
        );
        const ctx = canvas.getContext('2d');
        
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(degrees * Math.PI / 180);
        ctx.drawImage(this.currentCanvas, -this.currentCanvas.width / 2, -this.currentCanvas.height / 2);
        
        this.currentCanvas = canvas;
        return canvas;
    }

    flipHorizontal() {
        if (!this.currentCanvas) return null;
        
        const canvas = this.createCanvas(this.currentCanvas.width, this.currentCanvas.height);
        const ctx = canvas.getContext('2d');
        
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(this.currentCanvas, 0, 0);
        
        this.currentCanvas = canvas;
        return canvas;
    }

    flipVertical() {
        if (!this.currentCanvas) return null;
        
        const canvas = this.createCanvas(this.currentCanvas.width, this.currentCanvas.height);
        const ctx = canvas.getContext('2d');
        
        ctx.translate(0, canvas.height);
        ctx.scale(1, -1);
        ctx.drawImage(this.currentCanvas, 0, 0);
        
        this.currentCanvas = canvas;
        return canvas;
    }

    crop(x, y, width, height) {
        if (!this.currentCanvas) return null;
        
        const canvas = this.createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        ctx.drawImage(this.currentCanvas, x, y, width, height, 0, 0, width, height);
        
        this.currentCanvas = canvas;
        return canvas;
    }

    getCurrentCanvas() {
        return this.currentCanvas;
    }

    getDataURL(format = 'image/png', quality = 0.9) {
        if (!this.currentCanvas) return null;
        return this.currentCanvas.toDataURL(format, quality);
    }

    getBlob(format = 'image/png', quality = 0.9) {
        return new Promise((resolve, reject) => {
            if (!this.currentCanvas) {
                reject(new Error('No canvas available'));
                return;
            }
            this.currentCanvas.toBlob(resolve, format, quality);
        });
    }

    reset() {
        if (this.originalImage) {
            this.settings = {
                brightness: 100,
                contrast: 100,
                saturation: 100,
                filter: 'none'
            };
            return this.applySettings(this.settings);
        }
        return null;
    }
}

// Export for use in other modules
window.ImageProcessor = ImageProcessor;
