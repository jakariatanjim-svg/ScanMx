// PerspectiveCorrector - Edge detection and warp correction

export class PerspectiveCorrector {
    constructor() {
        this.corners = null;
    }

    findDocumentCorners(canvas) {
        const w = canvas.width, h = canvas.height;
        const margin = Math.min(w, h) * 0.05;
        // Simple default, in a real pro app you'd use OpenCV.js contour detection
        this.corners = [
            { x: margin, y: margin },
            { x: w - margin, y: margin },
            { x: w - margin, y: h - margin },
            { x: margin, y: h - margin }
        ];
        return this.corners;
    }

    applyPerspectiveCorrection(canvas, corners = null) {
        if (!corners) corners = this.corners || this.findDocumentCorners(canvas);
        const w = Math.max(this.dist(corners[0], corners[1]), this.dist(corners[2], corners[3]));
        const h = Math.max(this.dist(corners[0], corners[3]), this.dist(corners[1], corners[2]));
        const src = corners.map(c => [c.x, c.y]);
        const dst = [[0,0], [w,0], [w,h], [0,h]];
        const H = this.calcHomography(src, dst);
        return this.warp(canvas, H, Math.round(w), Math.round(h));
    }

    dist(p1, p2) { return Math.sqrt(Math.pow(p2.x-p1.x,2) + Math.pow(p2.y-p1.y,2)); }

    calcHomography(src, dst) {
        const A=[], b=[];
        for (let i=0; i<4; i++) {
            const [x,y] = src[i], [u,v] = dst[i];
            A.push([x,y,1,0,0,0,-u*x,-u*y]); b.push(u);
            A.push([0,0,0,x,y,1,-v*x,-v*y]); b.push(v);
        }
        const H = this.solve(A, b);
        return [[H[0],H[1],H[2]],[H[3],H[4],H[5]],[H[6],H[7],1]];
    }

    solve(A, b) {
        const n=8, aug=A.map((r,i)=>[...r,b[i]]);
        for (let c=0; c<n; c++) {
            let mr=c;
            for (let r=c+1; r<n; r++) if (Math.abs(aug[r][c])>Math.abs(aug[mr][c])) mr=r;
            [aug[c],aug[mr]]=[aug[mr],aug[c]];
            for (let r=c+1; r<n; r++) {
                const f=aug[r][c]/aug[c][c];
                for (let j=c; j<=n; j++) aug[r][j]-=f*aug[c][j];
            }
        }
        const x=new Array(n).fill(0);
        for (let i=n-1; i>=0; i--) {
            x[i]=aug[i][n];
            for (let j=i+1; j<n; j++) x[i]-=aug[i][j]*x[j];
            x[i]/=aug[i][i];
        }
        return x;
    }

    warp(src, H, dw, dh) {
        const dst = document.createElement('canvas');                
        dst.width=dw; dst.height=dh;
        const sCtx=src.getContext('2d'), dCtx=dst.getContext('2d');
        const sData=sCtx.getImageData(0,0,src.width,src.height);
        const dData=dCtx.createImageData(dw,dh);
        const H_inv = this.invert3x3(H);
        for (let y=0; y<dh; y++) {
            for (let x=0; x<dw; x++) {
                const sx=H_inv[0][0]*x + H_inv[0][1]*y + H_inv[0][2];
                const sy=H_inv[1][0]*x + H_inv[1][1]*y + H_inv[1][2];
                const sz=H_inv[2][0]*x + H_inv[2][1]*y + H_inv[2][2];
                const sx_=Math.round(sx/sz), sy_=Math.round(sy/sz);
                if (sx_>=0 && sx_<src.width && sy_>=0 && sy_<src.height) {
                    const si=(sy_*src.width+sx_)*4, di=(y*dw+x)*4;
                    dData.data[di]=sData.data[si]; dData.data[di+1]=sData.data[si+1];
                    dData.data[di+2]=sData.data[si+2]; dData.data[di+3]=sData.data[si+3];
                }
            }
        }
        dCtx.putImageData(dData,0,0);
        return dst;
    }

    invert3x3(m) {
        const d=m[0][0]*(m[1][1]*m[2][2]-m[1][2]*m[2][1]) - m[0][1]*(m[1][0]*m[2][2]-m[1][2]*m[2][0]) + m[0][2]*(m[1][0]*m[2][1]-m[1][1]*m[2][0]);
        const id=1/d;
        return [[(m[1][1]*m[2][2]-m[1][2]*m[2][1])*id,(m[0][2]*m[2][1]-m[0][1]*m[2][2])*id,(m[0][1]*m[1][2]-m[0][2]*m[1][1])*id],
                [(m[1][2]*m[2][0]-m[1][0]*m[2][2])*id,(m[0][0]*m[2][2]-m[0][2]*m[2][0])*id,(m[0][2]*m[1][0]-m[0][0]*m[1][2])*id],
                [(m[1][0]*m[2][1]-m[1][1]*m[2][0])*id,(m[0][1]*m[2][0]-m[0][0]*m[2][1])*id,(m[0][0]*m[1][1]-m[0][1]*m[1][0])*id]];
    }
}