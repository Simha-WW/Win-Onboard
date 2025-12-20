/**
 * PDF Generation Utility
 * Generates PDF from BGV submission data
 */

import jsPDF from 'jspdf';

interface SubmissionData {
  fresher: {
    first_name: string;
    last_name: string;
    email: string;
    designation?: string;
    department?: string;
    joining_date?: string;
  };
  demographics: any;
  personal: any;
  education: any[];
  employment: any[];
  passportVisa: any;
  bankPfNps: any;
  emergencyContacts: any[];
  signatureUrl: string | null;
  submittedAt: string | null;
}

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private lineHeight: number;

  constructor() {
    this.doc = new jsPDF();
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
    this.lineHeight = 7;
  }

  private checkPageBreak(requiredSpace: number = 20) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addHeader(title: string) {
    this.checkPageBreak(20);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += this.lineHeight + 3;
    
    // Add underline
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += this.lineHeight;
  }

  private addSectionTitle(title: string) {
    this.checkPageBreak(15);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += this.lineHeight + 2;
  }

  private addField(label: string, value: any) {
    if (value === null || value === undefined) return;
    
    this.checkPageBreak();
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${label}:`, this.margin, this.currentY);
    
    this.doc.setFont('helvetica', 'normal');
    const valueStr = String(value);
    const labelWidth = this.doc.getTextWidth(`${label}: `);
    this.doc.text(valueStr, this.margin + labelWidth, this.currentY);
    
    this.currentY += this.lineHeight;
  }

  private addLinkField(label: string, url: string | null) {
    if (!url) return;
    
    this.checkPageBreak();
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${label}:`, this.margin, this.currentY);
    
    // Add clickable link in blue
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(0, 0, 255); // Blue color
    const labelWidth = this.doc.getTextWidth(`${label}: `);
    const linkText = 'View Document';
    this.doc.textWithLink(linkText, this.margin + labelWidth, this.currentY, { url });
    
    // Reset color to black
    this.doc.setTextColor(0, 0, 0);
    
    this.currentY += this.lineHeight;
  }

  private addTableRow(columns: { label: string; value: any }[]) {
    this.checkPageBreak();
    this.doc.setFontSize(10);
    
    const columnWidth = (this.pageWidth - 2 * this.margin) / columns.length;
    let xPos = this.margin;
    
    columns.forEach((col) => {
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${col.label}:`, xPos, this.currentY);
      
      this.doc.setFont('helvetica', 'normal');
      const value = col.value !== null && col.value !== undefined ? String(col.value) : 'N/A';
      this.doc.text(value, xPos, this.currentY + this.lineHeight);
      
      xPos += columnWidth;
    });
    
    this.currentY += this.lineHeight * 2 + 2;
  }

  private addSpace(amount: number = 1) {
    this.currentY += this.lineHeight * amount;
  }

  private addTable(data: { [key: string]: any }, excludeFields: string[] = []) {
    const tableStartY = this.currentY;
    const columnPadding = 5;
    const rowHeight = 8;
    const col1Width = 80; // Property column width
    const col2Width = this.pageWidth - 2 * this.margin - col1Width; // Value column width
    
    // Filter out null/undefined values and excluded fields
    const entries = Object.entries(data).filter(
      ([key, value]) => value !== null && value !== undefined && !excludeFields.includes(key)
    );
    
    if (entries.length === 0) return;
    
    // Draw table headers
    this.checkPageBreak(30);
    const tableX = this.margin;
    
    // Header background
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(tableX, this.currentY - 5, col1Width + col2Width, rowHeight, 'F');
    
    // Header text
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Property', tableX + columnPadding, this.currentY);
    this.doc.text('Value', tableX + col1Width + columnPadding, this.currentY);
    
    // Header border
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(tableX, this.currentY - 5, col1Width + col2Width, rowHeight);
    this.doc.line(tableX + col1Width, this.currentY - 5, tableX + col1Width, this.currentY + rowHeight - 5);
    
    this.currentY += rowHeight - 2;
    
    // Draw table rows
    entries.forEach(([key, value]) => {
      this.checkPageBreak(rowHeight + 5);
      
      // Format the key (convert snake_case to Title Case)
      const formattedKey = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Format the value
      let formattedValue = String(value);
      if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
        try {
          formattedValue = new Date(value).toLocaleDateString();
        } catch (e) {
          // Keep original if date parsing fails
        }
      }
      
      // Property cell
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(9);
      this.doc.text(formattedKey, tableX + columnPadding, this.currentY);
      
      // Value cell - handle long text with wrapping
      this.doc.setFont('helvetica', 'normal');
      const maxValueWidth = col2Width - 2 * columnPadding;
      const lines = this.doc.splitTextToSize(formattedValue, maxValueWidth);
      const cellHeight = Math.max(rowHeight, lines.length * 5 + 3);
      
      lines.forEach((line: string, idx: number) => {
        this.doc.text(line, tableX + col1Width + columnPadding, this.currentY + (idx * 5));
      });
      
      // Row borders
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(tableX, this.currentY - 5, col1Width + col2Width, cellHeight);
      this.doc.line(tableX + col1Width, this.currentY - 5, tableX + col1Width, this.currentY + cellHeight - 5);
      
      this.currentY += cellHeight - 2;
    });
    
    this.addSpace(1);
  }

  private addTableWithLinks(data: { [key: string]: any }, linkFields: { [key: string]: string } = {}) {
    const tableStartY = this.currentY;
    const columnPadding = 5;
    const rowHeight = 8;
    const col1Width = 80;
    const col2Width = this.pageWidth - 2 * this.margin - col1Width;
    
    const entries = Object.entries(data).filter(
      ([key, value]) => value !== null && value !== undefined
    );
    
    if (entries.length === 0) return;
    
    // Draw table headers
    this.checkPageBreak(30);
    const tableX = this.margin;
    
    this.doc.setFillColor(240, 240, 240);
    this.doc.rect(tableX, this.currentY - 5, col1Width + col2Width, rowHeight, 'F');
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Property', tableX + columnPadding, this.currentY);
    this.doc.text('Value', tableX + col1Width + columnPadding, this.currentY);
    
    this.doc.setDrawColor(200, 200, 200);
    this.doc.rect(tableX, this.currentY - 5, col1Width + col2Width, rowHeight);
    this.doc.line(tableX + col1Width, this.currentY - 5, tableX + col1Width, this.currentY + rowHeight - 5);
    
    this.currentY += rowHeight - 2;
    
    entries.forEach(([key, value]) => {
      this.checkPageBreak(rowHeight + 5);
      
      const formattedKey = key
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(9);
      this.doc.text(formattedKey, tableX + columnPadding, this.currentY);
      
      this.doc.setFont('helvetica', 'normal');
      
      // Check if this is a link field
      if (linkFields[key] && typeof value === 'string' && value.startsWith('http')) {
        this.doc.setTextColor(0, 0, 255);
        this.doc.textWithLink('View Document', tableX + col1Width + columnPadding, this.currentY, { url: value });
        this.doc.setTextColor(0, 0, 0);
      } else {
        let formattedValue = String(value);
        if (value instanceof Date || (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/))) {
          try {
            formattedValue = new Date(value).toLocaleDateString();
          } catch (e) {}
        }
        
        const maxValueWidth = col2Width - 2 * columnPadding;
        const lines = this.doc.splitTextToSize(formattedValue, maxValueWidth);
        lines.forEach((line: string, idx: number) => {
          this.doc.text(line, tableX + col1Width + columnPadding, this.currentY + (idx * 5));
        });
      }
      
      this.doc.setDrawColor(200, 200, 200);
      this.doc.rect(tableX, this.currentY - 5, col1Width + col2Width, rowHeight);
      this.doc.line(tableX + col1Width, this.currentY - 5, tableX + col1Width, this.currentY + rowHeight - 5);
      
      this.currentY += rowHeight - 2;
    });
    
    this.addSpace(1);
  }

  private async addImage(imageUrl: string, label: string) {
    try {
      this.checkPageBreak(60);
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(label, this.margin, this.currentY);
      this.currentY += this.lineHeight;

      // Load image
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0);
              const imgData = canvas.toDataURL('image/png');
              
              // Calculate dimensions to fit in page
              const maxWidth = 80;
              const maxHeight = 50;
              let width = img.width;
              let height = img.height;
              
              const ratio = Math.min(maxWidth / width, maxHeight / height);
              width = width * ratio;
              height = height * ratio;
              
              this.doc.addImage(imgData, 'PNG', this.margin, this.currentY, width, height);
              this.currentY += height + 5;
            }
            resolve();
          } catch (error) {
            console.error('Error processing image:', error);
            this.doc.text('(Image could not be loaded)', this.margin, this.currentY);
            this.currentY += this.lineHeight;
            resolve();
          }
        };
        
        img.onerror = () => {
          this.doc.text('(Image not available)', this.margin, this.currentY);
          this.currentY += this.lineHeight;
          resolve();
        };
        
        img.src = imageUrl;
      });
    } catch (error) {
      console.error('Error adding image:', error);
      this.doc.text('(Image could not be loaded)', this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
  }

  async generatePDF(data: SubmissionData): Promise<void> {
    // Header
    this.addHeader(`BGV Submission - ${data.fresher.first_name} ${data.fresher.last_name}`);
    
    // Candidate Information
    this.addSectionTitle('Candidate Information');
    const candidateInfo = {
      name: `${data.fresher.first_name} ${data.fresher.last_name}`,
      email: data.fresher.email,
      designation: data.fresher.designation || 'N/A',
      department: data.fresher.department || 'N/A',
      joining_date: data.fresher.joining_date ? new Date(data.fresher.joining_date).toLocaleDateString() : 'N/A',
      submitted_at: data.submittedAt ? new Date(data.submittedAt).toLocaleString() : 'N/A'
    };
    this.addTable(candidateInfo);
    this.addSpace(1);

    // Demographics
    if (data.demographics) {
      this.addSectionTitle('Demographics');
      
      const demographicsInfo = {
        salutation: data.demographics.salutation,
        first_name: data.demographics.first_name,
        middle_name: data.demographics.middle_name,
        last_name: data.demographics.last_name,
        gender: data.demographics.gender,
        blood_group: data.demographics.blood_group,
        date_of_birth: data.demographics.dob_as_per_records,
        aadhaar_number: data.demographics.aadhaar_card_number,
        pan_number: data.demographics.pan_card_number,
        whatsapp_number: data.demographics.whatsapp_number,
        linkedin_url: data.demographics.linkedin_url
      };
      
      const linkFields = {
        aadhaar_doc_file_url: data.demographics.aadhaar_doc_file_url,
        pan_file_url: data.demographics.pan_file_url,
        resume_file_url: data.demographics.resume_file_url
      };
      
      // Add demographic info without document URLs
      this.addTable(demographicsInfo);
      
      // Add document links if they exist
      if (data.demographics.aadhaar_doc_file_url || data.demographics.pan_file_url || data.demographics.resume_file_url) {
        this.addSectionTitle('Documents');
        const docLinks: any = {};
        if (data.demographics.aadhaar_doc_file_url) docLinks.aadhaar_document = data.demographics.aadhaar_doc_file_url;
        if (data.demographics.pan_file_url) docLinks.pan_document = data.demographics.pan_file_url;
        if (data.demographics.resume_file_url) docLinks.resume = data.demographics.resume_file_url;
        this.addTableWithLinks(docLinks, docLinks);
      }
      
      // Communication Address
      if (data.demographics.comm_city || data.demographics.comm_state) {
        this.addSectionTitle('Communication Address');
        const commAddress = {
          house_number: data.demographics.comm_house_number,
          street_name: data.demographics.comm_street_name,
          city: data.demographics.comm_city,
          district: data.demographics.comm_district,
          state: data.demographics.comm_state,
          country: data.demographics.comm_country,
          pin_code: data.demographics.comm_pin_code
        };
        this.addTable(commAddress);
      }
      
      // Permanent Address
      if (data.demographics.perm_city || data.demographics.perm_state) {
        this.addSectionTitle('Permanent Address');
        const permAddress = {
          house_number: data.demographics.perm_house_number,
          street_name: data.demographics.perm_street_name,
          city: data.demographics.perm_city,
          district: data.demographics.perm_district,
          state: data.demographics.perm_state,
          country: data.demographics.perm_country,
          pin_code: data.demographics.perm_pin_code
        };
        this.addTable(permAddress);
      }
      
      this.addSpace(1);
    }

    // Personal Information
    if (data.personal) {
      this.addSectionTitle('Personal Information');
      const personalInfo = {
        marital_status: data.personal.marital_status,
        number_of_children: data.personal.num_children,
        father_name: data.personal.father_name,
        father_date_of_birth: data.personal.father_dob,
        mother_name: data.personal.mother_name,
        mother_date_of_birth: data.personal.mother_dob
      };
      this.addTable(personalInfo);
      this.addSpace(1);
    }

    // Emergency Contacts
    if (data.emergencyContacts && data.emergencyContacts.length > 0) {
      this.addSectionTitle('Emergency Contacts');
      data.emergencyContacts.forEach((contact, index) => {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Contact ${index + 1}`, this.margin, this.currentY);
        this.currentY += this.lineHeight;
        
        const contactInfo = {
          name: contact.name,
          relationship: contact.relationship,
          phone: contact.phone
        };
        this.addTable(contactInfo);
      });
      this.addSpace(1);
    }

    // Education
    if (data.education && data.education.length > 0) {
      this.addSectionTitle('Educational Details');
      data.education.forEach((edu, index) => {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Education ${index + 1}`, this.margin, this.currentY);
        this.currentY += this.lineHeight;
        
        const eduInfo = {
          qualification_type: edu.qualification_type,
          qualification: edu.qualification,
          university_institution: edu.university_institution,
          cgpa_percentage: edu.cgpa_percentage,
          year_of_passing: edu.year_of_passing
        };
        this.addTable(eduInfo);
        
        // Add document URLs if available
        const eduDocs: any = {};
        if (edu.document_url) {
          eduDocs.certificate = edu.document_url;
        }
        
        if (edu.documents && Array.isArray(edu.documents) && edu.documents.length > 0) {
          edu.documents.forEach((doc: any, docIdx: number) => {
            if (doc.fileUrl) {
              eduDocs[`document_${docIdx + 1}`] = doc.fileUrl;
            }
          });
        }
        
        if (Object.keys(eduDocs).length > 0) {
          this.addTableWithLinks(eduDocs, eduDocs);
        }
      });
      this.addSpace(1);
    }

    // Employment History
    if (data.employment && data.employment.length > 0) {
      this.addSectionTitle('Employment History');
      data.employment.forEach((emp, index) => {
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Employment ${index + 1}`, this.margin, this.currentY);
        this.currentY += this.lineHeight;
        
        const empInfo = {
          company_name: emp.company_name,
          designation: emp.designation,
          start_date: emp.start_date,
          end_date: emp.end_date,
          reason_for_leaving: emp.reason_for_leaving
        };
        this.addTable(empInfo);
      });
      this.addSpace(1);
    }

    // Passport & Visa
    if (data.passportVisa) {
      this.addSectionTitle('Passport & Visa Details');
      const passportInfo = {
        passport_number: data.passportVisa.passport_number,
        issue_date: data.passportVisa.issue_date,
        expiry_date: data.passportVisa.expiry_date,
        place_of_issue: data.passportVisa.place_of_issue
      };
      this.addTable(passportInfo);
      this.addSpace(1);
    }

    // Bank, PF, NPS Details
    if (data.bankPfNps) {
      this.addSectionTitle('Bank, PF & NPS Details');
      const bankInfo = {
        bank_name: data.bankPfNps.bank_name,
        account_number: data.bankPfNps.account_number,
        ifsc_code: data.bankPfNps.ifsc_code,
        branch_name: data.bankPfNps.branch_name,
        pf_number: data.bankPfNps.pf_number,
        uan_number: data.bankPfNps.uan_number,
        nps_number: data.bankPfNps.nps_number
      };
      this.addTable(bankInfo);
      this.addSpace(1);
    }

    // Signature
    if (data.signatureUrl) {
      await this.addImage(data.signatureUrl, 'Candidate Signature');
    }
  }

  download(filename: string) {
    this.doc.save(filename);
  }
}

export const generateSubmissionPDF = async (data: SubmissionData, candidateName: string) => {
  const pdfGen = new PDFGenerator();
  await pdfGen.generatePDF(data);
  
  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `Submission_${candidateName.replace(/\s+/g, '_')}_${timestamp}.pdf`;
  pdfGen.download(filename);
};
