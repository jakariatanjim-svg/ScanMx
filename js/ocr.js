/* OCR Module - Handles text extraction using Tesseract.js */

class OCRManager {
    constructor() {
        this.worker = null;
        this.isReady = false;
        this.currentLanguage = 'ben+eng'; // Bangla + English
        this.progressCallback = null;
    }

    async initialize(language = 'ben+eng', progressCallback = null) {
        if (this.worker) {
            await this.terminate();
        }

        this.progressCallback = progressCallback;
        this.currentLanguage = language;

        try {
            this.worker = await Tesseract.createWorker(language, 1, {
                logger: m => {
                    if (this.progressCallback && m.progress !== undefined) {
                        this.progressCallback({
                            status: m.status,
                            progress: Math.round(m.progress * 100)
                        });
                    }
                }
            });

            this.isReady = true;
            return true;
        } catch (error) {
            console.error('OCR initialization error:', error);
            throw new Error(`Failed to initialize OCR: ${error.message}`);
        }
    }

    async recognize(image) {
        if (!this.isReady || !this.worker) {
            throw new Error('OCR not initialized. Call initialize() first.');
        }

        try {
            let imageSource;
            
            if (image instanceof HTMLCanvasElement) {
                imageSource = image;
            } else if (image instanceof HTMLImageElement) {
                imageSource = image;
            } else if (image instanceof Blob) {
                imageSource = URL.createObjectURL(image);
            } else if (typeof image === 'string') {
                imageSource = image;
            } else {
                throw new Error('Invalid image source for OCR');
            }

            const result = await this.worker.recognize(imageSource);

            return {
                text: result.data.text,
                confidence: result.data.confidence,
                words: result.data.words,
                lines: result.data.lines,
                paragraphs: result.data.paragraphs
            };
        } catch (error) {
            console.error('OCR recognition error:', error);
            throw new Error(`Failed to recognize text: ${error.message}`);
        }
    }

    async changeLanguage(language) {
        if (this.currentLanguage === language && this.isReady) {
            return;
        }

        await this.terminate();
        await this.initialize(language, this.progressCallback);
    }

    async terminate() {
        if (this.worker) {
            await this.worker.terminate();
            this.worker = null;
            this.isReady = false;
        }
    }

    getAvailableLanguages() {
        return [
            { code: 'ben', name: 'বাংলা (Bangla)' },
            { code: 'eng', name: 'English' },
            { code: 'ben+eng', name: 'বাংলা + English' },
            { code: 'hin', name: 'हिन्दी (Hindi)' },
            { code: 'ara', name: 'العربية (Arabic)' },
            { code: 'chi_sim', name: '中文 (Chinese Simplified)' },
            { code: 'jpn', name: '日本語 (Japanese)' },
            { code: 'kor', name: '한국어 (Korean)' }
        ];
    }
}

// Export for use in other modules
window.OCRManager = OCRManager;
