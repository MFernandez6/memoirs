"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload, Plus } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string, imageIndex?: number) => void;
  currentImage?: string;
  currentImage2?: string;
  onRemoveImage: (imageIndex?: number) => void;
  allowMultiple?: boolean;
}

export default function ImageUpload({
  onImageUpload,
  currentImage,
  currentImage2,
  onRemoveImage,
  allowMultiple = true,
}: ImageUploadProps) {
  const [displayImage, setDisplayImage] = useState<string>(currentImage || "");
  const [displayImage2, setDisplayImage2] = useState<string>(
    currentImage2 || ""
  );
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      if (res && res[0]) {
        const imageUrl = res[0].url;
        if (uploadingIndex === 1) {
          setDisplayImage2(imageUrl);
          onImageUpload(imageUrl, 1);
        } else {
          setDisplayImage(imageUrl);
          onImageUpload(imageUrl, 0);
        }
      }
      setUploadingIndex(null);
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
      setUploadingIndex(null);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[], imageIndex: number = 0) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploadingIndex(imageIndex);

      try {
        await startUpload([file]);
      } catch (error) {
        console.error("Upload error:", error);
        alert("Failed to upload image. Please try again.");
        setUploadingIndex(null);
      }
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => onDrop(files, 0),
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: false,
  });

  const {
    getRootProps: getRootProps2,
    getInputProps: getInputProps2,
    isDragActive: isDragActive2,
  } = useDropzone({
    onDrop: (files) => onDrop(files, 1),
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    multiple: false,
  });

  const handleRemoveImage = (imageIndex: number = 0) => {
    if (imageIndex === 0) {
      setDisplayImage("");
      onRemoveImage(0);
    } else {
      setDisplayImage2("");
      onRemoveImage(1);
    }
  };

  const renderImagePreview = (imageUrl: string, imageIndex: number) => (
    <div className="mb-3 sm:mb-4 flex justify-center">
      <div className="relative inline-block rounded-lg overflow-hidden border-2 border-[#a39170]/30 shadow-lg group max-w-full sm:max-w-md">
        <div className="transition-all duration-500 ease-in-out">
          <img
            src={imageUrl}
            alt={`Story image ${imageIndex + 1}`}
            className="w-full max-h-60 sm:max-h-80 md:max-h-96 object-contain transition-all duration-500"
            style={{ background: "transparent" }}
          />
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <button
            onClick={() => handleRemoveImage(imageIndex)}
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[#948363]/80 hover:bg-[#948363] text-white p-1.5 sm:p-2 rounded-full shadow-lg"
            title={`Remove image ${imageIndex + 1}`}
          >
            <X className="w-3 h-3 sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderUploadArea = (imageIndex: number = 0, isSecondImage = false) => {
    const rootProps = imageIndex === 0 ? getRootProps : getRootProps2;
    const inputProps = imageIndex === 0 ? getInputProps : getInputProps2;
    const dragActive = imageIndex === 0 ? isDragActive : isDragActive2;
    const isUploadingThis = uploadingIndex === imageIndex || isUploading;

    return (
      <div
        {...rootProps()}
        className={`border-2 border-dashed rounded-lg p-4 sm:p-6 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? "border-[#a39170] bg-[#a39170]/10"
            : "border-[#c9c1a7] hover:border-[#a39170] hover:bg-[#a39170]/5"
        }`}
      >
        <input {...inputProps()} />
        <div className="flex flex-col items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#948363]/10 rounded-full flex items-center justify-center">
            {isSecondImage ? (
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-[#948363]" />
            ) : (
              <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-[#948363]" />
            )}
          </div>
          <div>
            <p className="text-[#948363] font-medium mb-1 text-xs sm:text-sm">
              {isSecondImage
                ? "Add second image"
                : dragActive
                ? "Drop your image here"
                : "Drag & drop an image here"}
            </p>
            {!isSecondImage && (
              <p className="text-[#948363]/60 text-xs sm:text-sm">
                or click to browse files
              </p>
            )}
          </div>
          {isUploadingThis && (
            <div className="flex items-center gap-2 text-[#948363]">
              <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-[#948363] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs sm:text-sm">Uploading...</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <label className="text-sm font-medium text-[#948363] mb-2 block">
        Images (Optional)
      </label>

      {/* First Image */}
      {displayImage ? renderImagePreview(displayImage, 0) : renderUploadArea(0)}

      {/* Second Image - Only show if multiple images are allowed */}
      {allowMultiple && (
        <>
          {displayImage2 ? (
            renderImagePreview(displayImage2, 1)
          ) : (
            <div className="mt-3 sm:mt-4">{renderUploadArea(1, true)}</div>
          )}
        </>
      )}
    </div>
  );
}
