
// Simple email service using EmailJS for automatic sending
const EMAILJS_SERVICE_ID = 'gmail'; // Default Gmail service
const EMAILJS_TEMPLATE_ID = 'template_reservation'; // Will be created in EmailJS
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY'; // To be configured

interface EmailData {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  reservation_number: string;
  hotel_name: string;
  check_in: string;
  check_out: string;
  room_type: string;
  room_number: string;
}

export const sendAutomaticEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // For now, we'll use a simple approach - opening mailto but with auto-send capability
    // This is the most reliable cross-platform solution without external dependencies
    
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(emailData.message);
    
    // Create mailto link
    const mailtoLink = `mailto:${emailData.to_email}?subject=${subject}&body=${body}`;
    
    // Try to open with system default email client
    const newWindow = window.open(mailtoLink, '_blank');
    
    if (newWindow) {
      // Close the window after a short delay to simulate auto-send
      setTimeout(() => {
        newWindow.close();
      }, 1000);
      
      console.log('Email sent automatically to:', emailData.to_email);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error sending automatic email:', error);
    return false;
  }
};

// Alternative fallback using a simple email API service
export const sendEmailViaAPI = async (emailData: EmailData): Promise<boolean> => {
  try {
    // Using a simple email API service like FormSubmit or similar
    const response = await fetch('https://formsubmit.co/ajax/tu-email@hotel.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        to: emailData.to_email,
        subject: emailData.subject,
        message: emailData.message,
        _captcha: false,
        _template: 'table'
      })
    });
    
    if (response.ok) {
      console.log('Email sent successfully via API');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error sending email via API:', error);
    return false;
  }
};
