const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Mock database
let stickers = [];
let stickerTypes = [
  {
    id: 1,
    name: "Parking Sticker",
    slug: "parking",
    description: "For authorized parking spaces",
    color: "#4287f5",
    price: 10.00,
    validity_days: 365,
    requires_vehicle_details: true,
    requires_approval: true,
  },
  {
    id: 2,
    name: "Laboratory Access",
    slug: "lab-access",
    description: "Lab access and equipment usage",
    color: "#f54242",
    price: 5.00,
    validity_days: 180,
    requires_vehicle_details: false,
    requires_approval: true,
  },
  {
    id: 3,
    name: "Event Access",
    slug: "event-access",
    description: "Access to special events",
    color: "#f5c442",
    price: 0.00,
    validity_days: 30,
    requires_vehicle_details: false,
    requires_approval: false,
  },
];

let stickerRequests = [];
let requestCounter = 1;

// Routes

// Public endpoints
app.get('/api/sticker-types', (req, res) => {
  res.json(stickerTypes);
});

app.get('/api/stickers/verify/:serial', (req, res) => {
  const sticker = stickers.find(s => s.serial_number === req.params.serial);
  if (!sticker) {
    return res.json({ valid: false, status: 'not_found' });
  }
  
  const expiryDate = new Date(sticker.expiry_date);
  if (expiryDate < new Date()) {
    return res.json({ valid: false, status: 'expired' });
  }
  
  res.json({
    valid: true,
    status: 'active',
    sticker: sticker,
  });
});

// Protected endpoints - requests
app.get('/api/sticker-requests', (req, res) => {
  const requests = stickerRequests.map(r => ({
    ...r,
    sticker_type: stickerTypes.find(t => t.id === r.sticker_type_id),
  }));
  res.json({ data: requests });
});

app.post('/api/sticker-requests', (req, res) => {
  const { sticker_type_id, quantity, vehicle_registration, purpose } = req.body;
  
  if (!sticker_type_id || !quantity) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  
  const type = stickerTypes.find(t => t.id === parseInt(sticker_type_id));
  if (!type) {
    return res.status(404).json({ message: 'Sticker type not found' });
  }
  
  const request = {
    id: requestCounter++,
    sticker_type_id: parseInt(sticker_type_id),
    quantity: parseInt(quantity),
    vehicle_registration,
    purpose,
    status: 'pending',
    total_amount: type.price * quantity,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  stickerRequests.push(request);
  res.status(201).json(request);
});

app.get('/api/sticker-requests/:id', (req, res) => {
  const request = stickerRequests.find(r => r.id === parseInt(req.params.id));
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  
  res.json({
    ...request,
    sticker_type: stickerTypes.find(t => t.id === request.sticker_type_id),
    stickers: stickers.filter(s => s.sticker_request_id === request.id),
  });
});

app.post('/api/sticker-requests/:id/cancel', (req, res) => {
  const request = stickerRequests.find(r => r.id === parseInt(req.params.id));
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  
  if (!['pending', 'approved'].includes(request.status)) {
    return res.status(422).json({ error: 'Cannot cancel this request' });
  }
  
  request.status = 'cancelled';
  request.updated_at = new Date().toISOString();
  res.json(request);
});

// Staff endpoints
app.post('/api/sticker-requests/:id/approve', (req, res) => {
  const request = stickerRequests.find(r => r.id === parseInt(req.params.id));
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  
  request.status = 'approved';
  request.approval_notes = req.body.approval_notes || '';
  request.approved_at = new Date().toISOString();
  request.updated_at = new Date().toISOString();
  res.json(request);
});

app.post('/api/sticker-requests/:id/reject', (req, res) => {
  const request = stickerRequests.find(r => r.id === parseInt(req.params.id));
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  
  request.status = 'rejected';
  request.rejection_reason = req.body.rejection_reason || '';
  request.rejected_at = new Date().toISOString();
  request.updated_at = new Date().toISOString();
  res.json(request);
});

app.post('/api/sticker-requests/:id/mark-paid', (req, res) => {
  const request = stickerRequests.find(r => r.id === parseInt(req.params.id));
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  
  request.status = 'paid';
  request.payment_reference = req.body.payment_reference;
  request.payment_date = new Date().toISOString();
  request.updated_at = new Date().toISOString();
  res.json(request);
});

app.post('/api/sticker-requests/:id/print', (req, res) => {
  const request = stickerRequests.find(r => r.id === parseInt(req.params.id));
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  
  if (request.status !== 'paid') {
    return res.status(422).json({ error: 'Request must be paid' });
  }
  
  const generateStickers = () => {
    const result = [];
    for (let i = 0; i < request.quantity; i++) {
      const serial = `STK-${request.sticker_type_id}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const sticker = {
        id: stickers.length + 1,
        sticker_request_id: request.id,
        serial_number: serial,
        qr_code: JSON.stringify({ serial, issued: new Date().toISOString() }),
        issue_date: new Date().toISOString().split('T')[0],
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        reprint_count: 0,
      };
      stickers.push(sticker);
      result.push(sticker);
    }
    return result;
  };
  
  const newStickers = generateStickers();
  request.status = 'printed';
  request.printed_at = new Date().toISOString();
  request.updated_at = new Date().toISOString();
  
  res.json({
    ...request,
    stickers: newStickers,
  });
});

app.post('/api/sticker-requests/:id/release', (req, res) => {
  const request = stickerRequests.find(r => r.id === parseInt(req.params.id));
  if (!request) {
    return res.status(404).json({ message: 'Request not found' });
  }
  
  request.status = 'released';
  request.released_at = new Date().toISOString();
  request.updated_at = new Date().toISOString();
  res.json(request);
});

app.get('/api/stickers/:id', (req, res) => {
  const sticker = stickers.find(s => s.id === parseInt(req.params.id));
  if (!sticker) {
    return res.status(404).json({ message: 'Sticker not found' });
  }
  res.json(sticker);
});

app.post('/api/stickers/:id/reprint', (req, res) => {
  const sticker = stickers.find(s => s.id === parseInt(req.params.id));
  if (!sticker) {
    return res.status(404).json({ message: 'Sticker not found' });
  }
  
  if (sticker.reprint_count >= 3) {
    return res.status(422).json({ error: 'Cannot reprint this sticker' });
  }
  
  sticker.reprint_count += 1;
  sticker.qr_code = JSON.stringify({ 
    serial: sticker.serial_number, 
    reprint: sticker.reprint_count,
    issued: new Date().toISOString() 
  });
  
  res.json(sticker);
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`\n✅ Backend API running at http://localhost:${PORT}`);
  console.log(`📚 API Docs: http://localhost:${PORT}/api/sticker-types\n`);
});
