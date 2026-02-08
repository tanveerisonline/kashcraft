import { NextResponse } from "next/server";

// Mock function to simulate file upload to cloud storage
async function uploadFileToCloudStorage(file: File): Promise<string> {
  // In a real application, you would integrate with a cloud storage service like AWS S3, Google Cloud Storage, or Cloudinary.
  // This mock simply returns a placeholder URL.
  console.log(
    `Simulating upload of file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`
  );
  const mockFileUrl = `https://example.com/uploads/${Date.now()}-${file.name}`;
  return Promise.resolve(mockFileUrl);
}

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: Uploads a file to cloud storage
 *     description: Uploads a single file (JPEG, PNG, or PDF, max 5MB) to a simulated cloud storage and returns its URL.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload (JPEG, PNG, or PDF, max 5MB).
 *     responses:
 *       201:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 url:
 *                   type: string
 *                   format: url
 *                   example: https://example.com/uploads/1678886400000-my-image.jpg
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No file uploaded | File size exceeds 5MB limit | File type image/gif not allowed. Allowed types: image/jpeg, image/png, application/pdf
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal server error
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }

    // Basic file validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "application/pdf"];

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ message: "File size exceeds 5MB limit" }, { status: 400 });
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          message: `File type ${file.type} not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const fileUrl = await uploadFileToCloudStorage(file);

    return NextResponse.json(
      { message: "File uploaded successfully", url: fileUrl },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
