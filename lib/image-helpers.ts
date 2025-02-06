import imageCompression from 'browser-image-compression';

export async function processImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 1, // Max file size in MB
    maxWidthOrHeight: 1920, // Max width/height in pixels
    useWebWorker: true, // Use web worker for better performance
    fileType: 'image/jpeg'
  };

  try {
    const compressedFile = await imageCompression(file, options);
    
    // Create a new file with a .jpg extension
    return new File(
      [compressedFile], 
      file.name.replace(/\.[^/.]+$/, '.jpg'), 
      { 
        type: 'image/jpeg',
        lastModified: Date.now()
      }
    );
  } catch (error) {
    console.error('Error compressing image:', error);
    throw error;
  }
} 
