import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
      maxFileCount: 1,
    },
  })
    .middleware(async () => {
      // Return metadata for the upload
      return { uploadedAt: new Date() };
    })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete for file:", file.name);
      console.log("File URL:", file.url);
      console.log("File size:", file.size);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
