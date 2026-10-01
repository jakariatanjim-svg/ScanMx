/* Perspective Correction Module - Document edge detection and warp correction */

class PerspectiveCorrector {
    constructor() {
        this.corners = null;
        this.canvas = null;
        this.ctx = null;
    }

    // Detect document edges using edge detection algorithm
    detectEdges(imageData) {
        const { width, height, data } = imageData;
        
        // Convert to grayscale first
        const gray = new Uint8Array(width * height);
        for (let i = 0; i < data.length; i += 4) {
            gray[i / 4] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
        }

        // Simple edge detection using Sobel operator
        const edges = new Uint8Array(width * height);
        const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
        const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let gx = 0, gy = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = (y + ky) * width + (x + kx);
                        const kidx = (ky + 1) * 3 + (kx + 1);
                        gx += gray[idx] * sobelX[kidx];
                        gy += gray[idx] * sobelY[kidx];
                    }
                }
                
                edges[y * width + x] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
            }
        }

        return edges;
    }

    // Find document corners using contour detection
    findDocumentCorners(canvas) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const edges = this.detectEdges(imageData);
        
        // Threshold edges
        const threshold = 50;
        const binary = edges.map(v => v > threshold ? 255 : 0);

        // Find contours (simplified - find largest quadrilateral)
        // This is a basic implementation; production would use more sophisticated algorithms
        const width = canvas.width;
        const height = canvas.height;
        
        // Default corners (full image with margin)
        const margin = 50;
        let corners = [
            { x: margin, y: margin },                           // Top-left
            { x: width - margin, y: margin },                   // Top-right
            { x: width - margin, y: height - margin },          // Bottom-right
            { x: margin, y: height - margin }                   // Bottom-left
        ];

        // Try to find actual document corners by detecting high edge density areas
        // This is a simplified approach - real implementation would use proper contour detection
        const cornerRegions = this.findCornerRegions(binary, width, height);
        
        if (cornerRegions) {
            corners = cornerRegions;
        }

        this.corners = corners;
        return corners;
    }

    findCornerRegions(binary, width, height) {
        // Simplified corner detection
        // Look for corners in each quadrant
        const quadrantSize = Math.min(width, height) / 3;
        
        const quadrants = [
            { startX: 0, startY: 0 },                           // Top-left
            { startX: width - quadrantSize, startY: 0 },        // Top-right
            { startX: width - quadrantSize, startY: height - quadrantSize }, // Bottom-right
            { startX: 0, startY: height - quadrantSize }        // Bottom-left
        ];

        const corners = quadrants.map(q => {
            let maxDensity = 0;
            let bestPoint = { x: q.startX + quadrantSize / 2, y: q.startY + quadrantSize / 2 };

            // Sample points in quadrant
            for (let y = q.startY; y < q.startY + quadrantSize; y += 10) {
                for (let x = q.startX; x < q.startX + quadrantSize; x += 10) {
                    const idx = y * width + x;
                    if (binary[idx] === 255) {
                        const density = this.getLocalDensity(binary, x, y, width, 20);
                        if (density > maxDensity) {
                            maxDensity = density;
                            bestPoint = { x, y };
                        }
                    }
                }
            }

            return bestPoint;
        });

        return corners;
    }

    getLocalDensity(binary, x, y, width, radius) {
        let count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const idx = (y + dy) * width + (x + dx);
                if (binary[idx] === 255) {
                    count++;
                }
            }
        }
        return count;
    }

    // Apply perspective transformation
    applyPerspectiveCorrection(canvas, corners = null) {
        if (!corners) {
            corners = this.corners || this.findDocumentCorners(canvas);
        }

        const srcPoints = corners.map(c => [c.x, c.y]);
        
        // Calculate destination dimensions
        const width = Math.max(
            this.distance(corners[0], corners[1]),
            this.distance(corners[2], corners[3])
        );
        const height = Math.max(
            this.distance(corners[0], corners[3]),
            this.distance(corners[1], corners[2])
        );

        const dstPoints = [
            [0, 0],
            [width, 0],
            [width, height],
            [0, height]
        ];

        // Calculate homography matrix
        const H = this.calculateHomography(srcPoints, dstPoints);
        
        // Apply transformation
        return this.warpPerspective(canvas, H, Math.round(width), Math.round(height));
    }

    distance(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    calculateHomography(src, dst) {
        // Simplified homography calculation
        // For production, use a proper linear algebra library
        
        const A = [];
        const b = [];

        for (let i = 0; i < 4; i++) {
            const x = src[i][0], y = src[i][1];
            const u = dst[i][0], v = dst[i][1];
            
            A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
            A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
            b.push(u);
            b.push(v);
        }

        // Solve linear system (simplified - use Gaussian elimination)
        const h = this.solveLinearSystem(A, b);
        
        return [
            [h[0], h[1], h[2]],
            [h[3], h[4], h[5]],
            [h[6], h[7], 1]
        ];
    }

    solveLinearSystem(A, b) {
        // Simple Gaussian elimination for 8x8 system
        const n = 8;
        const augmented = A.map((row, i) => [...row, b[i]]);

        // Forward elimination
        for (let col = 0; col < n; col++) {
            // Find pivot
            let maxRow = col;
            for (let row = col + 1; row < n; row++) {
                if (Math.abs(augmented[row][col]) > Math.abs(augmented[maxRow][col])) {
                    maxRow = row;
                }
            }
            [augmented[col], augmented[maxRow]] = [augmented[maxRow], augmented[col]];

            // Eliminate column
            for (let row = col + 1; row < n; row++) {
                const factor = augmented[row][col] / augmented[col][col];
                for (let j = col; j <= n; j++) {
                    augmented[row][j] -= factor * augmented[col][j];
                }
            }
        }

        // Back substitution
        const x = new Array(n).fill(0);
        for (let i = n - 1; i >= 0; i--) {
            x[i] = augmented[i][n];
            for (let j = i + 1; j < n; j++) {
                x[i] -= augmented[i][j] * x[j];
            }
            x[i] /= augmented[i][i];
        }

        return x;
    }

    warpPerspective(srcCanvas, H, dstWidth, dstHeight) {
        const dstCanvas = document.createElement('canvas');
        dstCanvas.width = dstWidth;
        dstCanvas.height = dstHeight;
        
        const srcCtx = srcCanvas.getContext('2d');
        const dstCtx = dstCanvas.getContext('2d');
        
        const srcImageData = srcCtx.getImageData(0, 0, srcCanvas.width, srcCanvas.height);
        const dstImageData = dstCtx.createImageData(dstWidth, dstHeight);

        const H_inv = this.invertMatrix3x3(H);

        for (let y = 0; y < dstHeight; y++) {
            for (let x = 0; x < dstWidth; x++) {
                // Apply inverse homography
                const sx = H_inv[0][0] * x + H_inv[0][1] * y + H_inv[0][2];
                const sy = H_inv[1][0] * x + H_inv[1][1] * y + H_inv[1][2];
                const sz = H_inv[2][0] * x + H_inv[2][1] * y + H_inv[2][2];
                
                const srcX = Math.round(sx / sz);
                const srcY = Math.round(sy / sz);

                if (srcX >= 0 && srcX < srcCanvas.width && srcY >= 0 && srcY < srcCanvas.height) {
                    const srcIdx = (srcY * srcCanvas.width + srcX) * 4;
                    const dstIdx = (y * dstWidth + x) * 4;
                    
                    dstImageData.data[dstIdx] = srcImageData.data[srcIdx];
                    dstImageData.data[dstIdx + 1] = srcImageData.data[srcIdx + 1];
                    dstImageData.data[dstIdx + 2] = srcImageData.data[srcIdx + 2];
                    dstImageData.data[dstIdx + 3] = srcImageData.data[srcIdx + 3];
                }
            }
        }

        dstCtx.putImageData(dstImageData, 0, 0);
        return dstCanvas;
    }

    invertMatrix3x3(m) {
        const det = m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
                    m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
                    m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);

        const invDet = 1 / det;

        return [
            [
                (m[1][1] * m[2][2] - m[1][2] * m[2][1]) * invDet,
                (m[0][2] * m[2][1] - m[0][1] * m[2][2]) * invDet,
                (m[0][1] * m[1][2] - m[0][2] * m[1][1]) * invDet
            ],
            [
                (m[1][2] * m[2][0] - m[1][0] * m[2][2]) * invDet,
                (m[0][0] * m[2][2] - m[0][2] * m[2][0]) * invDet,
                (m[0][2] * m[1][0] - m[0][0] * m[1][2]) * invDet
            ],
            [
                (m[1][0] * m[2][1] - m[1][1] * m[2][0]) * invDet,
                (m[0][1] * m[2][0] - m[0][0] * m[2][1]) * invDet,
                (m[0][0] * m[1][1] - m[0][1] * m[1][0]) * invDet
            ]
        ];
    }

    setCorners(corners) {
        this.corners = corners;
    }

    getCorners() {
        return this.corners;
    }
}

// Export for use in other modules
window.PerspectiveCorrector = PerspectiveCorrector;
