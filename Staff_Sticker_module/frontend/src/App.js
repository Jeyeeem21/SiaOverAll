import React, { useState } from 'react';
import './App.css';
import RequestList from './pages/RequestList';
import RequestDetail from './pages/RequestDetail';
import StickerCustomization from './pages/StickerCustomization';
import StickerPreview from './pages/StickerPreview';

function App() {
  const [currentPage, setCurrentPage] = useState('list');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [generatedSticker, setGeneratedSticker] = useState(null);

  // Demo data - sample sticker request
  const [requests, setRequests] = useState([
    {
      id: 1,
      studentName: 'Juan Dela Cruz',
      studentId: '2024-12345',
      vehicleType: 'Motorcycle',
      plateNumber: 'ABC-1234',
      status: 'pending',
      submittedDate: '2024-11-07',
      documents: ['Official Receipt', 'Certification of Registration', 'Driver\'s License']
    },
    {
      id: 2,
      studentName: 'Maria Santos',
      studentId: '2024-67890',
      vehicleType: 'Car',
      plateNumber: 'XYZ-5678',
      status: 'pending',
      submittedDate: '2024-11-06',
      documents: ['Official Receipt', 'Certification of Registration']
    }
  ]);

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setCurrentPage('detail');
  };

  const handleApprove = (request) => {
    setSelectedRequest(request);
    setCurrentPage('customize');
  };

  const handleDecline = (request, reason) => {
    // Update request status to declined
    setRequests(requests.map(r => 
      r.id === request.id 
        ? { ...r, status: 'declined', declineReason: reason, declinedDate: new Date().toLocaleDateString() } 
        : r
    ));
    
    // Show confirmation message
    alert(`Request from ${request.studentName} has been declined.\nReason: ${reason}`);
    
    // Go back to list
    setCurrentPage('list');
    setSelectedRequest(null);
  };

  const handleGenerateSticker = (customizationData) => {
    const sticker = {
      ...selectedRequest,
      ...customizationData,
      serialNumber: `MSU-2024-${String(Math.floor(Math.random() * 10000)).padStart(5, '0')}`,
      generatedDate: new Date().toLocaleDateString(),
      generatedTime: new Date().toLocaleTimeString()
    };
    setGeneratedSticker(sticker);
    
    // Update request status
    setRequests(requests.map(r => 
      r.id === selectedRequest.id 
        ? { ...r, status: 'completed' } 
        : r
    ));
    
    setCurrentPage('preview');
  };

  const handleBack = () => {
    setCurrentPage('list');
    setSelectedRequest(null);
    setGeneratedSticker(null);
  };

  return (
    <div className="App">
      {currentPage === 'list' && (
        <RequestList 
          requests={requests}
          onViewRequest={handleViewRequest}
          onApprove={handleApprove}
        />
      )}

      {currentPage === 'detail' && (
        <RequestDetail 
          request={selectedRequest}
          onBack={handleBack}
          onApprove={handleApprove}
          onDecline={handleDecline}
        />
      )}

      {currentPage === 'customize' && (
        <StickerCustomization 
          request={selectedRequest}
          onBack={handleBack}
          onGenerate={handleGenerateSticker}
        />
      )}

      {currentPage === 'preview' && (
        <StickerPreview 
          sticker={generatedSticker}
          onBack={handleBack}
        />
      )}
    </div>
  );
}

export default App;
