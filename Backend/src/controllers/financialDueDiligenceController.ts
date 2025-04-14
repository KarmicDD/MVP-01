import { Request, Response } from 'express';
import FinancialReport, { IFinancialReport } from '../models/Analytics/FinancialReport';
import DocumentModel from '../models/Profile/Document';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import multer from 'multer';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/financial');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter to restrict file types
const fileFilter = (req: any, file: any, cb: multer.FileFilterCallback) => {
    // Accept only PDFs, Excel files, and CSVs
    const allowedFileTypes = [
        'application/pdf',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/json'
    ];

    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only PDF, Excel, CSV, and JSON files are allowed.'));
    }
};

export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024 // 15MB limit
    }
});

// Upload financial documents
export const uploadFinancialDocuments = async (req: Request & { files?: any }, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
            res.status(400).json({ message: 'No files uploaded' });
            return;
        }

        const files = Array.isArray(req.files) ? req.files : [req.files];
        const uploadedDocuments = [];

        for (const file of files) {
            // Store relative path instead of absolute path
            const relativePath = path.relative(path.join(__dirname, '../..'), file.path);

            const document = new DocumentModel({
                userId: req.user.userId,
                fileName: file.filename,
                originalName: file.originalname,
                fileType: file.mimetype,
                fileSize: file.size,
                filePath: relativePath, // Store relative path
                description: req.body.description || '',
                documentType: 'financial',
                isPublic: false
            });

            await document.save();
            uploadedDocuments.push({
                id: document._id,
                fileName: document.fileName,
                originalName: document.originalName,
                fileType: document.fileType,
                fileSize: document.fileSize
            });
        }

        res.status(201).json({
            message: 'Financial documents uploaded successfully',
            documents: uploadedDocuments
        });
    } catch (error) {
        console.error('Financial document upload error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Generate financial analysis report
export const generateFinancialAnalysis = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { documentIds, companyName, reportType } = req.body;

        if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
            res.status(400).json({ message: 'No documents selected for analysis' });
            return;
        }

        if (!companyName) {
            res.status(400).json({ message: 'Company name is required' });
            return;
        }

        if (!reportType || !['analysis', 'audit'].includes(reportType)) {
            res.status(400).json({ message: 'Invalid report type' });
            return;
        }

        // Fetch the documents
        const documents = await DocumentModel.find({
            _id: { $in: documentIds },
            userId: req.user.userId
        });

        if (documents.length === 0) {
            res.status(404).json({ message: 'No valid documents found' });
            return;
        }

        // Extract document content for analysis
        const documentContents = [];
        for (const doc of documents) {
            try {
                const fileContent = fs.readFileSync(doc.filePath);

                // Process based on file type
                if (doc.fileType === 'application/pdf') {
                    // For PDFs, we'd use a PDF parsing library here
                    // For now, just add the file path
                    documentContents.push({
                        id: doc._id,
                        type: 'pdf',
                        path: doc.filePath,
                        name: doc.originalName
                    });
                } else if (doc.fileType === 'text/csv') {
                    // For CSVs, parse the content
                    documentContents.push({
                        id: doc._id,
                        type: 'csv',
                        content: fileContent.toString(),
                        name: doc.originalName
                    });
                } else if (doc.fileType.includes('spreadsheet') || doc.fileType.includes('excel')) {
                    // For Excel files, we'd use an Excel parsing library here
                    // For now, just add the file path
                    documentContents.push({
                        id: doc._id,
                        type: 'excel',
                        path: doc.filePath,
                        name: doc.originalName
                    });
                } else if (doc.fileType === 'application/json') {
                    // For JSON files, parse the content
                    documentContents.push({
                        id: doc._id,
                        type: 'json',
                        content: JSON.parse(fileContent.toString()),
                        name: doc.originalName
                    });
                }
            } catch (error) {
                console.error(`Error processing document ${doc._id}:`, error);
                // Continue with other documents
            }
        }

        // In a real implementation, we would send the document contents to an AI service
        // For now, generate a mock report based on the report type
        const report = await generateMockReport(companyName, reportType, documentIds);

        // Save the report to the database
        const financialReport = new FinancialReport({
            userId: req.user.userId,
            companyName,
            reportType,
            generatedBy: 'KarmicDD AI',
            summary: report.summary,
            metrics: report.metrics,
            recommendations: report.recommendations,
            riskFactors: report.riskFactors,
            complianceItems: report.complianceItems,
            documentSources: documentIds,
            status: 'final'
        });

        await financialReport.save();

        res.status(200).json({
            message: 'Financial report generated successfully',
            reportId: financialReport._id,
            report
        });
    } catch (error) {
        console.error('Generate financial analysis error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get financial reports for a user
export const getFinancialReports = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const reports = await FinancialReport.find({ userId: req.user.userId })
            .sort({ createdAt: -1 })
            .select('-financialStatements -ratioAnalysis -taxCompliance');

        res.status(200).json({ reports });
    } catch (error) {
        console.error('Get financial reports error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a specific financial report
export const getFinancialReport = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { reportId } = req.params;

        const report = await FinancialReport.findOne({
            _id: reportId,
            userId: req.user.userId
        });

        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }

        res.status(200).json({ report });
    } catch (error) {
        console.error('Get financial report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Generate PDF report
export const generatePdfReport = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user?.userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const { reportId } = req.params;

        const report = await FinancialReport.findOne({
            _id: reportId,
            userId: req.user.userId
        });

        if (!report) {
            res.status(404).json({ message: 'Report not found' });
            return;
        }

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const timesRomanBoldFont = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

        // Add a page to the document
        const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
        const { width, height } = page.getSize();

        // Set font size and line height
        const fontSize = 12;
        const lineHeight = fontSize * 1.2;

        // Add title
        page.drawText(`${report.reportType === 'analysis' ? 'Financial Analysis' : 'Audit Report'}`, {
            x: 50,
            y: height - 50,
            size: 24,
            font: timesRomanBoldFont,
            color: rgb(0, 0, 0.8)
        });

        // Add company name
        page.drawText(`Company: ${report.companyName}`, {
            x: 50,
            y: height - 80,
            size: 16,
            font: timesRomanBoldFont
        });

        // Add report date
        page.drawText(`Report Date: ${new Date(report.reportDate).toLocaleDateString()}`, {
            x: 50,
            y: height - 100,
            size: 12,
            font: timesRomanFont
        });

        // Add summary
        page.drawText('Executive Summary:', {
            x: 50,
            y: height - 130,
            size: 14,
            font: timesRomanBoldFont
        });

        // Split summary into lines to fit the page width
        const summaryLines = splitTextIntoLines(report.summary, 70);
        let currentY = height - 150;

        for (const line of summaryLines) {
            page.drawText(line, {
                x: 50,
                y: currentY,
                size: fontSize,
                font: timesRomanFont
            });
            currentY -= lineHeight;
        }

        // Add metrics section
        currentY -= 20;
        page.drawText('Key Financial Metrics:', {
            x: 50,
            y: currentY,
            size: 14,
            font: timesRomanBoldFont
        });
        currentY -= 20;

        for (const metric of report.metrics) {
            page.drawText(`${metric.name}: ${metric.value} (${metric.status})`, {
                x: 50,
                y: currentY,
                size: fontSize,
                font: timesRomanFont
            });
            currentY -= lineHeight;

            if (metric.description) {
                const descLines = splitTextIntoLines(metric.description, 70);
                for (const line of descLines) {
                    page.drawText(`  ${line}`, {
                        x: 50,
                        y: currentY,
                        size: fontSize - 2,
                        font: timesRomanFont
                    });
                    currentY -= lineHeight - 2;
                }
            }
        }

        // Add recommendations section
        currentY -= 20;
        page.drawText('Recommendations:', {
            x: 50,
            y: currentY,
            size: 14,
            font: timesRomanBoldFont
        });
        currentY -= 20;

        for (const recommendation of report.recommendations) {
            const recLines = splitTextIntoLines(`• ${recommendation}`, 70);
            for (const line of recLines) {
                page.drawText(line, {
                    x: 50,
                    y: currentY,
                    size: fontSize,
                    font: timesRomanFont
                });
                currentY -= lineHeight;
            }
        }

        // Add risk factors section
        if (currentY < 150) {
            // Add a new page if we're running out of space
            const newPage = pdfDoc.addPage([595.28, 841.89]);
            currentY = height - 50;
        } else {
            currentY -= 20;
        }

        page.drawText('Risk Factors:', {
            x: 50,
            y: currentY,
            size: 14,
            font: timesRomanBoldFont
        });
        currentY -= 20;

        for (const risk of report.riskFactors) {
            page.drawText(`${risk.category} (${risk.severity})`, {
                x: 50,
                y: currentY,
                size: fontSize,
                font: timesRomanBoldFont
            });
            currentY -= lineHeight;

            const descLines = splitTextIntoLines(risk.description, 70);
            for (const line of descLines) {
                page.drawText(`  ${line}`, {
                    x: 50,
                    y: currentY,
                    size: fontSize,
                    font: timesRomanFont
                });
                currentY -= lineHeight;
            }

            page.drawText(`  Impact: ${risk.impact}`, {
                x: 50,
                y: currentY,
                size: fontSize,
                font: timesRomanFont
            });
            currentY -= lineHeight;

            if (risk.mitigation) {
                const mitigationLines = splitTextIntoLines(`  Mitigation: ${risk.mitigation}`, 70);
                for (const line of mitigationLines) {
                    page.drawText(line, {
                        x: 50,
                        y: currentY,
                        size: fontSize,
                        font: timesRomanFont
                    });
                    currentY -= lineHeight;
                }
            }

            currentY -= 10;
        }

        // Add compliance items for audit reports
        if (report.reportType === 'audit' && report.complianceItems && report.complianceItems.length > 0) {
            if (currentY < 150) {
                // Add a new page if we're running out of space
                const newPage = pdfDoc.addPage([595.28, 841.89]);
                currentY = height - 50;
            } else {
                currentY -= 20;
            }

            page.drawText('Compliance Assessment:', {
                x: 50,
                y: currentY,
                size: 14,
                font: timesRomanBoldFont
            });
            currentY -= 20;

            for (const item of report.complianceItems) {
                page.drawText(`${item.requirement} (${item.status})`, {
                    x: 50,
                    y: currentY,
                    size: fontSize,
                    font: timesRomanBoldFont
                });
                currentY -= lineHeight;

                const detailLines = splitTextIntoLines(item.details, 70);
                for (const line of detailLines) {
                    page.drawText(`  ${line}`, {
                        x: 50,
                        y: currentY,
                        size: fontSize,
                        font: timesRomanFont
                    });
                    currentY -= lineHeight;
                }

                if (item.recommendation) {
                    const recLines = splitTextIntoLines(`  Recommendation: ${item.recommendation}`, 70);
                    for (const line of recLines) {
                        page.drawText(line, {
                            x: 50,
                            y: currentY,
                            size: fontSize,
                            font: timesRomanFont
                        });
                        currentY -= lineHeight;
                    }
                }

                currentY -= 10;
            }
        }

        // Add footer
        page.drawText('Generated by KarmicDD Financial Due Diligence', {
            x: width / 2 - 120,
            y: 30,
            size: 10,
            font: timesRomanFont
        });

        // Serialize the PDF to bytes
        const pdfBytes = await pdfDoc.save();

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${report.companyName.replace(/\s+/g, '_')}_${report.reportType}_report.pdf"`);

        // Send the PDF as the response
        res.send(Buffer.from(pdfBytes));
    } catch (error) {
        console.error('Generate PDF report error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper function to split text into lines
function splitTextIntoLines(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        if (currentLine.length + word.length + 1 <= maxCharsPerLine) {
            currentLine += (currentLine.length > 0 ? ' ' : '') + word;
        } else {
            lines.push(currentLine);
            currentLine = word;
        }
    }

    if (currentLine.length > 0) {
        lines.push(currentLine);
    }

    return lines;
}

// Helper function to generate mock reports for development
async function generateMockReport(companyName: string, reportType: 'analysis' | 'audit', documentIds: string[]): Promise<any> {
    // Common metrics for both report types
    const commonMetrics = [
        {
            name: "Burn Rate",
            value: "₹45,00,000/month",
            status: "warning",
            description: "Monthly cash outflow is higher than industry average.",
            trend: "up"
        },
        {
            name: "Runway",
            value: "18 months",
            status: "good",
            description: "Company has sufficient runway based on current burn rate.",
            trend: "stable"
        },
        {
            name: "Gross Margin",
            value: "68%",
            status: "good",
            description: "Healthy gross margin above industry average of 62%.",
            trend: "up",
            comparisonValue: "62%",
            comparisonLabel: "Industry Average"
        },
        {
            name: "Customer Acquisition Cost (CAC)",
            value: "₹1,20,000",
            status: "warning",
            description: "CAC is higher than ideal for the industry segment.",
            trend: "up"
        },
        {
            name: "Lifetime Value (LTV)",
            value: "₹8,50,000",
            status: "good",
            description: "Strong customer lifetime value.",
            trend: "stable"
        },
        {
            name: "LTV:CAC Ratio",
            value: "7.1:1",
            status: "good",
            description: "Excellent ratio indicating good unit economics.",
            trend: "stable",
            comparisonValue: "3:1",
            comparisonLabel: "Target Minimum"
        }
    ];

    // Common risk factors
    const commonRiskFactors = [
        {
            category: "Cash Flow",
            description: "Current burn rate may lead to cash flow issues if growth slows or funding is delayed.",
            severity: "medium",
            impact: "Could reduce runway by 30% if not addressed.",
            mitigation: "Implement stricter expense controls and prioritize revenue-generating activities."
        },
        {
            category: "Customer Concentration",
            description: "Heavy dependence on top 3 customers who account for 45% of revenue.",
            severity: "high",
            impact: "Loss of any major customer would significantly impact revenue and growth.",
            mitigation: "Diversify customer base and implement key account retention strategies."
        },
        {
            category: "Market Competition",
            description: "Increasing competition in the market with 3 new entrants in the last 6 months.",
            severity: "medium",
            impact: "May lead to price pressure and increased CAC.",
            mitigation: "Focus on product differentiation and strengthen value proposition."
        }
    ];

    // Common recommendations
    const commonRecommendations = [
        "Focus on reducing customer acquisition costs by optimizing marketing channels and improving conversion rates.",
        "Implement stricter cash flow management practices to extend runway.",
        "Consider raising additional capital in the next 6-9 months to support growth initiatives.",
        "Explore opportunities to increase pricing for enterprise customers to improve margins."
    ];

    if (reportType === 'analysis') {
        // Financial analysis specific content
        const analysisMetrics = [
            ...commonMetrics,
            {
                name: "MRR Growth Rate",
                value: "12% monthly",
                status: "good",
                description: "Strong monthly recurring revenue growth.",
                trend: "up"
            },
            {
                name: "Churn Rate",
                value: "2.8% monthly",
                status: "warning",
                description: "Slightly higher than industry benchmark of 2%.",
                trend: "stable",
                comparisonValue: "2%",
                comparisonLabel: "Industry Benchmark"
            },
            {
                name: "Operating Expense Ratio",
                value: "82%",
                status: "warning",
                description: "Higher than ideal, indicating potential inefficiencies.",
                trend: "down"
            }
        ];

        const analysisRiskFactors = [
            ...commonRiskFactors,
            {
                category: "Scalability",
                description: "Current infrastructure may not support projected growth over next 12 months.",
                severity: "medium",
                impact: "Could limit growth and increase technical debt.",
                mitigation: "Invest in infrastructure improvements and technical debt reduction."
            },
            {
                category: "Pricing Strategy",
                description: "Current pricing model may not be optimized for maximum revenue capture.",
                severity: "low",
                impact: "Potential revenue leakage of 15-20%.",
                mitigation: "Conduct pricing analysis and implement value-based pricing."
            }
        ];

        const analysisRecommendations = [
            ...commonRecommendations,
            "Optimize pricing strategy to improve revenue per customer.",
            "Invest in customer success to reduce churn rate.",
            "Implement more efficient operational processes to reduce operating expense ratio."
        ];

        return {
            summary: `${companyName} shows strong growth potential with healthy gross margins and good unit economics. The company has a solid runway of 18 months based on current burn rate, but should focus on optimizing customer acquisition costs and reducing churn. The financial analysis indicates several areas for improvement to enhance profitability and ensure sustainable growth.`,
            metrics: analysisMetrics,
            recommendations: analysisRecommendations,
            riskFactors: analysisRiskFactors
        };
    } else {
        // Audit report specific content
        const auditMetrics = [
            ...commonMetrics,
            {
                name: "Debt-to-Equity Ratio",
                value: "0.35",
                status: "good",
                description: "Low leverage indicating financial stability.",
                trend: "stable"
            },
            {
                name: "Current Ratio",
                value: "1.8",
                status: "good",
                description: "Good short-term liquidity position.",
                trend: "up"
            },
            {
                name: "Return on Assets",
                value: "8.5%",
                status: "warning",
                description: "Below industry average of 12%.",
                trend: "up",
                comparisonValue: "12%",
                comparisonLabel: "Industry Average"
            }
        ];

        const auditRiskFactors = [
            ...commonRiskFactors,
            {
                category: "Regulatory Compliance",
                description: "Potential gaps in GST compliance documentation.",
                severity: "high",
                impact: "Could result in penalties and regulatory scrutiny.",
                mitigation: "Conduct comprehensive GST compliance review and address gaps."
            },
            {
                category: "Financial Controls",
                description: "Weaknesses in internal financial controls, particularly in expense approval process.",
                severity: "medium",
                impact: "Increases risk of financial misstatement and inefficiencies.",
                mitigation: "Implement stronger internal controls and approval workflows."
            }
        ];

        const auditRecommendations = [
            ...commonRecommendations,
            "Strengthen internal financial controls, particularly around expense approvals.",
            "Address GST compliance documentation gaps immediately.",
            "Improve financial reporting processes to ensure timely and accurate statements."
        ];

        const complianceItems = [
            {
                requirement: "Companies Act, 2013 - Financial Statement Preparation",
                status: "compliant",
                details: "Financial statements are prepared in accordance with the requirements of the Companies Act, 2013.",
                severity: "low"
            },
            {
                requirement: "GST Filing and Documentation",
                status: "partial",
                details: "GST returns have been filed on time, but supporting documentation for input tax credits is incomplete for Q2 and Q3.",
                severity: "high",
                recommendation: "Implement a systematic process for maintaining GST documentation and conduct a comprehensive review of existing records."
            },
            {
                requirement: "TDS Compliance",
                status: "non-compliant",
                details: "TDS deductions have been made, but there are delays in filing TDS returns for the last two quarters.",
                severity: "high",
                recommendation: "File pending TDS returns immediately and set up automated reminders for future compliance."
            },
            {
                requirement: "Income Tax Act - Transfer Pricing Documentation",
                status: "not-applicable",
                details: "Company does not have international related party transactions that require transfer pricing documentation.",
                severity: "low"
            },
            {
                requirement: "SEBI Regulations",
                status: "not-applicable",
                details: "Company is not listed and does not fall under SEBI regulations.",
                severity: "low"
            },
            {
                requirement: "RBI Foreign Exchange Management Act (FEMA)",
                status: "compliant",
                details: "All foreign investments and transactions comply with FEMA regulations.",
                severity: "medium"
            }
        ];

        return {
            summary: `The audit of ${companyName} reveals generally sound financial management with some significant compliance issues that require immediate attention. The company maintains a healthy balance sheet with good liquidity and low leverage. However, there are concerns regarding GST documentation and TDS filing compliance that pose regulatory risks. The audit also identified opportunities to strengthen internal financial controls and improve operational efficiency.`,
            metrics: auditMetrics,
            recommendations: auditRecommendations,
            riskFactors: auditRiskFactors,
            complianceItems: complianceItems
        };
    }
}
