// ImageProcessor - Handles image loading, transformations, and processing

export class ImageProcessor {
    constructor() {
        this.originalImage = null;
        this.currentCanvas = null;
        this.settings = {
            brightness: 100,
            contrast: 100,
            saturation: 100,
            filter: 'none'
        };
    }

    async loadImage(source) {
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

        ctx.drawImage(this.originalImage, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Brightness
        const brightness = this.settings.brightness / 100;
        for (let i = 0; i < data.length; i += 4) {
            data[i] *= brightness;
            data[i + 1] *= brightness;
            data[i + 2] *= brightness;
        }

        // Contrast
        const contrast = this.settings.contrast / 100;
        const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255));
        for (let i = 0; i < data.length; i += 4) {
            data[i] = factor * (data[i] - 128) + 128;
            data[i + 1] = factor * (data[i + 1] - 128) + 128;
            data[i + 2] = factor * (data[i + 2] - 128) + 128;
        }

        ctx.putImageData(imageData, 0, 0);
        this.currentCanvas = canvas;

        return canvas;
    }

    autoEnhance() {
        if (!this.originalImage) return null;

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

    flip(direction) {
        return direction === 'horizontal' ? this.flipHorizontal() : this.flipVertical();
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