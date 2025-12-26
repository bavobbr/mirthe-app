import React from 'react';

interface CameraModalProps {
    videoRef: React.RefObject<HTMLVideoElement>;
    canvasRef: React.RefObject<HTMLCanvasElement>;
    stopCamera: () => void;
    capturePhoto: () => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({
    videoRef,
    canvasRef,
    stopCamera,
    capturePhoto,
}) => {
    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
            <div className="relative w-full max-w-md aspect-[3/4] bg-gray-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                <canvas ref={canvasRef} className="hidden" />
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-8">
                    <button onClick={stopCamera} className="bg-white/20 p-4 rounded-full text-white">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <button
                        onClick={capturePhoto}
                        className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 active:scale-90 transition-transform"
                    />
                </div>
            </div>
        </div>
    );
};
