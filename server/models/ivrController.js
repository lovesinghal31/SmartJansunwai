const Complaint = require('../models/Complaint');

// --- Step 1: Main IVR Menu ---
exports.handleIncomingCall = (req, res) => {
  const twiml = `
    <Response>
      <Gather numDigits="1" action="/ivr-menu" method="POST">
        <Say>Welcome to Jansunwai. 
        Press 1 to register a new complaint. 
        Press 2 to check your complaint status.</Say>
      </Gather>
    </Response>
  `;
  res.type('text/xml').send(twiml);
};

// --- Step 2: Handle Menu Selection ---
exports.handleMenu = (req, res) => {
  const { Digits } = req.body;

  if (Digits === '1') {
    // Ask category
    const twiml = `
      <Response>
        <Gather numDigits="1" action="/ivr-category" method="POST">
          <Say>You chose to register a complaint.
          Press 1 for Water Supply and Sewerage.
          Press 2 for Road and Transportation.
          Press 3 for Electricity.
          Press 4 for Sanitation.
          Press 5 for Street Lighting.
          Press 6 for Parks and Recreation.</Say>
        </Gather>
      </Response>
    `;
    return res.type('text/xml').send(twiml);
  }

  if (Digits === '2') {
    // Ask how they want to search
    const twiml = `
      <Response>
        <Gather numDigits="1" action="/ivr-status-option" method="POST">
          <Say>You chose to check complaint status.
          Press 1 to search by Complaint ID.
          Press 2 to search by your phone number.</Say>
        </Gather>
      </Response>
    `;
    return res.type('text/xml').send(twiml);
  }

  res.type('text/xml').send(`
    <Response><Say>Invalid choice. Goodbye.</Say><Hangup/></Response>
  `);
};

// --- Step 3: Complaint Category ---
exports.handleCategory = (req, res) => {
  const { Digits, From } = req.body;
  const categories = {
    "1": "Water Supply and Sewerage",
    "2": "Road and Transportation",
    "3": "Electricity",
    "4": "Sanitation",
    "5": "Street Lighting",
    "6": "Parks and Recreation"
  };
  const chosenCategory = categories[Digits] || "Uncategorized";

  // Save chosen category in session (in real app use Redis/DB, here pass in query)
  const twiml = `
    <Response>
      <Gather input="speech" action="/ivr-location?category=${encodeURIComponent(chosenCategory)}&from=${From}" method="POST">
        <Say>Please say the location of your complaint after the beep.</Say>
      </Gather>
    </Response>
  `;
  res.type('text/xml').send(twiml);
};

// --- Step 4: Capture Location ---
exports.handleLocation = (req, res) => {
  const { SpeechResult } = req.body;
  const { category, from } = req.query;

  const location = SpeechResult || "Not Provided";

  const twiml = `
    <Response>
      <Say>Thank you. Now please describe your complaint after the beep.</Say>
      <Record action="/ivr-save-complaint?category=${encodeURIComponent(category)}&location=${encodeURIComponent(location)}&from=${from}" method="POST" />
    </Response>
  `;
  res.type('text/xml').send(twiml);
};

// --- Step 5: Save Complaint ---
exports.saveComplaint = async (req, res) => {
  try {
    const { RecordingUrl } = req.body;
    const { category, location, from } = req.query;

    const newComplaint = await Complaint.create({
      name: "Phone Caller",
      contact: from,
      password: "dummyPass",
      id: Date.now().toString(),
      citizenId: from,
      title: "IVR Complaint",
      description: "Voice complaint recorded",
      category: category || "Uncategorized",
      location: location || "Not Provided",
      priority: "Pending",
      source: "IVR",
      ivr: { recordingUrl: RecordingUrl }
    });

    const twiml = `
      <Response>
        <Say>Your complaint has been registered. Your complaint ID is ${newComplaint.id}. Thank you.</Say>
      </Response>
    `;
    res.type('text/xml').send(twiml);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error saving complaint");
  }
};

// --- Step 6: Status Option ---
exports.handleStatusOption = (req, res) => {
  const { Digits } = req.body;

  if (Digits === '1') {
    const twiml = `
      <Response>
        <Say>Please enter your Complaint ID followed by the pound key.</Say>
        <Gather finishOnKey="#" action="/ivr-status-by-id" method="POST" />
      </Response>
    `;
    return res.type('text/xml').send(twiml);
  }

  if (Digits === '2') {
    const twiml = `
      <Response>
        <Say>Please enter your registered mobile number followed by the pound key.</Say>
        <Gather finishOnKey="#" action="/ivr-status-by-phone" method="POST" />
      </Response>
    `;
    return res.type('text/xml').send(twiml);
  }

  res.type('text/xml').send(`<Response><Say>Invalid option. Goodbye.</Say></Response>`);
};

// --- Step 7a: Check Status by ID ---
exports.checkStatusById = async (req, res) => {
  try {
    const { Digits } = req.body;
    const complaint = await Complaint.findOne({ id: Digits });

    const message = complaint 
      ? `Your complaint status is ${complaint.status}`
      : `No complaint found with ID ${Digits}`;

    const twiml = `<Response><Say>${message}</Say></Response>`;
    res.type('text/xml').send(twiml);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching complaint status");
  }
};

// --- Step 7b: Check Status by Phone ---
exports.checkStatusByPhone = async (req, res) => {
  try {
    const { Digits } = req.body;
    const complaint = await Complaint.findOne({ contact: Digits }).sort({ createdAt: -1 });

    const message = complaint 
      ? `Your latest complaint status is ${complaint.status}`
      : `No complaint found for phone number ${Digits}`;

    const twiml = `<Response><Say>${message}</Say></Response>`;
    res.type('text/xml').send(twiml);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching complaint status");
  }
};
