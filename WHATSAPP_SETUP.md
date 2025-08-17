# WhatsApp Bot Setup for Smart Grievance System

This guide will help you set up and use the WhatsApp bot functionality for your Smart Grievance System.

## How to Use the WhatsApp Bot

### 🚀 Quick Start (Testing Locally)

1. **Start your server:**
   ```bash
   npm run dev
   ```

2. **Test the bot using the provided script:**
   ```powershell
   .\test-whatsapp-bot.ps1
   ```

### 📱 Using the Bot (User Perspective)

#### **Filing a Complaint:**

1. **Start a conversation** - Send any greeting:
   ```
   User: "Hi" or "Hello" or "Help"
   Bot: "Welcome to the Smart Grievance System! How can I help you today? You can say 'file a complaint' or 'check status'."
   ```

2. **Describe your complaint** (be detailed):
   ```
   User: "The street light near my house is not working since 3 days and creating safety issues"
   Bot: "Got it. I've categorized this as a 'electricity' issue with 'Medium' priority. What is the location of this issue?"
   ```

3. **Provide location:**
   ```
   User: "Rajwada Square, Indore"
   Bot: "Thank you. Finally, please set a simple password to secure this complaint."
   ```

4. **Set a password** (minimum 6 characters):
   ```
   User: "mypass123"
   Bot: "Excellent! Your complaint has been filed. Your Complaint ID is: 12345678-1234-5678-9abc-123456789012. Please save this ID."
   ```

#### **Checking Complaint Status:**

1. **Request status check:**
   ```
   User: "check status" or "status" or "track complaint"
   Bot: "To check the status of a complaint, please provide your Complaint ID."
   ```

2. **Provide your complaint ID:**
   ```
   User: "12345678-1234-5678-9abc-123456789012"
   Bot: "Complaint 12345678-1234-5678-9abc-123456789012 Status: Submitted - Your complaint has been received and is being reviewed."
   ```

### 🧪 Manual Testing Commands

You can test the bot manually using these PowerShell commands:

```powershell
# 1. Start conversation
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999999999", "Body": "hi"}'

# 2. File a complaint
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999999999", "Body": "Water pipe is broken in my area causing flooding"}'

# 3. Provide location
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999999999", "Body": "Near City Center, Indore"}'

# 4. Set password
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999999999", "Body": "password123"}'

# 5. Check status (use different phone number)
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919888888888", "Body": "check status"}'

# 6. Provide complaint ID
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919888888888", "Body": "[YOUR_COMPLAINT_ID_HERE]"}'
```

### 🤖 AI Features

The bot automatically:
- **Categorizes complaints** into: electricity, water-supply, road-transportation, sanitation, street-lighting, noise-pollution, general
- **Sets priority** based on keywords:
  - **High**: urgent, emergency, danger, health, sick
  - **Medium**: broken, problem, issue
  - **Low**: general complaints
- **Validates input** and provides helpful error messages

### 💡 Tips for Users

1. **Be specific** in your complaint description for better AI categorization
2. **Save your complaint ID** - you'll need it to check status
3. **Use simple passwords** but make them at least 6 characters
4. **Include location details** like landmarks, area names, or addresses
5. **One complaint per conversation** - start fresh for new complaints

## Features

The WhatsApp bot can:
- Accept and file complaints through conversational flow
- Check complaint status using complaint IDs
- Automatically categorize and prioritize complaints using AI
- Generate WhatsApp-specific complaint IDs (WACMP-XXXX format)

## Quick Test (No External Setup Required)

You can test the bot functionality directly with PowerShell commands:

```powershell
# Test initial greeting
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999988888", "Body": "hi"}'

# Test filing a complaint
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999988888", "Body": "the pot hole in front of my house is leaking and smelling badly"}'

# Provide location
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999988888", "Body": "khandwa naka"}'

# Set password
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999988888", "Body": "123456"}'

# Check status (use different phone number to test status checking)
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919777777777", "Body": "check status"}'

# Provide complaint ID (replace with actual ID from previous response)
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919777777777", "Body": "[COMPLAINT_ID_FROM_PREVIOUS_STEP]"}'
```

Or use the automated test script:
```powershell
.\test-whatsapp-bot.ps1
```

## Bot Conversation Flow

### Filing a Complaint
1. User sends a detailed complaint message
2. Bot uses AI to categorize and prioritize the complaint
3. Bot asks for location
4. Bot asks for a password to secure the complaint
5. Bot creates the complaint and provides a complaint ID

### Checking Status
1. User says "check status" or similar
2. Bot asks for complaint ID
3. User provides complaint ID (UUID format: 12345678-1234-5678-9abc-123456789012)
4. Bot returns current status

## Full WhatsApp Integration with Twilio (Optional)

To connect this bot to real WhatsApp numbers, you'll need to set up Twilio:

### 1. Twilio Account Setup
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get your Account SID and Auth Token
3. Set up WhatsApp Sandbox or get WhatsApp Business API approval

### 2. Environment Variables
Add these to your `.env` file:
```env
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 3. Webhook Configuration
In Twilio Console:
1. Go to Phone Numbers → Manage → WhatsApp Senders
2. Set webhook URL to: `https://your-domain.com/api/whatsapp/webhook`
3. Set HTTP method to POST

### 4. Testing with Real WhatsApp
1. Add your phone number to Twilio Sandbox
2. Send messages to your Twilio WhatsApp number
3. The bot will respond automatically

## Advanced Features

### AI-Powered Categorization
The bot automatically categorizes complaints into:
- road-transportation (potholes, traffic issues)
- water-supply (leaks, water problems)
- electricity (power outages, electrical issues)
- sanitation (garbage, cleanliness)
- street-lighting (broken street lights)
- noise-pollution (noise, smell issues)

### Priority Assignment
Based on keywords, complaints are prioritized as:
- **High**: urgent, emergency, danger, smell, sick, health
- **Medium**: broken, problem, issue
- **Low**: general complaints

### Complaint ID Generation
WhatsApp complaints get UUIDs as IDs in format: `12345678-1234-5678-9abc-123456789012`
- Standard UUID format for consistency with web platform
- Unique identification across all platforms

## API Endpoints

### WhatsApp Webhook
- **POST** `/api/whatsapp/webhook`
- Receives WhatsApp messages and processes them
- Body: `{ "From": "whatsapp:+1234567890", "Body": "message text" }`

### Public Complaint Tracking
- **GET** `/api/track/:id`
- Returns public complaint information without authentication
- Works with WhatsApp complaint IDs

### Webhook Verification
- **GET** `/api/whatsapp/webhook`
- Returns status for webhook verification

## Error Handling

The bot handles:
- Invalid/incomplete complaint descriptions
- Missing location information
- Weak passwords (< 6 characters)
- Invalid complaint IDs for status checks
- Network errors and timeouts

## Monitoring and Logs

Check server logs for:
- WhatsApp webhook errors
- AI analysis failures
- Database connection issues
- Conversation state management

## Security Considerations

1. **Rate Limiting**: Consider adding rate limiting for webhook endpoints
2. **Webhook Verification**: Add Twilio signature verification in production
3. **Data Privacy**: WhatsApp messages may contain PII
4. **Conversation Cleanup**: Old conversations are stored in memory
5. **Password Security**: Complaint passwords are hashed before storage

## Troubleshooting

### Common Issues
1. **Bot doesn't respond**: Check webhook URL and Twilio configuration
2. **Complaints not saving**: Verify database connection
3. **AI categorization fails**: Check if categories match your database
4. **Status check fails**: Ensure complaint IDs are correctly formatted

### Debugging
Enable debug mode by setting `NODE_ENV=development` in your `.env` file.

## Production Deployment

For production:
1. Use Redis for conversation state storage instead of memory
2. Add proper error monitoring (e.g., Sentry)
3. Implement webhook signature verification
4. Add rate limiting and DDoS protection
5. Set up proper logging and monitoring
6. Use HTTPS for all webhook URLs
