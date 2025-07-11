"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  onRemoveImage: () => void;
}

export default function ImageUpload({
  onImageUpload,
  currentImage,
  onRemoveImage,
}: ImageUploadProps) {
  const [displayImage, setDisplayImage] = useState<string>(currentImage || "");
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/uploadthing", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.url;
          setDisplayImage(imageUrl);
          onImageUpload(imageUrl);
        } else {
          console.error("Upload failed");
          alert("Failed to upload image. Please try again.");
        }
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload image. Please try again.");
      } finally {
        setIsUploading(false);
      }
    },
    [onImageUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: false,
  });

  const handleRemoveImage = () => {
    setDisplayImage("");
    onRemoveImage();
  };

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-[#948363] mb-2 block">
        Image (Optional)
      </label>

      {displayImage ? (
        <div className="mb-4 flex justify-center">
          <div className="relative inline-block rounded-lg overflow-hidden border-2 border-[#a39170]/30 shadow-lg group max-w-md">
            <div className="transition-all duration-500 ease-in-out">
              <img
                src={displayImage}
                alt="Story image"
                className="w-full max-h-80 object-contain transition-all duration-500"
                style={{ background: "transparent" }}
              />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
              <button
                onClick={handleRemoveImage}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#948363]/80 hover:bg-[#948363] text-white p-2 rounded-full shadow-lg"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
            isDragActive
              ? "border-[#a39170] bg-[#a39170]/10"
              : "border-[#c9c1a7] hover:border-[#a39170] hover:bg-[#a39170]/5"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-[#948363]/10 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-[#948363]" />
            </div>
            <div>
              <p className="text-[#948363] font-medium mb-1">
                {isDragActive
                  ? "Drop your image here"
                  : "Drag & drop an image here"}
              </p>
              <p className="text-[#948363]/60 text-sm">
                or click to browse files
              </p>
            </div>
            {isUploading && (
              <div className="flex items-center gap-2 text-[#948363]">
                <div className="w-4 h-4 border-2 border-[#948363] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
