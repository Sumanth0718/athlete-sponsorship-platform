const fs = require('fs');
const path = require('path');

const sampleText = `ATHLETE ENDORSEMENT & SPONSORSHIP AGREEMENT

PARTIES:
- Brand Partner: Nike Global Athletics, Inc.
- Athlete: Alex Johnson

CONTRACT VALUE & PAYMENT TERMS:
- Total Compensation: $85,000 USD paid in four equal quarterly installments of $21,250.
- Performance Bonus: Additional $15,000 bonus upon achieving a podium finish in national events.

TERM & EXPIRATION:
- Effective Date: June 1, 2025
- Expiration Date: May 31, 2026

DELIVERABLES:
1. 4 Social Media promotional posts per month across Instagram & TikTok featuring official apparel.
2. 2 Public appearances per year at official brand clinics and product launch events.

TERMINATION & RENEWAL:
- Either party may terminate with 30 days prior written notice.
- Renewal option available 60 days prior to contract expiration date.
`;

// Build clean PDF file structure
const streamText = `BT
/F1 16 Tf
50 750 Td
(ATHLETE ENDORSEMENT & SPONSORSHIP AGREEMENT) Tj
0 -35 Td
/F1 11 Tf
(Brand Partner: Nike Global Athletics, Inc.) Tj
0 -20 Td
(Athlete Name: Alex Johnson) Tj
0 -20 Td
(Effective Date: June 1, 2025  |  Expiration Date: May 31, 2026) Tj
0 -35 Td
/F1 13 Tf
(1. CONTRACT VALUE & FINANCIAL TERMS) Tj
0 -22 Td
/F1 11 Tf
(Total Sponsorship Compensation: $85,000 USD paid in quarterly installments.) Tj
0 -20 Td
(Performance Bonus: $15,000 bonus for podium placement in national events.) Tj
0 -35 Td
/F1 13 Tf
(2. ATHLETE DELIVERABLES) Tj
0 -22 Td
/F1 11 Tf
(- 4 Social Media promotional posts per month featuring brand apparel.) Tj
0 -20 Td
(- 2 Public appearances per year at official brand clinics & launch events.) Tj
0 -35 Td
/F1 13 Tf
(3. TERMINATION & RENEWAL CLAUSES) Tj
0 -22 Td
/F1 11 Tf
(Either party may terminate this agreement with 30 days written notice.) Tj
0 -20 Td
(Renewal option available 60 days prior to contract expiration date.) Tj
ET`;

const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${streamText.length} >>
stream
${streamText}
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000114 00000 n 
0000000243 00000 n 
0000000850 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
920
%%EOF`;

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sample-sponsorship-contract.pdf'), pdfContent);
fs.writeFileSync(path.join(publicDir, 'sample-sponsorship-contract.txt'), sampleText);

console.log('Successfully generated sample contract PDF and TXT in public directory');
