# 📱 WhatsApp Bot Quick Guide

## How to Use the WhatsApp Complaint Bot

### 🚀 Getting Started

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Test using the automated script:**
   ```powershell
   .\test-whatsapp-bot.ps1
   ```

### 💬 Bot Commands & Flow

#### **Filing a New Complaint**

```
👤 You: "Hi"
🤖 Bot: "Welcome to the Smart Grievance System! How can I help you today? You can say 'file a complaint' or 'check status'."

👤 You: "The street light is not working and it's dangerous at night"
🤖 Bot: "Got it. I've categorized this as a 'electricity' issue with 'High' priority. What is the location of this issue?"

👤 You: "MG Road, Indore"
🤖 Bot: "Thank you. Finally, please set a simple password to secure this complaint."

👤 You: "mypass123"
🤖 Bot: "Excellent! Your complaint has been filed. Your Complaint ID is: abc123def-4567-8901-2345-678901234567. Please save this ID."
```

#### **Checking Complaint Status**

```
👤 You: "check status"
🤖 Bot: "To check the status of a complaint, please provide your Complaint ID."

👤 You: "abc123def-4567-8901-2345-678901234567"
🤖 Bot: "Complaint abc123def-4567-8901-2345-678901234567 Status: In Progress - Your complaint is being worked on by the concerned department."
```

### 🤖 AI Smart Features

The bot automatically:
- **Categorizes** your complaint (electricity, water, roads, sanitation, etc.)
- **Sets priority** based on urgency keywords
- **Validates** your input and guides you through the process

### 🔧 Manual Testing

Test individual steps with these PowerShell commands:

```powershell
# 1. Greeting
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999999999", "Body": "hello"}'

# 2. File complaint
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999999999", "Body": "Water pipe burst causing street flooding"}'

# 3. Location
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999999999", "Body": "Rajwada Square, Indore"}'

# 4. Password
Invoke-RestMethod -Uri "http://localhost:3001/api/whatsapp/webhook" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"From": "whatsapp:+919999999999", "Body": "secure123"}'
```

### 💡 Pro Tips

- **Be specific** in your complaint description for better AI categorization
- **Save your complaint ID** - you'll need it to track status
- **Use different phone numbers** when testing status checks
- **Password must be 6+ characters**
- **Include landmarks** in location for better identification

### 📊 Complaint Categories

The AI categorizes complaints into:
- **electricity** - Power outages, street lights, electrical issues
- **water-supply** - Water leaks, supply issues, pipe problems  
- **road-transportation** - Potholes, traffic, road conditions
- **sanitation** - Garbage, cleanliness, waste management
- **street-lighting** - Street lamp issues, lighting problems
- **noise-pollution** - Noise, smell, environmental issues
- **general** - Other civic issues

### 🚨 Priority Levels

Based on keywords, complaints get priority:
- **High** - urgent, emergency, danger, health, sick, smell
- **Medium** - broken, problem, issue
- **Low** - general complaints

---

For full setup instructions including Twilio integration, see `WHATSAPP_SETUP.md`
