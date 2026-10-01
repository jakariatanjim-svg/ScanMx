/* Filters Module - Advanced document image filters */

class FilterProcessor {
    constructor() {
        this.filters = {
            'none': this.applyNone.bind(this),
            'grayscale': this.applyGrayscale.bind(this),
            'bw': this.applyBlackWhite.bind(this),
            'magic': this.applyMagicColor.bind(this),
            'document': this.applyDocumentColor.bind(this),
            'idcard': this.applyIDCardMode.bind(this),
            'receipt': this.applyReceiptMode.bind(this),
            'book': this.applyBookMode.bind(this),
            'old': this.applyOldDocument.bind(this),
            'highcontrast': this.applyHighContrast.bind(this),
            'newspaper': this.applyNewspaper.bind(this),
            'noshadow': this.applyNoShadow.bind(this),
            'denoise': this.applyDenoise.bind(this),
            'superres': this.applySuperResolution.bind(this),
            'clarity': this.applyClarity.bind(this)
        };
    }

    applyFilter(filterName, canvas, settings = {}) {
        if (!this.filters[filterName]) return canvas;
        return this.filters[filterName](canvas, settings);
    }

    applyNone(canvas, settings) {
        return canvas;
    }

    applyGrayscale(canvas, settings) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyBlackWhite(canvas, settings) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple threshold - can be improved with Otsu's method
        const threshold = 128;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg > threshold ? 255 : 0;
            data[i + 1] = avg > threshold ? 255 : 0;
            data[i + 2] = avg > threshold ? 255 : 0;
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyMagicColor(canvas, settings) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Boost red channel
            data[i] = Math.min(255, data[i] * 1.2);
            // Slight boost to green
            data[i + 1] = Math.min(255, data[i + 1] * 1.1);
            // Boost blue channel
            data[i + 2] = Math.min(255, data[i + 2] * 1.3);
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyDocumentColor(canvas, settings) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Boost document colors, reduce noise
        for (let i = 0; i < data.length; i += 4) {
            // Slight color boost
            data[i] = Math.min(255, data[i] * 1.1);
            data[i + 1] = Math.min(255, data[i + 1] * 1.1);
            data[i + 2] = Math.min(255, data[i + 2] * 1.1);
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyIDCardMode(canvas, settings) {
        // Optimize for ID cards - high contrast, clean edges
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // High contrast B&W
            data[i] = avg > 130 ? 255 : 0;
            data[i + 1] = avg > 130 ? 255 : 0;
            data[i + 2] = avg > 130 ? 255 : 0;
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyReceiptMode(canvas, settings) {
        // Optimize for receipts - enhance text on light background
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Reduce blue tint (receipts often have blue text)
            data[i + 2] = Math.max(0, data[i + 2] - 30);
            // Boost contrast
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg > 140 ? 255 : 0;
            data[i + 1] = avg > 140 ? 255 : 0;
            data[i + 2] = avg > 140 ? 255 : 0;
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyBookMode(canvas, settings) {
        // Optimize for book pages - warm tone, reduce blue
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Warm tone
            data[i] = Math.min(255, data[i] * 1.2);      // Red boost
            data[i + 1] = Math.min(255, data[i + 1] * 1.1);  // Green
            data[i + 2] = Math.max(0, data[i + 2] - 40); // Blue reduction
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyOldDocument(canvas, settings) {
        // Restore faded old documents
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // Enhance contrast for faded text
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Bring out faded text
            data[i] = avg < 100 ? Math.max(0, avg - 30) : Math.min(255, avg * 1.3);
            data[i + 1] = avg < 100 ? Math.max(0, avg - 30) : Math.min(255, avg * 1.3);
            data[i + 2] = avg < 100 ? Math.max(0, avg - 30) : Math.min(255, avg * 1.3);
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyHighContrast(canvas, settings) {
        // Maximum contrast for legal documents
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Extreme contrast
            data[i] = avg > 110 ? 255 : 0;
            data[i + 1] = avg > 110 ? 255 : 0;
            data[i + 2] = avg > 110 ? 255 : 0;
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyNewspaper(canvas, settings) {
        // Optimize for newspaper print
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            // High contrast B&W for newsprint
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg > 120 ? 255 : 0;
            data[i + 1] = avg > 120 ? 255 : 0;
            data[i + 2] = avg > 120 ? 255 : 0;
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyNoShadow(canvas, settings) {
        // Remove shadows from flash photos
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            // Normalize brightness
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyDenoise(canvas, settings) {
        // Reduce noise in low quality images
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        // Simple median filter
        const smoothed = new Uint8ClampedArray(data.length);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;

                // Get neighborhood
                const neighbors = [];
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        const avg = (data[nIdx] + data[nIdx + 1] + data[nIdx + 2]) / 3;
                        neighbors.push(avg);
                    }
                }

                // Sort and get median
                neighbors.sort((a, b) => a - b);
                const median = neighbors[4]; // 9 elements, middle one

                smoothed[idx] = median;
                smoothed[idx + 1] = median;
                smoothed[idx + 2] = median;
                smoothed[idx + 3] = data[idx + 3];
            }
        }

        for (let i = 0; i < data.length; i++) {
            data[i] = smoothed[i];
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applySuperResolution(canvas, settings) {
        // Simple upscaling with sharpening
        const scale = 1.5;
        const newWidth = Math.round(canvas.width * scale);
        const newHeight = Math.round(canvas.height * scale);

        const newCanvas = document.createElement('canvas');
        newCanvas.width = newWidth;
        newCanvas.height = newHeight;

        const ctx = newCanvas.getContext('2d');
        ctx.drawImage(canvas, 0, 0, newWidth, newHeight);

        // Apply sharpening
        return this.applySharpen(newCanvas);
    }

    applySharpen(canvas, amount = 1.5) {
        // Simple sharpening filter
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const width = canvas.width;
        const height = canvas.height;

        const original = new Uint8ClampedArray(data);

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                const idx = (y * width + x) * 4;

                // Get surrounding pixels
                const neighbors = [];
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        const nIdx = ((y + dy) * width + (x + dx)) * 4;
                        neighbors.push({
                            r: original[nIdx],
                            g: original[nIdx + 1],
                            b: original[nIdx + 2]
                        });
                    }
                }

                // Calculate average of neighbors
                const avgR = neighbors.reduce((sum, n) => sum + n.r, 0) / 8;
                const avgG = neighbors.reduce((sum, n) => sum + n.g, 0) / 8;
                const avgB = neighbors.reduce((sum, n) => sum + n.b, 0) / 8;

                // Sharpen: original + (original - average) * amount
                const r = original[idx] + (original[idx] - avgR) * amount;
                const g = original[idx + 1] + (original[idx + 1] - avgG) * amount;
                const b = original[idx + 2] + (original[idx + 2] - avgB) * amount;

                data[idx] = Math.max(0, Math.min(255, r));
                data[idx + 1] = Math.max(0, Math.min(255, g));
                data[idx + 2] = Math.max(0, Math.min(255, b));
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }

    applyClarity(canvas, settings) {
        // Enhance texture and clarity
        canvas = this.applySharpen(canvas, 0.8);
        canvas = this.applyHighContrast(canvas);
        return canvas;
    }
}

// Export for use
window.FilterProcessor = FilterProcessor;
