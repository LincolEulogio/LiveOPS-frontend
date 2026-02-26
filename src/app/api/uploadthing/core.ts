import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  assetUploader: f({
    image: { maxFileSize: "16MB", maxFileCount: 10 },
    video: { maxFileSize: "512MB", maxFileCount: 5 },
    audio: { maxFileSize: "64MB", maxFileCount: 5 },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // Normally you would get the user from the request here
      // For now, we'll just allow all
      return {  };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete", file.url);
      // Wait for it to be ready
      return { url: file.url, type: file.type, name: file.name, size: file.size };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
