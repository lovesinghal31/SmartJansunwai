// Test script for WhatsApp bot functionality
import { handleWhatsAppMessage } from './whatsappBot';

async function testWhatsAppBot() {
  console.log('Testing WhatsApp Bot...\n');
  
  const testPhone = 'whatsapp:+919999988888';
  
  // Test 1: Initial greeting
  console.log('Test 1: Initial greeting');
  let response = await handleWhatsAppMessage(testPhone, 'hi');
  console.log('Response:', response);
  console.log('');
  
  // Test 2: Filing a complaint directly
  console.log('Test 2: Filing a complaint');
  response = await handleWhatsAppMessage(testPhone, 'the pot hole in front of my house is leaking and smelling badly from few days we are having problem and danger of getting sick of it');
  console.log('Response:', response);
  console.log('');
  
  // Test 3: Providing location
  console.log('Test 3: Providing location');
  response = await handleWhatsAppMessage(testPhone, 'khandwa naka');
  console.log('Response:', response);
  console.log('');
  
  // Test 4: Setting password
  console.log('Test 4: Setting password');
  response = await handleWhatsAppMessage(testPhone, '123456');
  console.log('Response:', response);
  console.log('');
  
  // Test 5: Check status intent
  console.log('Test 5: Check status intent');
  response = await handleWhatsAppMessage(testPhone, 'whats the complaint status');
  console.log('Response:', response);
  console.log('');
  
  // Test 6: Invalid input
  console.log('Test 6: Invalid input');
  response = await handleWhatsAppMessage(testPhone, 'random text');
  console.log('Response:', response);
  console.log('');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testWhatsAppBot().catch(console.error);
}

export { testWhatsAppBot };
