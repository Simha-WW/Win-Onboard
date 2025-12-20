/**
 * Vendor Service
 * Handles vendor notifications and document verification requests
 */

import { getMSSQLPool } from '../config/database';

interface VendorDetails {
  vendor_id: number;
  vendor_name: string;
  email: string;
  contact_number?: string;
  company_name?: string;
  status: string;
}

interface DocumentVerificationRequest {
  fresherId: number;
  fresherName: string;
  fresherEmail: string;
  designation: string;
  department: string;
  documents: {
    aadharUrl?: string;
    panCardUrl?: string;
    resumeUrl?: string;
    educationDocumentUrls?: string[];
  };
}

export class VendorService {
  /**
   * Get all active vendors
   */
  static async getActiveVendors(): Promise<VendorDetails[]> {
    try {
      const pool = getMSSQLPool();
      
      const result = await pool.request().query(`
        SELECT 
          vendor_id,
          vendor_name,
          email,
          contact_number,
          company_name,
          status
        FROM vendor_details
        WHERE status = 'active'
        ORDER BY vendor_id
      `);
      
      return result.recordset;
    } catch (error) {
      console.error('Error fetching active vendors:', error);
      throw error;
    }
  }

  /**
   * Send document verification request to vendor
   */
  static async sendDocumentVerificationRequest(
    requestData: DocumentVerificationRequest
  ): Promise<void> {
    try {
      console.log('📧 Sending document verification request to vendor...');
      
      // Get active vendors
      const vendors = await this.getActiveVendors();
      
      if (vendors.length === 0) {
        console.log('⚠️ No active vendors found for notification');
        return;
      }

      const { emailService } = await import('./email.service');
      
      // Send email to each active vendor
      for (const vendor of vendors) {
        await emailService.sendVendorDocumentVerification({
          vendorEmail: vendor.email,
          vendorName: vendor.vendor_name,
          fresherName: requestData.fresherName,
          fresherEmail: requestData.fresherEmail,
          fresherId: requestData.fresherId,
          designation: requestData.designation,
          department: requestData.department,
          documents: requestData.documents
        });

        console.log(`✅ Document verification request sent to ${vendor.email}`);
      }

      console.log('📧 All vendor notifications sent successfully');
    } catch (error) {
      console.error('❌ Error sending vendor notifications:', error);
      throw error;
    }
  }

  /**
   * Add new vendor
   */
  static async addVendor(vendorData: {
    vendor_name: string;
    email: string;
    contact_number?: string;
    company_name?: string;
  }): Promise<VendorDetails> {
    try {
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      // Check if vendor email already exists
      const existingVendor = await pool.request()
        .input('email', mssql.NVarChar, vendorData.email)
        .query('SELECT vendor_id FROM vendor_details WHERE email = @email');

      if (existingVendor.recordset.length > 0) {
        throw new Error('Vendor with this email already exists');
      }

      // Insert new vendor
      const result = await pool.request()
        .input('vendor_name', mssql.NVarChar, vendorData.vendor_name)
        .input('email', mssql.NVarChar, vendorData.email)
        .input('contact_number', mssql.NVarChar, vendorData.contact_number || null)
        .input('company_name', mssql.NVarChar, vendorData.company_name || null)
        .query(`
          INSERT INTO vendor_details (vendor_name, email, contact_number, company_name, status)
          OUTPUT INSERTED.*
          VALUES (@vendor_name, @email, @contact_number, @company_name, 'active')
        `);

      console.log(`✅ Added vendor: ${vendorData.email}`);
      return result.recordset[0];
    } catch (error) {
      console.error('❌ Error adding vendor:', error);
      throw error;
    }
  }

  /**
   * Get vendor by ID
   */
  static async getVendorById(vendorId: number): Promise<VendorDetails | null> {
    try {
      const pool = getMSSQLPool();
      const mssql = await import('mssql');

      const result = await pool.request()
        .input('vendorId', mssql.Int, vendorId)
        .query('SELECT * FROM vendor_details WHERE vendor_id = @vendorId');

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error fetching vendor:', error);
      throw error;
    }
  }
}
