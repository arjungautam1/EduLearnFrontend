export const generateCertificate = (studentName, courseName, instructorName, completionDate, certificateId) => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size (A4 landscape proportions)
  canvas.width = 1200;
  canvas.height = 850;
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, '#f8f9fa');
  gradient.addColorStop(1, '#e9ecef');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  // Outer border
  ctx.strokeStyle = '#0d6efd';
  ctx.lineWidth = 8;
  ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
  
  // Inner border
  ctx.strokeStyle = '#6c757d';
  ctx.lineWidth = 2;
  ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);
  
  // Modern decorative elements - corner ribbons and geometric patterns
  
  // Top-left geometric pattern
  ctx.fillStyle = '#0d6efd';
  ctx.fillRect(80, 80, 60, 8);
  ctx.fillRect(80, 95, 45, 6);
  ctx.fillRect(80, 108, 30, 4);
  
  // Top-right geometric pattern
  ctx.fillStyle = '#198754';
  ctx.fillRect(canvas.width - 140, 80, 60, 8);
  ctx.fillRect(canvas.width - 125, 95, 45, 6);
  ctx.fillRect(canvas.width - 110, 108, 30, 4);
  
  // Realistic certification ribbon design
  
  // Main medal circle with gradient shading
  const medalGradient = ctx.createRadialGradient(95, canvas.height - 125, 0, 100, canvas.height - 120, 30);
  medalGradient.addColorStop(0, '#ffd700');
  medalGradient.addColorStop(0.7, '#ffc107');
  medalGradient.addColorStop(1, '#e0a800');
  ctx.fillStyle = medalGradient;
  ctx.beginPath();
  ctx.arc(100, canvas.height - 120, 30, 0, 2 * Math.PI);
  ctx.fill();
  
  // Medal border for definition
  ctx.strokeStyle = '#b8860b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(100, canvas.height - 120, 30, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Inner decorative ring
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(100, canvas.height - 120, 22, 0, 2 * Math.PI);
  ctx.stroke();
  
  // Left ribbon with realistic shading and curves
  ctx.fillStyle = '#dc3545';
  ctx.beginPath();
  ctx.moveTo(85, canvas.height - 95);
  ctx.quadraticCurveTo(80, canvas.height - 90, 85, canvas.height - 85);
  ctx.lineTo(95, canvas.height - 85);
  ctx.quadraticCurveTo(100, canvas.height - 90, 95, canvas.height - 95);
  ctx.lineTo(95, canvas.height - 50);
  ctx.lineTo(90, canvas.height - 45);
  ctx.lineTo(85, canvas.height - 50);
  ctx.closePath();
  ctx.fill();
  
  // Left ribbon shading (darker side)
  ctx.fillStyle = '#b02a37';
  ctx.beginPath();
  ctx.moveTo(85, canvas.height - 95);
  ctx.quadraticCurveTo(80, canvas.height - 90, 85, canvas.height - 85);
  ctx.lineTo(90, canvas.height - 85);
  ctx.lineTo(90, canvas.height - 50);
  ctx.lineTo(85, canvas.height - 50);
  ctx.closePath();
  ctx.fill();
  
  // Right ribbon with realistic shading and curves
  ctx.fillStyle = '#007bff';
  ctx.beginPath();
  ctx.moveTo(115, canvas.height - 95);
  ctx.quadraticCurveTo(120, canvas.height - 90, 115, canvas.height - 85);
  ctx.lineTo(105, canvas.height - 85);
  ctx.quadraticCurveTo(100, canvas.height - 90, 105, canvas.height - 95);
  ctx.lineTo(105, canvas.height - 50);
  ctx.lineTo(110, canvas.height - 45);
  ctx.lineTo(115, canvas.height - 50);
  ctx.closePath();
  ctx.fill();
  
  // Right ribbon shading (darker side)
  ctx.fillStyle = '#0056b3';
  ctx.beginPath();
  ctx.moveTo(115, canvas.height - 95);
  ctx.quadraticCurveTo(120, canvas.height - 90, 115, canvas.height - 85);
  ctx.lineTo(110, canvas.height - 85);
  ctx.lineTo(110, canvas.height - 50);
  ctx.lineTo(115, canvas.height - 50);
  ctx.closePath();
  ctx.fill();
  
  // Ribbon attachment points (where ribbons connect to medal)
  ctx.fillStyle = '#6c757d';
  ctx.fillRect(85, canvas.height - 105, 10, 8);
  ctx.fillRect(105, canvas.height - 105, 10, 8);
  
  // Achievement symbol in center
  ctx.fillStyle = '#198754';
  ctx.font = 'bold 20px serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', 100, canvas.height - 115);
  
  // Medal highlight for 3D effect
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(95, canvas.height - 128, 8, 0, 2 * Math.PI);
  ctx.fill();
  
  // Bottom-right modern accent lines
  ctx.strokeStyle = '#0d6efd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(canvas.width - 120, canvas.height - 140);
  ctx.lineTo(canvas.width - 80, canvas.height - 140);
  ctx.moveTo(canvas.width - 120, canvas.height - 150);
  ctx.lineTo(canvas.width - 95, canvas.height - 150);
  ctx.stroke();
  
  // Add elegant corner flourishes
  ctx.strokeStyle = '#0d6efd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  // Top corners
  ctx.moveTo(80, 140);
  ctx.quadraticCurveTo(90, 130, 100, 140);
  ctx.moveTo(canvas.width - 100, 140);
  ctx.quadraticCurveTo(canvas.width - 90, 130, canvas.width - 80, 140);
  ctx.stroke();
  
  // Title - better positioned
  ctx.fillStyle = '#0d6efd';
  ctx.font = 'bold 56px serif';
  ctx.textAlign = 'center';
  ctx.fillText('Certificate of Completion', canvas.width / 2, 180);
  
  // Subtitle with better spacing
  ctx.fillStyle = '#6c757d';
  ctx.font = '26px sans-serif';
  ctx.fillText('This is to certify that', canvas.width / 2, 240);
  
  // Student name - prominently displayed in capital letters
  ctx.fillStyle = '#212529';
  ctx.font = 'bold 52px serif';
  const studentNameCaps = studentName.toUpperCase();
  ctx.fillText(studentNameCaps, canvas.width / 2, 320);
  
  // Decorative underline for student name
  ctx.strokeStyle = '#0d6efd';
  ctx.lineWidth = 3;
  ctx.beginPath();
  const nameWidth = ctx.measureText(studentNameCaps).width;
  ctx.moveTo((canvas.width - nameWidth) / 2, 335);
  ctx.lineTo((canvas.width + nameWidth) / 2, 335);
  ctx.stroke();
  
  // Course completion text with better spacing
  ctx.fillStyle = '#6c757d';
  ctx.font = '26px sans-serif';
  ctx.fillText('has successfully completed the course', canvas.width / 2, 390);
  
  // Course name - highlighted
  ctx.fillStyle = '#198754';
  ctx.font = 'bold 40px serif';
  ctx.fillText(courseName, canvas.width / 2, 450);
  
  // Completion date - centered with better spacing
  ctx.fillStyle = '#6c757d';
  ctx.font = '22px sans-serif';
  ctx.fillText(`Completed on ${completionDate}`, canvas.width / 2, 520);
  
  // Signature section - properly balanced layout
  const leftSignatureX = 280;
  const rightBrandX = canvas.width - 280;
  
  // Instructor signature area (left side)
  ctx.fillStyle = '#212529';
  ctx.font = '20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Instructor', leftSignatureX, 640);
  
  // Instructor name
  ctx.fillStyle = '#0d6efd';
  ctx.font = 'bold 24px serif';
  ctx.fillText(instructorName, leftSignatureX, 670);
  
  // Instructor signature line
  ctx.strokeStyle = '#6c757d';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(leftSignatureX - 80, 690);
  ctx.lineTo(leftSignatureX + 80, 690);
  ctx.stroke();
  
  // Date section (right side for balance)
  ctx.fillStyle = '#212529';
  ctx.font = '20px sans-serif';
  ctx.fillText('Date', rightBrandX, 640);
  
  // Date value
  ctx.fillStyle = '#198754';
  ctx.font = 'bold 24px serif';
  ctx.fillText(new Date(completionDate).toLocaleDateString(), rightBrandX, 670);
  
  // Date signature line
  ctx.strokeStyle = '#6c757d';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(rightBrandX - 80, 690);
  ctx.lineTo(rightBrandX + 80, 690);
  ctx.stroke();
  
  // EduLearn branding - moved down for better spacing
  ctx.fillStyle = '#0d6efd';
  ctx.font = 'bold 28px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('EduLearn', canvas.width - 80, canvas.height - 100);
  
  // Platform description
  ctx.fillStyle = '#6c757d';
  ctx.font = '16px sans-serif';
  ctx.fillText('Online Learning Platform', canvas.width - 80, canvas.height - 80);
  
  // Certificate ID - positioned inside border
  ctx.fillStyle = '#adb5bd';
  ctx.font = '14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`Certificate ID: ${certificateId}`, canvas.width / 2, canvas.height - 80);
  
  return canvas;
};

export const downloadCertificate = (canvas, fileName) => {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = canvas.toDataURL('image/png');
  link.click();
};

export const getCertificateDataURL = (canvas) => {
  return canvas.toDataURL('image/png');
};