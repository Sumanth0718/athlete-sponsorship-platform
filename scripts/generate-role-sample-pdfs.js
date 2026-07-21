const fs = require('fs');
const path = require('path');

function buildPDF(streamText) {
  const contentBuf = Buffer.from(streamText, 'binary');
  const pdfHeader = `%PDF-1.4\n`;
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n`;
  const obj4Header = `4 0 obj\n<< /Length ${contentBuf.length} >>\nstream\n`;
  const obj4Footer = `\nendstream\nendobj\n`;
  const obj5 = `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  let offset = Buffer.byteLength(pdfHeader);
  const off1 = offset; offset += Buffer.byteLength(obj1);
  const off2 = offset; offset += Buffer.byteLength(obj2);
  const off3 = offset; offset += Buffer.byteLength(obj3);
  const off4 = offset; offset += Buffer.byteLength(obj4Header) + contentBuf.length + Buffer.byteLength(obj4Footer);
  const off5 = offset; offset += Buffer.byteLength(obj5);
  const startXref = offset;

  const pad = (n) => String(n).padStart(10, '0');
  const xref = `xref\n0 6\n0000000000 65535 f \n${pad(off1)} 00000 n \n${pad(off2)} 00000 n \n${pad(off3)} 00000 n \n${pad(off4)} 00000 n \n${pad(off5)} 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF`;

  return Buffer.concat([
    Buffer.from(pdfHeader),
    Buffer.from(obj1),
    Buffer.from(obj2),
    Buffer.from(obj3),
    Buffer.from(obj4Header),
    contentBuf,
    Buffer.from(obj4Footer),
    Buffer.from(obj5),
    Buffer.from(xref)
  ]);
}

// 1. ATHLETE CONTRACT SAMPLE
const athleteStreamText = `BT
/F1 16 Tf
50 750 Td
(ATHLETE ENDORSEMENT & COMPENSATION AGREEMENT) Tj
0 -35 Td
/F1 11 Tf
(Athlete Name: Alex Johnson  |  Sport: Track & Field) Tj
0 -20 Td
(Sponsor Brand: Nike Global Athletics, Inc.) Tj
0 -20 Td
(Effective Date: June 1, 2025  |  Expiration Date: May 31, 2026) Tj
0 -35 Td
/F1 13 Tf
(1. ATHLETE FINANCIAL COMPENSATION) Tj
0 -22 Td
/F1 11 Tf
(Base Compensation: $85,000 USD payable in 4 quarterly installments of $21,250.) Tj
0 -20 Td
(Performance Bonus: $15,000 USD bonus for national championship podium finish.) Tj
0 -35 Td
/F1 13 Tf
(2. REQUIRED ATHLETE DELIVERABLES) Tj
0 -22 Td
/F1 11 Tf
(- Publish 4 Instagram Reels and TikTok videos per month featuring brand apparel.) Tj
0 -20 Td
(- Attend 2 public brand clinics and product launch events per year.) Tj
0 -35 Td
/F1 13 Tf
(3. RENEWAL & TERMINATION CLAUSES) Tj
0 -22 Td
/F1 11 Tf
(Renewal Window: Option to renew contract up to 60 days prior to expiration.) Tj
0 -20 Td
(Termination Clause: Either party may terminate with 30 days written notice.) Tj
ET`;

// 2. BRAND CAMPAIGN CONTRACT SAMPLE
const brandStreamText = `BT
/F1 16 Tf
50 750 Td
(CORPORATE BRAND CAMPAIGN & AMBASSADOR AGREEMENT) Tj
0 -35 Td
/F1 11 Tf
(Issuing Brand: Red Bull Extreme Sports & Beverages) Tj
0 -20 Td
(Sponsored Athlete: Marcus Vance  |  Sport: Basketball / Lifestyle) Tj
0 -20 Td
(Effective Date: July 1, 2025  |  Expiration Date: June 30, 2026) Tj
0 -35 Td
/F1 13 Tf
(1. CAMPAIGN BUDGET & DISBURSEMENT) Tj
0 -22 Td
/F1 11 Tf
(Total Campaign Allocation: $120,000 USD committed budget.) Tj
0 -20 Td
(Disbursement Schedule: $40,000 initial sign-on, $40,000 mid-term, $40,000 completion.) Tj
0 -35 Td
/F1 13 Tf
(2. BRAND AMBASSADOR COMPLIANCE & DELIVERABLES) Tj
0 -22 Td
/F1 11 Tf
(- Exclusive energy drink branding at all public athletic competitions.) Tj
0 -20 Td
(- 6 Dedicated social media campaign features and co-branded apparel launch.) Tj
0 -35 Td
/F1 13 Tf
(3. COMPLIANCE & EXCLUSIVITY TERMS) Tj
0 -22 Td
/F1 11 Tf
(Exclusivity: Athlete agrees not to endorse competing beverage brands.) Tj
0 -20 Td
(Breach & Default: 30-day cure period following written notification.) Tj
ET`;

const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sample-athlete-sponsorship-contract.pdf'), buildPDF(athleteStreamText));
fs.writeFileSync(path.join(publicDir, 'sample-brand-campaign-contract.pdf'), buildPDF(brandStreamText));

console.log('Successfully generated valid PDF contracts in public directory');
