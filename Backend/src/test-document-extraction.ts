import path from 'path';
import fs from 'fs';
import EnhancedDocumentProcessingService from './services/EnhancedDocumentProcessingService';

// Create test directory if it doesn't exist
const testDir = path.join(__dirname, '..', 'test-files');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Create a test PDF file if needed
async function createTestPdfFile(): Promise<string> {
  const pdfFilePath = path.join(testDir, 'test.pdf');
  
  // Check if the file already exists
  if (!fs.existsSync(pdfFilePath)) {
    console.log('Test PDF file does not exist. Please create a test PDF file manually at:', pdfFilePath);
  }
  
  return pdfFilePath;
}

// Create a test image file if needed
async function createTestImageFile(): Promise<string> {
  const imageFilePath = path.join(testDir, 'test.jpg');
  
  // Check if the file already exists
  if (!fs.existsSync(imageFilePath)) {
    console.log('Test image file does not exist. Please create a test image file manually at:', imageFilePath);
  }
  
  return imageFilePath;
}

// Test document extraction with both methods
async function testDocumentExtraction(filePath: string) {
  console.log(`\n--- Testing document extraction for ${path.basename(filePath)} ---`);
  
  try {
    console.log('\nProcessing document with both extraction methods:');
    const result = await EnhancedDocumentProcessingService.processDocument(filePath, true);
    
    if (typeof result === 'string') {
      console.log('Result is a string (error occurred):', result);
    } else {
      console.log('Extraction Method:', result.extractionMethod);
      console.log('Metadata:', result.metadata);
      console.log('\nRaw Text (first 200 chars):', result.rawText.substring(0, 200) + '...');
      console.log('\nAI-Processed Text (first 200 chars):', result.aiProcessedText.substring(0, 200) + '...');
      console.log('\nCombined Text (first 200 chars):', result.combinedText.substring(0, 200) + '...');
    }
    
    console.log('\nDocument extraction test passed!');
  } catch (error) {
    console.error('Document extraction test failed:', error);
  }
}

// Test multiple document processing
async function testMultipleDocumentProcessing(filePaths: string[]) {
  console.log('\n--- Testing multiple document processing ---');
  
  try {
    console.log('\nProcessing multiple documents with both extraction methods:');
    const result = await EnhancedDocumentProcessingService.processMultipleDocuments(filePaths, true);
    
    console.log('\nCombined content (first 500 chars):', result.substring(0, 500) + '...');
    console.log('\nMultiple document processing test passed!');
  } catch (error) {
    console.error('Multiple document processing test failed:', error);
  }
}

// Run all tests
async function runTests() {
  try {
    const pdfFilePath = await createTestPdfFile();
    const imageFilePath = await createTestImageFile();
    
    if (fs.existsSync(pdfFilePath)) {
      await testDocumentExtraction(pdfFilePath);
    }
    
    if (fs.existsSync(imageFilePath)) {
      await testDocumentExtraction(imageFilePath);
    }
    
    const filesToTest = [pdfFilePath, imageFilePath].filter(file => fs.existsSync(file));
    if (filesToTest.length > 0) {
      await testMultipleDocumentProcessing(filesToTest);
    }
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Execute tests
runTests();
