// FilterProcessor - Advanced document image filters

export class FilterProcessor {
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
            'sharpen': this.applySharpen.bind(this)
        };
    }

    applyFilter(name, canvas, settings = {}) {
        if (!this.filters[name]) return canvas;
        return this.filters[name](canvas, settings);
    }

    applyNone(canvas) { return canvas; }

    applyGrayscale(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < d.length; i += 4) {
            const v = (d[i] + d[i+1] + d[i+2]) / 3;
            d[i] = d[i+1] = d[i+2] = v;
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applyBlackWhite(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < d.length; i += 4) {
            const v = (d[i] + d[i+1] + d[i+2]) / 3;
            const b = v > 128 ? 255 : 0;
            d[i] = d[i+1] = d[i+2] = b;
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applyMagicColor(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < d.length; i += 4) {
            d[i] = Math.min(255, d[i] * 1.2);
            d[i+1] = Math.min(255, d[i+1] * 1.1);
            d[i+2] = Math.min(255, d[i+2] * 1.3);
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applyDocumentColor(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < d.length; i += 4) {
            d[i] = Math.min(255, d[i] * 1.1);
            d[i+1] = Math.min(255, d[i+1] * 1.1);
            d[i+2] = Math.min(255, d[i+2] * 1.1);
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applyIDCardMode(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < d.length; i += 4) {
            const v = (d[i] + d[i+1] + d[i+2]) / 3;
            d[i] = d[i+1] = d[i+2] = v > 130 ? 255 : 0;
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applyReceiptMode(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < d.length; i += 4) {
            d[i+2] = Math.max(0, d[i+2] - 30);
            const v = (d[i] + d[i+1] + d[i+2]) / 3;
            d[i] = d[i+1] = d[i+2] = v > 140 ? 255 : 0;
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applyBookMode(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < d.length; i += 4) {
            d[i] = Math.min(255, d[i] * 1.2);
            d[i+2] = Math.max(0, d[i+2] - 40);
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applyOldDocument(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < d.length; i += 4) {
            const v = (d[i] + d[i+1] + d[i+2]) / 3;
            d[i] = d[i+1] = d[i+2] = v < 100 ? Math.max(0, v - 30) : Math.min(255, v * 1.3);
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applyHighContrast(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < d.length; i += 4) {
            const v = (d[i] + d[i+1] + d[i+2]) / 3;
            d[i] = d[i+1] = d[i+2] = v > 110 ? 255 : 0;
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applyNewspaper(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < d.length; i += 4) {
            const v = (d[i] + d[i+1] + d[i+2]) / 3;
            d[i] = d[i+1] = d[i+2] = v > 120 ? 255 : 0;
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applyNoShadow(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        for (let i = 0; i < d.length; i += 4) {
            const v = (d[i] + d[i+1] + d[i+2]) / 3;
            d[i] = d[i+1] = d[i+2] = v;
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applyDenoise(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const w = canvas.width, h = canvas.height;
        const s = new Uint8ClampedArray(d);
        for (let y = 1; y < h-1; y++) {
            for (let x = 1; x < w-1; x++) {
                const idx = (y*w+x)*4;
                let r=0,g=0,b=0;
                for (let dy=-1; dy<=1; dy++) {
                    for (let dx=-1; dx<=1; dx++) {
                        const n = ((y+dy)*w+(x+dx))*4;
                        r += s[n]; g += s[n+1]; b += s[n+2];
                    }
                }
                d[idx] = r/9; d[idx+1] = g/9; d[idx+2] = b/9;
            }
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }

    applySharpen(canvas) {
        const ctx = canvas.getContext('2d');
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const w = canvas.width, h = canvas.height;
        const s = new Uint8ClampedArray(d);
        for (let y = 1; y < h-1; y++) {
            for (let x = 1; x < w-1; x++) {
                const idx = (y*w+x)*4;
                let r=0,g=0,b=0, cnt=0;
                for (let dy=-1; dy<=1; dy++) {
                    for (let dx=-1; dx<=1; dx++) {
                        if (dx===0 && dy===0) continue;
                        const n = ((y+dy)*w+(x+dx))*4;
                        r += s[n]; g += s[n+1]; b += s[n+2]; cnt++;
                    }
                }
                d[idx] = Math.max(0, Math.min(255, s[idx] + (s[idx]-r/cnt) * 0.8));
                d[idx+1] = Math.max(0, Math.min(255, s[idx+1] + (s[idx+1]-g/cnt) * 0.8));
                d[idx+2] = Math.max(0, Math.min(255, s[idx+2] + (s[idx+2]-b/cnt) * 0.8));
            }
        }
        ctx.putImageData(d, 0, 0);
        return canvas;
    }
}