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
    this.addField('Name', `${data.fresher.first_name} ${data.fresher.last_name}`);
    this.addField('Email', data.fresher.email);
    this.addField('Designation', data.fresher.designation);
    this.addField('Department', data.fresher.department);
    this.addField('Joining Date', data.fresher.joining_date ? new Date(data.fresher.joining_date).toLocaleDateString() : 'N/A');
    this.addField('Submitted At', data.submittedAt ? new Date(data.submittedAt).toLocaleString() : 'N/A');
    this.addSpace(2);

    // Demographics
    if (data.demographics) {
      this.addSectionTitle('Demographics');
      this.addField('Salutation', data.demographics.salutation);
      this.addField('First Name', data.demographics.first_name);
      this.addField('Middle Name', data.demographics.middle_name);
      this.addField('Last Name', data.demographics.last_name);
      this.addField('Gender', data.demographics.gender);
      this.addField('Blood Group', data.demographics.blood_group);
      this.addField('Date of Birth', data.demographics.dob_as_per_records);
      this.addField('Aadhaar Number', data.demographics.aadhaar_card_number);
      this.addLinkField('Aadhaar Doc File Url', data.demographics.aadhaar_doc_file_url);
      this.addField('PAN Number', data.demographics.pan_card_number);
      this.addLinkField('Pan File Url', data.demographics.pan_file_url);
      this.addLinkField('Resume File Url', data.demographics.resume_file_url);
      this.addField('WhatsApp Number', data.demographics.whatsapp_number);
      this.addField('LinkedIn URL', data.demographics.linkedin_url);
      
      // Communication Address
      if (data.demographics.comm_city || data.demographics.comm_state) {
        this.addSpace();
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Communication Address:', this.margin, this.currentY);
        this.currentY += this.lineHeight;
        this.doc.setFont('helvetica', 'normal');
        
        const commAddress = [
          data.demographics.comm_house_number,
          data.demographics.comm_street_name,
          data.demographics.comm_city,
          data.demographics.comm_district,
          data.demographics.comm_state,
          data.demographics.comm_country,
          data.demographics.comm_pin_code
        ].filter(Boolean).join(', ');
        
        this.doc.text(commAddress || 'N/A', this.margin + 10, this.currentY);
        this.currentY += this.lineHeight;
      }
      
      // Permanent Address
      if (data.demographics.perm_city || data.demographics.perm_state) {
        this.addSpace();
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('Permanent Address:', this.margin, this.currentY);
        this.currentY += this.lineHeight;
        this.doc.setFont('helvetica', 'normal');
        
        const permAddress = [
          data.demographics.perm_house_number,
          data.demographics.perm_street_name,
          data.demographics.perm_city,
          data.demographics.perm_district,
          data.demographics.perm_state,
          data.demographics.perm_country,
          data.demographics.perm_pin_code
        ].filter(Boolean).join(', ');
        
        this.doc.text(permAddress || 'N/A', this.margin + 10, this.currentY);
        this.currentY += this.lineHeight;
      }
      
      this.addSpace(2);
    }

    // Personal Information
    if (data.personal) {
      this.addSectionTitle('Personal Information');
      this.addField('Marital Status', data.personal.marital_status);
      this.addField('Number of Children', data.personal.num_children);
      this.addField('Father Name', data.personal.father_name);
      this.addField('Father DOB', data.personal.father_dob);
      this.addField('Mother Name', data.personal.mother_name);
      this.addField('Mother DOB', data.personal.mother_dob);
      this.addSpace(2);
    }

    // Emergency Contacts
    if (data.emergencyContacts && data.emergencyContacts.length > 0) {
      this.addSectionTitle('Emergency Contacts');
      data.emergencyContacts.forEach((contact, index) => {
        this.addField(`Contact ${index + 1} - Name`, contact.name);
        this.addField(`Contact ${index + 1} - Relationship`, contact.relationship);
        this.addField(`Contact ${index + 1} - Phone`, contact.phone);
        this.addSpace();
      });
      this.addSpace();
    }

    // Education
    if (data.education && data.education.length > 0) {
      this.addSectionTitle('Educational Details');
      data.education.forEach((edu, index) => {
        this.addField(`${index + 1}. Qualification Type`, edu.qualification_type);
        this.addField('   Qualification', edu.qualification);
        this.addField('   University/Institution', edu.university_institution);
        this.addField('   CGPA/Percentage', edu.cgpa_percentage);
        this.addField('   Year of Passing', edu.year_of_passing);
        
        // Add document URL if available
        if (edu.document_url) {
          this.checkPageBreak();
          this.doc.setFontSize(10);
          this.doc.setFont('helvetica', 'bold');
          this.doc.text('   Certificate:', this.margin, this.currentY);
          
          this.doc.setFont('helvetica', 'normal');
          this.doc.setTextColor(0, 0, 255);
          const labelWidth = this.doc.getTextWidth('   Certificate: ');
          this.doc.textWithLink('View Certificate', this.margin + labelWidth, this.currentY, { url: edu.document_url });
          this.doc.setTextColor(0, 0, 0);
          this.currentY += this.lineHeight;
        }
        
        // Handle documents array if it exists
        if (edu.documents && Array.isArray(edu.documents) && edu.documents.length > 0) {
          edu.documents.forEach((doc: any, docIdx: number) => {
            if (doc.fileUrl) {
              this.checkPageBreak();
              this.doc.setFontSize(10);
              this.doc.setFont('helvetica', 'bold');
              this.doc.text(`   Document ${docIdx + 1}:`, this.margin, this.currentY);
              
              this.doc.setFont('helvetica', 'normal');
              this.doc.setTextColor(0, 0, 255);
              const labelWidth = this.doc.getTextWidth(`   Document ${docIdx + 1}: `);
              this.doc.textWithLink('View Document', this.margin + labelWidth, this.currentY, { url: doc.fileUrl });
              this.doc.setTextColor(0, 0, 0);
              this.currentY += this.lineHeight;
            }
          });
        }
        
        this.addSpace();
      });
      this.addSpace();
    }

    // Employment History
    if (data.employment && data.employment.length > 0) {
      this.addSectionTitle('Employment History');
      data.employment.forEach((emp, index) => {
        this.addField(`${index + 1}. Company Name`, emp.company_name);
        this.addField('   Designation', emp.designation);
        this.addField('   Start Date', emp.start_date);
        this.addField('   End Date', emp.end_date);
        this.addField('   Reason for Leaving', emp.reason_for_leaving);
        this.addSpace();
      });
      this.addSpace();
    }

    // Passport & Visa
    if (data.passportVisa) {
      this.addSectionTitle('Passport & Visa Details');
      this.addField('Passport Number', data.passportVisa.passport_number);
      this.addField('Issue Date', data.passportVisa.issue_date);
      this.addField('Expiry Date', data.passportVisa.expiry_date);
      this.addField('Place of Issue', data.passportVisa.place_of_issue);
      this.addSpace(2);
    }

    // Bank, PF, NPS Details
    if (data.bankPfNps) {
      this.addSectionTitle('Bank, PF & NPS Details');
      this.addField('Bank Name', data.bankPfNps.bank_name);
      this.addField('Account Number', data.bankPfNps.account_number);
      this.addField('IFSC Code', data.bankPfNps.ifsc_code);
      this.addField('Branch Name', data.bankPfNps.branch_name);
      this.addField('PF Number', data.bankPfNps.pf_number);
      this.addField('UAN Number', data.bankPfNps.uan_number);
      this.addField('NPS Number', data.bankPfNps.nps_number);
      this.addSpace(2);
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
