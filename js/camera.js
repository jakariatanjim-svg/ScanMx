/* Camera Module - Handles camera capture and video stream */

class CameraManager {
    constructor() {
        this.stream = null;
        this.videoElement = null;
        this.isStreaming = false;
        this.facingMode = 'environment'; // 'environment' for back camera, 'user' for front
    }

    async init(videoElementId) {
        this.videoElement = document.getElementById(videoElementId);
        if (!this.videoElement) {
            throw new Error('Video element not found');
        }
    }

    async startCamera() {
        try {
            if (this.isStreaming) {
                this.stopCamera();
            }

            const constraints = {
                video: {
                    facingMode: this.facingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.videoElement.srcObject = this.stream;
            await this.videoElement.play();
            this.isStreaming = true;

            return true;
        } catch (error) {
            console.error('Camera error:', error);
            throw new Error(`Camera access denied or not available: ${error.message}`);
        }
    }

    stopCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        if (this.videoElement) {
            this.videoElement.srcObject = null;
        }
        this.isStreaming = false;
    }

    switchCamera() {
        this.facingMode = this.facingMode === 'environment' ? 'user' : 'environment';
        if (this.isStreaming) {
            this.startCamera();
        }
    }

    captureFrame() {
        if (!this.isStreaming || !this.videoElement) {
            throw new Error('Camera is not active');
        }

        const canvas = document.createElement('canvas');
        canvas.width = this.videoElement.videoWidth;
        canvas.height = this.videoElement.videoHeight;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(this.videoElement, 0, 0);

        return canvas;
    }

    captureAsBlob() {
        return new Promise((resolve, reject) => {
            try {
                const canvas = this.captureFrame();
                canvas.toBlob(blob => {
                    resolve(blob);
                }, 'image/png');
            } catch (error) {
                reject(error);
            }
        });
    }

    captureAsDataURL() {
        const canvas = this.captureFrame();
        return canvas.toDataURL('image/png');
    }

    getDevices() {
        return navigator.mediaDevices.enumerateDevices()
            .then(devices => devices.filter(device => device.kind === 'videoinput'));
    }
}

// Export for use in other modules
window.CameraManager = CameraManager;
