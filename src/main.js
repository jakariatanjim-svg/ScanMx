// ScanMx Pro - Main Application Entry Point

import { ImageProcessor } from './ImageProcessor.js';
import { FilterProcessor } from './FilterProcessor.js';
import { CameraManager } from './CameraManager.js';
import { PerspectiveCorrector } from './PerspectiveCorrector.js';
import { OCRManager } from './OCRManager.js';
import { UIController } from './UIController.js';

// Initialize the app
window.addEventListener('DOMContentLoaded', () => {
    console.log('ScanMx Pro initialized');

    const imageProcessor = new ImageProcessor();
    const filterProcessor = new FilterProcessor();
    const cameraManager = new CameraManager();
    const perspectiveCorrector = new PerspectiveCorrector();
    const ocrManager = new OCRManager();
    const uiController = new UIController(imageProcessor, filterProcessor, cameraManager, perspectiveCorrector, ocrManager);

    uiController.init();
});
