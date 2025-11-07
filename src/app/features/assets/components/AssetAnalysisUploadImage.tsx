'use client';

import { compressImage } from "@/app/helpers/imageUpload";
import { Asset } from "@/app/types/Asset";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ImagePlus, X } from "lucide-react";
import NextImage from "next/image";
import { useRef, useState, DragEvent, useEffect } from "react";

const dropzoneVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: "easeIn" } },
};

type Props = {
    selectedFile: File | null;
    setSelectedFile: (file: File | null) => void;
    setGeminiAssets: (assets: Asset[]) => void;
    setGroqAssets: (assets: Asset[]) => void; 
}

const AssetAnalysisUploadImage = ({selectedFile, setSelectedFile, setGroqAssets, setGeminiAssets}: Props) => {
    const [isDragActive, setIsDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isCompressing, setIsCompressing] = useState(false);
    const [compressionInfo, setCompressionInfo] = useState<string | null>(null);
    
    // Generate image URL when selectedFile changes
    useEffect(() => {
        if (selectedFile) {
            const url = URL.createObjectURL(selectedFile);
            setImageUrl(url);
            return () => {
                URL.revokeObjectURL(url);
            };
        } else {
            setImageUrl(null);
            setCompressionInfo(null);
        }
    }, [selectedFile]);


    const processFile = async (file: File) => {
        try {
            const processedFile = await compressImage(file, setIsCompressing, setCompressionInfo);
            setSelectedFile(processedFile);
            setGeminiAssets([]);
            setGroqAssets([]);
            console.log('Compression: ' + compressionInfo)
        } catch (error) {
            console.error('Error compressing image:', error);
            setSelectedFile(file);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            await processFile(file);
        }
    };

    const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            await processFile(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    // Remove selected file
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setImageUrl(null);
        setCompressionInfo(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setGroqAssets([]);
        setGeminiAssets([]);
    };
    
    return (
        <div className="min-w-[400px] rounded-lg flex flex-col justify-between">
            <h2 className="text-lg font-semibold mb-4 text-sky-100">Upload Image</h2>
            <div className="flex-grow relative min-h-[200px]">
                <AnimatePresence mode="wait">
                    {!selectedFile ? (
                        <motion.div
                            key="dropzone"
                            variants={dropzoneVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className={`absolute min-h-[200px] inset-0 border-2 border-dashed rounded-lg p-8 cursor-pointer flex flex-col items-center justify-center transition-colors
                                ${isDragActive ? 'border-sky-800 bg-gray-700/50' : 'border-gray-600'}
                            `}
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            <ImagePlus className="h-12 w-12 text-sky-200 mb-2" />
                            <p className="text-gray-300 text-center">
                                Drag & drop or click to select an image file
                            </p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="preview"
                            variants={dropzoneVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <button
                                onClick={handleRemoveFile}
                                className="absolute top-2 right-2 bg-gray-900/50 hover:bg-gray-900/80 cursor-pointer
                                    text-red-400 hover:text-red-300 rounded-full p-1.5 text-xs z-10 transition-all"
                            >
                                <X size={16} />
                            </button>
                            <div
                                className="relative w-full h-full min-h-[200px] overflow-hidden rounded-lg cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                                title="Change image"
                            >
                                {imageUrl && (
                                    <div className="w-full h-full min-h-[200px] relative">
                                        {isCompressing && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                                <div className="text-white">Compressing image...</div>
                                            </div>
                                        )}
                                        <NextImage
                                            src={imageUrl}
                                            alt="Selected image preview"
                                            className="object-contain"
                                            fill
                                            sizes="(max-width: 400px) 100vw"
                                            style={{ transition: 'opacity 0.3s linear' }}
                                            unoptimized 
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AssetAnalysisUploadImage;

