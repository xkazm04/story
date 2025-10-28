'use client';

import Image from "next/image"

const exampleImages = [
    {
        path: "/examples/weapon_pack.jpg",
        name: "weapon_pack.jpg"
    },
    {
        path: "/examples/neo.jpg",
        name: "neo.jpg"
    },
    {
        path: "/examples/superman.jpg",
        name: "superman.jpg"
    }
];

type Props = {
    setSelectedFile: (file: File | null) => void;
}

const AssetAnalysisExamples = ({ setSelectedFile }: Props) => {

    const handleImageClick = async (imagePath: string, imageName: string) => {
        try {
            const response = await fetch(imagePath);
            const blob = await response.blob();
            const file = new File([blob], imageName, { type: blob.type });
            setSelectedFile(file);
        } catch (error) {
            console.error("Error loading example image:", error);
        }
    };

    return (
        <div className="flex bg-gray-800 rounded-lg border p-4 border-gray-700 flex-col">
            <h3 className="text-sm font-medium text-gray-200">Image examples</h3>
            <h4 className={`text-xs font-mono transition-all duration-200 ease-linear text-gray-500`}>
                Use predefined or upload whatever you want
            </h4>
            <div className="flex flex-row gap-4 py-2">
                {exampleImages.map((image, index) => (
                    <div
                        key={index}
                        className="cursor-pointer transition-transform hover:scale-105 flex items-center"
                        onClick={() => handleImageClick(image.path, image.name)}
                        style={{ maxWidth: '180px', maxHeight: '120px' }}
                    >
                        <Image
                            src={image.path}
                            alt={`Example ${index + 1}`}
                            className="rounded-lg shadow-md object-contain"
                            width={180}
                            height={120}
                            style={{ maxWidth: '100%', maxHeight: '100%', height: 'auto', width: 'auto' }}
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default AssetAnalysisExamples;

