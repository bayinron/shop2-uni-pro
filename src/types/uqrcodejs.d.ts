// src/types/uqrcodejs.d.ts

declare module 'uqrcodejs' {
    export default class UQRCode {
        data: string;
        size: number;
        canvasContext: any;
        make(): void;
        drawCanvas(): void;
    }
}