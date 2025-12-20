/**
 * BGV PDF Generation Service
 * Generates professional PDF documents for Background Verification forms
 */

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';
import { getMSSQLPool } from '../config/database';

interface BGVData {
  fresher: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    mobile_number?: string;
    designation?: string;
    department?: string;
  };
  demographics: {
    first_name?: string;
    middle_name?: string;
    last_name?: string;
    gender?: string;
    date_of_birth?: Date;
    marital_status?: string;
    religion?: string;
    blood_group?: string;
    present_address?: string;
    permanent_address?: string;
    aadhar_number?: string;
    pan_number?: string;
  };
  personal: {
    father_name?: string;
    mother_name?: string;
    spouse_name?: string;
    num_children?: number;
    emergency_contacts?: string;
  };
  education: Array<{
    qualification?: string;
    university?: string;
    percentage_cgpa?: string;
    year_of_passing?: string;
    institution_name?: string;
  }>;
  employment: Array<{
    company_name?: string;
    designation?: string;
    duration_from?: Date;
    duration_to?: Date;
    reason_for_leaving?: string;
  }>;
  passportVisa: {
    has_passport?: boolean;
    passport_number?: string;
    passport_issue_date?: Date;
    passport_expiry_date?: Date;
    has_visa?: boolean;
    visa_type?: string;
    visa_country?: string;
  };
  bankPfNps: {
    number_of_bank_accounts?: number;
    bank_account_number?: string;
    ifsc_code?: string;
    name_as_per_bank?: string;
    bank_name?: string;
    branch?: string;
    uan_pf_number?: string;
    pran_nps_number?: string;
  };
}

export class BGVPdfService {
  /**
   * Fetch BGV data for a fresher
   */
  static async fetchBGVData(fresherId: number): Promise<BGVData> {
    try {
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      // Fetch fresher details
      const fresherResult = await pool.request()
        .input('fresherId', mssql.Int, fresherId)
        .query(`
          SELECT 
            id, first_name, last_name, email, mobile_number, 
            designation, department
          FROM freshers 
          WHERE id = @fresherId
        `);

      if (fresherResult.recordset.length === 0) {
        throw new Error('Fresher not found');
      }

      const fresher = fresherResult.recordset[0];

      // Fetch all BGV sections
      const [demographics, personal, education, employment, passportVisa, bankPfNps] = await Promise.all([
        pool.request()
          .input('fresherId', mssql.Int, fresherId)
          .query('SELECT * FROM bgv_demographics WHERE fresher_id = @fresherId'),
        
        pool.request()
          .input('fresherId', mssql.Int, fresherId)
          .query('SELECT * FROM bgv_personal WHERE fresher_id = @fresherId'),
        
        pool.request()
          .input('fresherId', mssql.Int, fresherId)
          .query('SELECT * FROM educational_details WHERE fresher_id = @fresherId ORDER BY year_of_passing DESC'),
        
        pool.request()
          .input('fresherId', mssql.Int, fresherId)
          .query('SELECT * FROM employment_history WHERE fresher_id = @fresherId ORDER BY duration_from DESC'),
        
        pool.request()
          .input('fresherId', mssql.Int, fresherId)
          .query('SELECT * FROM passport_visa WHERE fresher_id = @fresherId'),
        
        pool.request()
          .input('fresherId', mssql.Int, fresherId)
          .query('SELECT * FROM bank_pf_nps WHERE fresher_id = @fresherId')
      ]);

      return {
        fresher,
        demographics: demographics.recordset[0] || {},
        personal: personal.recordset[0] || {},
        education: education.recordset || [],
        employment: employment.recordset || [],
        passportVisa: passportVisa.recordset[0] || {},
        bankPfNps: bankPfNps.recordset[0] || {}
      };
    } catch (error) {
      console.error('Error fetching BGV data:', error);
      throw error;
    }
  }

  /**
   * Generate BGV verification PDF as a buffer
   */
  static async generateBGVPDF(fresherId: number): Promise<Buffer> {
    try {
      console.log(`📄 Generating BGV PDF for fresher ${fresherId}...`);

      // Fetch data
      const data = await this.fetchBGVData(fresherId);

      return new Promise((resolve, reject) => {
        try {
          const doc = new PDFDocument({
            size: 'A4',
            margins: { top: 50, bottom: 50, left: 50, right: 50 },
            info: {
              Title: 'Background Verification Form',
              Author: 'WinWire HR Department',
              Subject: `BGV Form - ${data.fresher.first_name} ${data.fresher.last_name}`,
              Keywords: 'BGV, Background Verification, Employee Onboarding'
            }
          });

          const buffers: Buffer[] = [];
          doc.on('data', buffers.push.bind(buffers));
          doc.on('end', () => {
            const pdfBuffer = Buffer.concat(buffers);
            console.log(`✅ BGV PDF generated successfully (${pdfBuffer.length} bytes)`);
            resolve(pdfBuffer);
          });
          doc.on('error', reject);

          // Generate PDF content
          this.generatePDFContent(doc, data);

          // Finalize PDF
          doc.end();
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error generating BGV PDF:', error);
      throw error;
    }
  }

  /**
   * Generate PDF content
   */
  private static generatePDFContent(doc: PDFKit.PDFDocument, data: BGVData): void {
    const pageWidth = doc.page.width;
    const leftMargin = 50;
    const rightMargin = pageWidth - 50;

    // Title and Header
    doc
      .fontSize(20)
      .font('Helvetica-Bold')
      .fillColor('#6f42c1')
      .text('PROFILE BACKGROUND VERIFICATION FORM', { align: 'center' })
      .moveDown(0.5);

    doc
      .fontSize(12)
      .font('Helvetica')
      .fillColor('#666')
      .text('WinWire Technologies Private Limited', { align: 'center' })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .fillColor('#999')
      .text(`Generated on: ${new Date().toLocaleDateString('en-IN', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })}`, { align: 'center' })
      .moveDown(1.5);

    // Draw horizontal line
    doc
      .strokeColor('#6f42c1')
      .lineWidth(2)
      .moveTo(leftMargin, doc.y)
      .lineTo(rightMargin, doc.y)
      .stroke()
      .moveDown(1);

    // SECTION 1: Personal Information
    this.drawSectionHeader(doc, '1. PERSONAL INFORMATION');

    const personalInfo = [
      { label: 'Full Name', value: `${data.demographics.first_name || ''} ${data.demographics.middle_name || ''} ${data.demographics.last_name || ''}`.trim() || 'N/A' },
      { label: 'Email Address', value: data.fresher.email || 'N/A' },
      { label: 'Mobile Number', value: data.fresher.mobile_number || 'N/A' },
      { label: 'Date of Birth', value: data.demographics.date_of_birth ? new Date(data.demographics.date_of_birth).toLocaleDateString('en-IN') : 'N/A' },
      { label: 'Gender', value: data.demographics.gender || 'N/A' },
      { label: 'Marital Status', value: data.demographics.marital_status || 'N/A' },
      { label: 'Blood Group', value: data.demographics.blood_group || 'N/A' },
      { label: 'Religion', value: data.demographics.religion || 'N/A' }
    ];

    this.drawTableRows(doc, personalInfo);

    // Address Information
    doc.moveDown(0.5);
    this.drawSubHeader(doc, 'Address Details');
    
    const addressInfo = [
      { label: 'Present Address', value: data.demographics.present_address || 'N/A', multiline: true },
      { label: 'Permanent Address', value: data.demographics.permanent_address || 'N/A', multiline: true }
    ];

    this.drawTableRows(doc, addressInfo);

    // Identity Documents
    doc.moveDown(0.5);
    this.drawSubHeader(doc, 'Identity Documents');
    
    const idInfo = [
      { label: 'Aadhar Number', value: data.demographics.aadhar_number || 'N/A' },
      { label: 'PAN Number', value: data.demographics.pan_number || 'N/A' }
    ];

    this.drawTableRows(doc, idInfo);

    // SECTION 2: Family Information
    doc.addPage();
    this.drawSectionHeader(doc, '2. FAMILY INFORMATION');

    const familyInfo = [
      { label: "Father's Name", value: data.personal.father_name || 'N/A' },
      { label: "Mother's Name", value: data.personal.mother_name || 'N/A' },
      { label: "Spouse's Name", value: data.personal.spouse_name || 'N/A' },
      { label: 'Number of Children', value: data.personal.num_children?.toString() || '0' }
    ];

    this.drawTableRows(doc, familyInfo);

    // Emergency Contacts
    if (data.personal.emergency_contacts) {
      try {
        const contacts = JSON.parse(data.personal.emergency_contacts);
        if (Array.isArray(contacts) && contacts.length > 0) {
          doc.moveDown(0.5);
          this.drawSubHeader(doc, 'Emergency Contacts');
          
          contacts.forEach((contact: any, index: number) => {
            const contactInfo = [
              { label: `Contact ${index + 1} - Name`, value: contact.name || 'N/A' },
              { label: 'Relationship', value: contact.relationship || 'N/A' },
              { label: 'Phone Number', value: contact.phone || 'N/A' }
            ];
            this.drawTableRows(doc, contactInfo);
            if (index < contacts.length - 1) doc.moveDown(0.3);
          });
        }
      } catch (e) {
        // Invalid JSON, skip emergency contacts
      }
    }

    // SECTION 3: Educational Qualifications
    doc.addPage();
    this.drawSectionHeader(doc, '3. EDUCATIONAL QUALIFICATIONS');

    if (data.education.length > 0) {
      data.education.forEach((edu, index) => {
        this.drawSubHeader(doc, `Qualification ${index + 1}`);
        
        const eduInfo = [
          { label: 'Qualification', value: edu.qualification || 'N/A' },
          { label: 'University/Board', value: edu.university || 'N/A' },
          { label: 'Institution Name', value: edu.institution_name || 'N/A' },
          { label: 'Percentage/CGPA', value: edu.percentage_cgpa || 'N/A' },
          { label: 'Year of Passing', value: edu.year_of_passing || 'N/A' }
        ];

        this.drawTableRows(doc, eduInfo);
        if (index < data.education.length - 1) doc.moveDown(0.5);
      });
    } else {
      doc
        .fontSize(10)
        .fillColor('#666')
        .text('No educational qualifications recorded.', leftMargin);
    }

    // SECTION 4: Employment History
    if (data.employment.length > 0) {
      doc.addPage();
      this.drawSectionHeader(doc, '4. EMPLOYMENT HISTORY');

      data.employment.forEach((emp, index) => {
        this.drawSubHeader(doc, `Employment ${index + 1}`);
        
        const empInfo = [
          { label: 'Company Name', value: emp.company_name || 'N/A' },
          { label: 'Designation', value: emp.designation || 'N/A' },
          { 
            label: 'Duration', 
            value: `${emp.duration_from ? new Date(emp.duration_from).toLocaleDateString('en-IN') : 'N/A'} to ${emp.duration_to ? new Date(emp.duration_to).toLocaleDateString('en-IN') : 'N/A'}` 
          },
          { label: 'Reason for Leaving', value: emp.reason_for_leaving || 'N/A', multiline: true }
        ];

        this.drawTableRows(doc, empInfo);
        if (index < data.employment.length - 1) doc.moveDown(0.5);
      });
    }

    // SECTION 5: Passport & Visa Information
    doc.addPage();
    this.drawSectionHeader(doc, '5. PASSPORT & VISA INFORMATION');

    const passportInfo = [
      { label: 'Has Passport', value: data.passportVisa.has_passport ? 'Yes' : 'No' }
    ];

    if (data.passportVisa.has_passport) {
      passportInfo.push(
        { label: 'Passport Number', value: data.passportVisa.passport_number || 'N/A' },
        { 
          label: 'Issue Date', 
          value: data.passportVisa.passport_issue_date 
            ? new Date(data.passportVisa.passport_issue_date).toLocaleDateString('en-IN') 
            : 'N/A' 
        },
        { 
          label: 'Expiry Date', 
          value: data.passportVisa.passport_expiry_date 
            ? new Date(data.passportVisa.passport_expiry_date).toLocaleDateString('en-IN') 
            : 'N/A' 
        }
      );
    }

    passportInfo.push({ label: 'Has Visa', value: data.passportVisa.has_visa ? 'Yes' : 'No' });

    if (data.passportVisa.has_visa) {
      passportInfo.push(
        { label: 'Visa Type', value: data.passportVisa.visa_type || 'N/A' },
        { label: 'Visa Country', value: data.passportVisa.visa_country || 'N/A' }
      );
    }

    this.drawTableRows(doc, passportInfo);

    // SECTION 6: Banking & Financial Information
    doc.moveDown(1);
    this.drawSectionHeader(doc, '6. BANKING & FINANCIAL INFORMATION');

    const bankInfo = [
      { label: 'Number of Bank Accounts', value: data.bankPfNps.number_of_bank_accounts?.toString() || 'N/A' },
      { label: 'Bank Account Number', value: data.bankPfNps.bank_account_number || 'N/A' },
      { label: 'IFSC Code', value: data.bankPfNps.ifsc_code || 'N/A' },
      { label: 'Name as per Bank', value: data.bankPfNps.name_as_per_bank || 'N/A' },
      { label: 'Bank Name', value: data.bankPfNps.bank_name || 'N/A' },
      { label: 'Branch', value: data.bankPfNps.branch || 'N/A' },
      { label: 'UAN/PF Number', value: data.bankPfNps.uan_pf_number || 'N/A' },
      { label: 'PRAN/NPS Number', value: data.bankPfNps.pran_nps_number || 'N/A' }
    ];

    this.drawTableRows(doc, bankInfo);

    // SECTION 7: Declaration
    doc.addPage();
    this.drawSectionHeader(doc, '7. DECLARATION');

    doc
      .fontSize(10)
      .fillColor('#333')
      .text(
        'I hereby declare that the information provided above is true, complete, and accurate to the best of my knowledge. ' +
        'I understand that any false information or misrepresentation may result in the rejection of my application or ' +
        'termination of employment if discovered at a later date. I authorize WinWire Technologies to verify the information ' +
        'provided and conduct background checks as deemed necessary.',
        leftMargin,
        doc.y,
        { width: rightMargin - leftMargin, align: 'justify' }
      )
      .moveDown(2);

    // Signature section
    doc
      .fontSize(10)
      .fillColor('#333')
      .text('Candidate Signature: _______________________', leftMargin)
      .moveDown(0.5)
      .text(`Date: ${new Date().toLocaleDateString('en-IN')}`, leftMargin)
      .moveDown(2);

    // Footer
    doc
      .fontSize(8)
      .fillColor('#999')
      .text(
        'This is a system-generated document for background verification purposes.',
        leftMargin,
        doc.page.height - 80,
        { width: rightMargin - leftMargin, align: 'center' }
      )
      .text(
        '© WinWire Technologies Private Limited - Confidential',
        leftMargin,
        doc.page.height - 65,
        { width: rightMargin - leftMargin, align: 'center' }
      );
  }

  /**
   * Draw section header
   */
  private static drawSectionHeader(doc: PDFKit.PDFDocument, text: string): void {
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor('#6f42c1')
      .text(text, 50)
      .moveDown(0.5);

    // Underline
    doc
      .strokeColor('#6f42c1')
      .lineWidth(1)
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke()
      .moveDown(0.5);
  }

  /**
   * Draw sub-header
   */
  private static drawSubHeader(doc: PDFKit.PDFDocument, text: string): void {
    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .fillColor('#495057')
      .text(text, 50)
      .moveDown(0.3);
  }

  /**
   * Draw table rows for key-value pairs
   */
  private static drawTableRows(
    doc: PDFKit.PDFDocument, 
    rows: Array<{ label: string; value: string; multiline?: boolean }>
  ): void {
    const leftMargin = 50;
    const labelWidth = 200;
    const valueX = leftMargin + labelWidth + 10;

    rows.forEach((row) => {
      const startY = doc.y;

      // Label
      doc
        .fontSize(10)
        .font('Helvetica-Bold')
        .fillColor('#495057')
        .text(row.label + ':', leftMargin, startY, { width: labelWidth, continued: false });

      // Value
      doc
        .font('Helvetica')
        .fillColor('#333')
        .text(
          row.value || 'N/A', 
          valueX, 
          startY, 
          { 
            width: doc.page.width - valueX - 50,
            align: 'left'
          }
        );

      doc.moveDown(0.4);
    });
  }
}
