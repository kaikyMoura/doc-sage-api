import Tesseract from 'tesseract.js';

/**
 * Extract text from an image at a given file path using Tesseract.js.
 *
 * @param filePath The path to the image file containing the text.
 * @returns A promise that resolves with the extracted text as a string.
 */
export const extractTextFromImage = async (
  filePath: string,
): Promise<string> => {
  const result = await Tesseract.recognize(filePath, 'eng');
  return result.data.text;
};
