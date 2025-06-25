# Updated API Documentation: Document Type Filtering for Financial and Legal Due Diligence

**Last Updated**: June 26, 2025  
**Version**: 2.0

## Overview

The KarmicDD API has been updated to implement strict document type filtering for Financial and Legal Due Diligence services. This ensures that:

- **Financial Due Diligence** only processes financial documents
- **Legal Due Diligence** only processes legal documents  
- Clear separation prevents processing conflicts and improves performance
- Enhanced logging provides better visibility into processing

## Document Type Classifications

The API uses the existing document type definitions from the backend models. **All document types are already defined in `Backend/src/models/Profile/Document.ts`** and should not be redefined elsewhere.

### Reference to Existing Type Definitions

```typescript
// These types are already defined in Backend/src/models/Profile/Document.ts
import { FinancialDocumentType, LegalDocumentType, DocumentType } from '../models/Profile/Document';
```

**Financial Document Types** (from `FinancialDocumentType`):
- All documents with `documentType` starting with `financial_` prefix
- Includes: balance sheets, income statements, cash flow, tax returns, audit reports, bank statements, projections, etc.

**Legal Document Types** (from `LegalDocumentType`):  
- All documents with `documentType` starting with `legal_` prefix
- Includes: incorporation certificates, MOA/AOA, board resolutions, contracts, IP documents, compliance docs, etc.

**Reference Implementation**: See `Backend/src/models/Profile/Document.ts` for the complete list of supported document types.

### Quick Reference: Available Document Types

**Financial Document Types** (all start with `financial_`):
```
financial_balance_sheet, financial_income_statement, financial_cash_flow,
financial_tax_returns, financial_audit_report, financial_gst_returns,
financial_bank_statements, financial_projections, financial_valuation_report,
financial_cap_table, financial_funding_history, financial_debt_schedule
```

**Legal Document Types** (all start with `legal_`):
```
legal_incorporation_certificate, legal_moa_aoa, legal_llp_agreement,
legal_pan_tan_gst, legal_shop_establishment, legal_iec,
legal_board_resolutions, legal_statutory_registers, legal_annual_filings,
legal_auditor_appointment, legal_cap_table_legal, legal_share_certificates,
legal_sha_ssa, legal_esop_plan, legal_convertible_notes, legal_angel_tax_exemption,
legal_valuation_reports, legal_itr_gst_returns, legal_tds_returns,
legal_transfer_pricing, legal_customer_contracts, legal_vendor_contracts,
legal_nda_agreements, legal_saas_agreements, legal_lease_agreements,
legal_government_licenses, legal_employment_agreements, legal_hr_policies,
legal_posh_policy, legal_labour_registrations, legal_ip_assignments,
legal_trademark_filings, legal_patent_filings, legal_website_policies,
legal_data_protection, legal_litigation_details, legal_regulatory_notices,
legal_aif_registration, legal_firc_copies, legal_fc_gpr, legal_fla_returns,
legal_odi_documents, legal_ppm, legal_investment_strategy, legal_capital_commitments,
legal_trc, legal_fatca_crs, legal_dtaa_applications, legal_stt_documents,
legal_term_sheet, legal_shareholders_agreement, legal_share_subscription,
legal_voting_rights, legal_rofr_agreements, legal_ben_declarations,
legal_sbo_register, legal_director_kyc, legal_ubo_declaration,
legal_loan_agreements, legal_rpt_disclosures
```

**General Document Types**:
```
pitch_deck, other, miscellaneous
```

## Updated API Endpoints

### Financial Due Diligence APIs

#### 1. Generate New Financial Due Diligence Report
```
POST /api/new-financial/entity/{entityId}/generate
```

**Changes**:
- Now filters documents by `documentType` starting with `financial_`
- Only processes financial documents for OCR
- Enhanced logging with `[FINANCIAL DD]` prefix

**Query Parameters**:
- `entityType`: `startup` | `investor` (default: `startup`)

**Example Response**:
```json
{
  "message": "Financial due diligence report generated successfully", 
  "reportId": "64f8c9e1234567890abcdef0",
  "documentsProcessed": 8,
  "documentTypes": [
    "financial_balance_sheet",
    "financial_income_statement", 
    "financial_tax_returns"
  ]
}
```

#### 2. Get Financial Due Diligence Report
```
GET /api/new-financial/entity/{entityId}
```

**Changes**:
- Only fetches financial documents for status check
- Returns proper error messages when no financial documents found

### Legal Due Diligence APIs  

#### 1. Analyze Legal Due Diligence
```
POST /api/legal-due-diligence/new/entity/{entityId}/analyze
```

**Changes**:
- Now filters documents by specific legal document types
- Only processes legal documents for OCR
- Enhanced logging with `[LEGAL DD]` prefix

**Query Parameters**:
- `entityType`: `startup` | `investor` (default: `startup`)

**Example Response**:
```json
{
  "message": "Legal due diligence report generated successfully",
  "success": true,
  "data": {
    "reportId": "64f8c9e1234567890abcdef1",
    "documentsProcessed": 12,
    "documentTypes": [
      "legal_incorporation_certificate",
      "legal_moa_aoa",
      "legal_board_resolutions"
    ]
  }
}
```

## Document Filtering Logic

### Financial DD Document Filtering

```typescript
// Import the existing types from the model
import { FinancialDocumentType, DocumentModel } from '../models/Profile/Document';

// Financial documents are fetched using the existing FinancialDocumentType
const documents = await DocumentModel.find({
  userId: entityId,
  documentType: { $regex: '^financial_' } // Filters all financial document types
});
```

### Legal DD Document Filtering

```typescript
// Import the existing types from the model
import { LegalDocumentType, DocumentModel } from '../models/Profile/Document';

// Legal documents are fetched using the existing LegalDocumentType
const legalDocuments = await DocumentModel.find({
  userId: entityId,
  documentType: { $regex: '^legal_' } // Filters all legal document types
});
```

**Note**: The filtering logic uses the existing document type definitions from `Backend/src/models/Profile/Document.ts` to ensure consistency across the application.

## Enhanced Logging

### Financial DD Logs
```
[FINANCIAL DD] Processing financial due diligence request for entityId: 123, entityType: startup
[FINANCIAL DD] Found 8 financial documents for processing
[FINANCIAL DD] Preparing PDF for OCR: Balance Sheet 2024.pdf (Type: financial_balance_sheet)
[FINANCIAL DD] Processing 8 PDF documents with MemoryBasedOcrPdfService...
[FINANCIAL DD] PDF OCR processing complete. Text length: 45231
[FINANCIAL DD] Generating financial due diligence report for TechStartup (startup)
[FINANCIAL DD] Calling Gemini API for financial due diligence analysis...
```

### Legal DD Logs
```
[LEGAL DD] Processing legal due diligence request for entityId: 123, entityType: startup
[LEGAL DD] Found 12 legal documents for analysis
[LEGAL DD] Processing 12 legal documents using memory-based OCR service
[LEGAL DD] Processing 10 PDF documents with memory-based OCR using combine-first approach
[LEGAL DD] Generating legal due diligence report for TechStartup
[LEGAL DD] Calling Gemini API for legal due diligence analysis...
[LEGAL DD] Legal due diligence analysis completed successfully for entity 123
```

## Error Handling

### No Financial Documents Found
```json
{
  "message": "No financial documents found for this entity",
  "documentsAvailable": false,
  "errorCode": "NO_FINANCIAL_DOCUMENTS", 
  "suggestion": "Please upload financial documents such as balance sheets, income statements, cash flow statements, etc."
}
```

### No Legal Documents Found
```json
{
  "message": "No legal documents found for analysis",
  "success": false,
  "errorCode": "NO_LEGAL_DOCUMENTS",
  "suggestion": "Please upload legal documents such as incorporation certificate, MOA/AOA, board resolutions, etc."
}
```

## OCR Processing Improvements

### Document-Specific OCR Processing

1. **Financial DD OCR**:
   - Only processes documents with `documentType` starting with `financial_`
   - Optimized for financial document structures
   - Enhanced metadata tracking for financial analysis

2. **Legal DD OCR**:
   - Only processes documents with `documentType` starting with `legal_`
   - Optimized for legal document structures  
   - Enhanced metadata tracking for compliance analysis

### Performance Benefits

- **Reduced Processing Time**: Only relevant documents are processed
- **Lower API Costs**: Fewer documents sent to Gemini API
- **Better Accuracy**: Context-specific analysis for each domain
- **Clear Separation**: No confusion between document types

## Migration Notes

### For Frontend Applications

1. **Check Document Types**: Ensure documents are uploaded with correct `documentType` values
2. **Error Handling**: Update error handling for new error codes (`NO_FINANCIAL_DOCUMENTS`, `NO_LEGAL_DOCUMENTS`)
3. **UI Updates**: Show appropriate document type expectations in upload interfaces

### For API Consumers

1. **Document Upload**: Ensure documents are classified correctly during upload
2. **Status Checks**: Use the new filtered responses for document availability
3. **Logging**: Look for `[FINANCIAL DD]` or `[LEGAL DD]` prefixes in logs for troubleshooting

## Example Document Upload with Correct Types

```javascript
// Import the document type definitions for reference
// (See Backend/src/models/Profile/Document.ts for complete list)

// Financial document upload example
const formData = new FormData();
formData.append('documents', file);
formData.append('documentType', 'financial_balance_sheet'); // Use existing FinancialDocumentType
formData.append('description', 'Balance Sheet for FY 2024');

// Legal document upload example
const formData = new FormData();
formData.append('documents', file);
formData.append('documentType', 'legal_incorporation_certificate'); // Use existing LegalDocumentType
formData.append('description', 'Certificate of Incorporation');
```

**Important**: Always use the document types defined in `Backend/src/models/Profile/Document.ts`. Frontend developers can reference the document type options in `Frontend/src/components/Profile/ComprehensiveDocumentUpload.tsx`.

## Benefits of the Update

1. **Performance**: Faster processing due to document filtering
2. **Accuracy**: Better analysis with domain-specific context
3. **Clarity**: Clear separation between financial and legal processing
4. **Debugging**: Enhanced logging for easier troubleshooting
5. **Cost Efficiency**: Reduced API usage through targeted processing
6. **Scalability**: Better resource utilization and system performance

---

**Note**: This update ensures that Financial and Legal Due Diligence services operate independently with their respective document types, eliminating confusion and improving overall system performance.
