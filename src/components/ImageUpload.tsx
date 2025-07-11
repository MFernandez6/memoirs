"use client";

import { useState, useRef } from "react";
import { X, Upload, Image as ImageIcon } from "lucide-react";

interface ImageUploadProps {
  onImageUpload: (url: string) => void;
  currentImage?: string;
  onRemoveImage: () => void;
}

export default function ImageUpload({
  onImageUpload,
  currentImage,
  onRemoveImage,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setIsUploading(true);

        // Create a preview URL
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const result = e.target?.result as string;
            setPreviewUrl(result);
            onImageUpload(result);
            setIsUploading(false);
          } catch (error) {
            console.error("Error processing image:", error);
            setIsUploading(false);
          }
        };
        reader.onerror = (error) => {
          console.error("Error reading file:", error);
          setIsUploading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error handling file selection:", error);
        setIsUploading(false);
      }
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl("");
    onRemoveImage();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const displayImage = currentImage || previewUrl;

  return (
    <div className="space-y-4">
      <label className="text-sm font-medium text-[#765555] dark:text-[#ae866c] mb-2 block">
        Story Image (Optional)
      </label>

      {displayImage ? (
        <div className="mb-4 flex justify-center">
          <div className="relative inline-block rounded-lg overflow-hidden border-2 border-[#ae866c]/30 dark:border-[#765555]/30 shadow-lg group max-w-md">
            <div className="transition-all duration-500 ease-in-out rotated-image-container">
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
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg backdrop-blur-sm"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`
            border-2 border-dashed border-[#ae866c]/30 dark:border-[#765555]/30
            rounded-lg p-6 text-center transition-all duration-300
            hover:border-[#765555] dark:hover:border-[#ae866c]
            bg-white/50 dark:bg-[#543f3f]/50 backdrop-blur-sm
            ${
              isUploading
                ? "opacity-50"
                : "hover:bg-white/70 dark:hover:bg-[#543f3f]/70"
            }
            cursor-pointer
          `}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 bg-gradient-to-br from-[#765555] to-[#ae866c] rounded-full flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-[#543f3f] dark:text-[#ead8c2] font-medium">
                Drop your image here
              </p>
              <p className="text-[#765555]/60 dark:text-[#ae866c]/60 text-sm">
                or click to browse
              </p>
            </div>
            <div className="flex items-center gap-2 bg-[#765555] hover:bg-[#543f3f] dark:bg-[#ae866c] dark:hover:bg-[#765555] text-white px-4 py-2 rounded-md transition-colors duration-300">
              <Upload className="w-4 h-4" />
              <span>Choose Image</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
