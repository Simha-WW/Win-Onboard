const fs = require('fs');

// Simulate the email HTML generation
const milestone = 30;
const user = {
  first_name: 'Pulipati',
  last_name: 'Simha',
  email: 'vijayasimha8878@gmail.com',
  designation: 'Software Engineer',
  department: 'Engineering',
  completed_modules: 3,
  pending_modules: 2,
  total_modules: 5,
  progress_percentage: 60,
  deadline: new Date('2025-02-20'),
  days_remaining: 60
};

const ldMember = {
  first_name: 'L&D',
  last_name: 'Team',
  email: 'saitharakreddyv59@gmail.com'
};

const completedModulesList = '<li style="color: #059669; margin: 8px 0;">✅ Module 1</li><li style="color: #059669; margin: 8px 0;">✅ Module 2</li>';
const pendingModulesList = '<li style="color: #dc2626; margin: 8px 0;">⏳ Module 3</li><li style="color: #dc2626; margin: 8px 0;">⏳ Module 4</li>';
const progressBarColor = '#f59e0b';
const milestoneEmoji = '📅';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const emailBody = `
          <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 40px; border-radius: 15px 15px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 32px;">${milestoneEmoji} ${milestone}-Day Progress Report</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0; font-size: 16px;">L&D Team Dashboard</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 40px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 15px 15px;">
              <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">
                Dear <strong>${ldMember.first_name} ${ldMember.last_name}</strong>,
              </p>
              
              <p style="font-size: 15px; color: #4b5563; line-height: 1.6; margin-bottom: 25px;">
                This is the <strong>${milestone}-day progress report</strong> for <strong>${user.first_name} ${user.last_name}</strong>.
              </p>
              
              <!-- Employee Info -->
              <div style="background-color: #f9fafb; padding: 20px; border-radius: 10px; margin-bottom: 25px;">
                <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px;">👤 Employee Information</h3>
                <div style="color: #4b5563; line-height: 1.8;">
                  <strong>Name:</strong> ${user.first_name} ${user.last_name}<br>
                  <strong>Email:</strong> ${user.email}<br>
                  <strong>Designation:</strong> ${user.designation || 'N/A'}<br>
                  <strong>Department:</strong> ${user.department || 'N/A'}<br>
                  <strong>Days Since Assignment:</strong> ${milestone} days
                </div>
              </div>

              <!-- Progress Summary -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 5px solid #3b82f6; padding: 25px; margin: 30px 0; border-radius: 10px;">
                <h2 style="color: #1e40af; margin: 0 0 20px 0; font-size: 22px;">📊 Progress Summary</h2>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
                  <div style="text-align: center; flex: 1;">
                    <div style="font-size: 36px; font-weight: bold; color: #10b981;">${user.completed_modules}</div>
                    <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Completed</div>
                  </div>
                  <div style="text-align: center; flex: 1;">
                    <div style="font-size: 36px; font-weight: bold; color: #ef4444;">${user.pending_modules}</div>
                    <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Pending</div>
                  </div>
                  <div style="text-align: center; flex: 1;">
                    <div style="font-size: 36px; font-weight: bold; color: #3b82f6;">${user.total_modules}</div>
                    <div style="color: #6b7280; font-size: 14px; margin-top: 5px;">Total</div>
                  </div>
                </div>
                
                <!-- Progress Bar -->
                <div style="margin: 20px 0;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="color: #374151; font-weight: 600;">Overall Progress</span>
                    <span style="color: #374151; font-weight: bold; font-size: 18px;">${user.progress_percentage}%</span>
                  </div>
                  <div style="background-color: #e5e7eb; border-radius: 10px; height: 20px; overflow: hidden;">
                    <div style="background-color: ${progressBarColor}; width: ${user.progress_percentage}%; height: 100%; border-radius: 10px;"></div>
                  </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-top: 20px; padding-top: 20px; border-top: 2px solid #bfdbfe;">
                  <div>
                    <strong style="color: #1e40af;">Deadline:</strong> <span style="color: #374151;">${new Date(user.deadline).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <strong style="color: #1e40af;">Days Remaining:</strong> <span style="color: ${user.days_remaining < 7 ? '#dc2626' : '#374151'}">${user.days_remaining} days</span>
                  </div>
                </div>
              </div>

              <!-- Completed Modules -->
              ${user.completed_modules > 0 ? `
              <div style="margin: 30px 0;">
                <h3 style="color: #059669; font-size: 18px; margin-bottom: 15px;">✅ Completed Modules (${user.completed_modules})</h3>
                <ul style="list-style: none; padding: 0; background-color: #f0fdf4; padding: 20px; border-radius: 10px;">
                  ${completedModulesList}
                </ul>
              </div>
              ` : ''}

              <!-- Pending Modules -->
              ${user.pending_modules > 0 ? `
              <div style="margin: 30px 0;">
                <h3 style="color: #dc2626; font-size: 18px; margin-bottom: 15px;">⏳ Pending Modules (${user.pending_modules})</h3>
                <ul style="list-style: none; padding: 0; background-color: #fef2f2; padding: 20px; border-radius: 10px;">
                  ${pendingModulesList}
                </ul>
              </div>
              ` : ''}

              <!-- Recommendation -->
              <div style="background: ${user.progress_percentage < 50 ? '#fef2f2' : '#f0fdf4'}; border-left: 5px solid ${user.progress_percentage < 50 ? '#ef4444' : '#10b981'}; padding: 20px; margin: 30px 0; border-radius: 10px;">
                <h3 style="color: ${user.progress_percentage < 50 ? '#991b1b' : '#065f46'}; margin: 0 0 10px 0; font-size: 16px;">📋 L&D Team Action</h3>
                <p style="color: #4b5563; margin: 0; font-size: 14px; line-height: 1.6;">
                  ${user.progress_percentage < 50 
                    ? `⚠️ <strong>Action Required:</strong> Employee progress is below expectations. Consider reaching out to provide support or schedule a check-in meeting.`
                    : `✅ <strong>Good Progress:</strong> Employee is on track. Continue monitoring their progress.`
                  }
                </p>
              </div>
              
              <!-- Admin Login Link -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${FRONTEND_URL}/hr/login" 
                   style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
                          color: white; padding: 14px 35px; text-decoration: none; border-radius: 8px; 
                          font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  🔐 Access Admin Portal
                </a>
                <p style="margin-top: 12px; font-size: 13px; color: #6b7280;">
                  Or visit: <a href="${FRONTEND_URL}/hr/login" style="color: #4f46e5;">${FRONTEND_URL}/hr/login</a>
                </p>
              </div>
              
              <p style="font-size: 15px; color: #374151; margin-top: 30px;">
                Best regards,<br>
                <strong>WinOnboard Learning Management System</strong>
              </p>
            </div>
            
            <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
              <p style="margin: 5px 0;">Automated ${milestone}-day progress report for L&D team.</p>
            </div>
          </div>
        `;

// Save to HTML file
fs.writeFileSync('ld-email-preview.html', emailBody);
console.log('✅ Email HTML saved to ld-email-preview.html');
console.log('📧 Open this file in a browser to see how the email looks');
console.log('\n🔍 Search for "Access Admin Portal" in the file - it should be there!');
