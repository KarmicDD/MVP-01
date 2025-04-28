import path from 'path';
import fs from 'fs';
import DocumentProcessingService from './services/DocumentProcessingService';
import EnhancedDocumentProcessingService from './services/EnhancedDocumentProcessingService';

// Create test directory if it doesn't exist
const testDir = path.join(__dirname, '..', 'test-files');
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Create a simple Excel file for testing
async function createTestExcelFile() {
  const ExcelJS = require('exceljs');
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Test Sheet');
  
  // Add header row
  worksheet.addRow(['ID', 'Name', 'Age', 'Email']);
  
  // Add data rows
  worksheet.addRow([1, 'John Doe', 30, 'john@example.com']);
  worksheet.addRow([2, 'Jane Smith', 25, 'jane@example.com']);
  worksheet.addRow([3, 'Bob Johnson', 40, 'bob@example.com']);
  
  // Save the file
  const excelFilePath = path.join(testDir, 'test-excel.xlsx');
  await workbook.xlsx.writeFile(excelFilePath);
  console.log(`Test Excel file created at: ${excelFilePath}`);
  return excelFilePath;
}

// Create a simple CSV file for testing
async function createTestCsvFile() {
  const csvContent = 
    'ID,Name,Age,Email\n' +
    '1,John Doe,30,john@example.com\n' +
    '2,Jane Smith,25,jane@example.com\n' +
    '3,Bob Johnson,40,bob@example.com';
  
  const csvFilePath = path.join(testDir, 'test-csv.csv');
  fs.writeFileSync(csvFilePath, csvContent);
  console.log(`Test CSV file created at: ${csvFilePath}`);
  return csvFilePath;
}

// Test DocumentProcessingService
async function testDocumentProcessingService(excelFilePath: string, csvFilePath: string) {
  console.log('\n--- Testing DocumentProcessingService ---');
  
  try {
    console.log('\nProcessing Excel file:');
    const excelResult = await DocumentProcessingService.extractExcelData(excelFilePath);
    console.log(excelResult);
    
    console.log('\nProcessing CSV file:');
    const csvResult = await DocumentProcessingService.extractCsvData(csvFilePath);
    console.log(csvResult);
    
    console.log('\nDocumentProcessingService tests passed!');
  } catch (error) {
    console.error('DocumentProcessingService tests failed:', error);
  }
}

// Test EnhancedDocumentProcessingService
async function testEnhancedDocumentProcessingService(excelFilePath: string, csvFilePath: string) {
  console.log('\n--- Testing EnhancedDocumentProcessingService ---');
  
  try {
    console.log('\nProcessing Excel file:');
    const excelResult = await EnhancedDocumentProcessingService.extractExcelData(excelFilePath);
    console.log(excelResult);
    
    console.log('\nProcessing CSV file:');
    const csvResult = await EnhancedDocumentProcessingService.extractCsvData(csvFilePath);
    console.log(csvResult);
    
    console.log('\nEnhancedDocumentProcessingService tests passed!');
  } catch (error) {
    console.error('EnhancedDocumentProcessingService tests failed:', error);
  }
}

// Run all tests
async function runTests() {
  try {
    const excelFilePath = await createTestExcelFile();
    const csvFilePath = await createTestCsvFile();
    
    await testDocumentProcessingService(excelFilePath, csvFilePath);
    await testEnhancedDocumentProcessingService(excelFilePath, csvFilePath);
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Execute tests
runTests();
