import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';

const StickerContext = createContext();

export const StickerProvider = ({ children }) => {
  const [stickerTypes, setStickerTypes] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      'Content-Type': 'application/json',
    },
  });

  const fetchStickerTypes = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/sticker-types');
      setStickerTypes(response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch sticker types');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/sticker-requests');
      setRequests(response.data.data || response.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, []);

  const createRequest = useCallback(async (data) => {
    try {
      setLoading(true);
      const response = await apiClient.post('/sticker-requests', data);
      setRequests([response.data, ...requests]);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create request';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requests]);

  const uploadAttachment = useCallback(async (requestId, file, uploadType) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_type', uploadType);

      const response = await apiClient.post(
        `/sticker-requests/${requestId}/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to upload attachmentsb ';
      setError(errorMsg);
      throw err;
    }
  }, []);

  const approveRequest = useCallback(async (requestId, notes) => {
    try {
      setLoading(true);
      const response = await apiClient.post(
        `/sticker-requests/${requestId}/approve`,
        { approval_notes: notes }
      );
      setRequests(requests.map(r => r.id === requestId ? response.data : r));
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to approve request';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requests]);

  const rejectRequest = useCallback(async (requestId, reason) => {
    try {
      setLoading(true);
      const response = await apiClient.post(
        `/sticker-requests/${requestId}/reject`,
        { rejection_reason: reason }
      );
      setRequests(requests.map(r => r.id === requestId ? response.data : r));
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reject request';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requests]);

  const markAsPaid = useCallback(async (requestId, paymentReference) => {
    try {
      setLoading(true);
      const response = await apiClient.post(
        `/sticker-requests/${requestId}/mark-paid`,
        { payment_reference: paymentReference }
      );
      setRequests(requests.map(r => r.id === requestId ? response.data : r));
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to mark as paid';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requests]);

  const generateStickers = useCallback(async (requestId) => {
    try {
      setLoading(true);
      const response = await apiClient.post(
        `/sticker-requests/${requestId}/print`
      );
      setRequests(requests.map(r => r.id === requestId ? response.data : r));
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate stickers';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requests]);

  const releaseStickers = useCallback(async (requestId) => {
    try {
      setLoading(true);
      const response = await apiClient.post(
        `/sticker-requests/${requestId}/release`
      );
      setRequests(requests.map(r => r.id === requestId ? response.data : r));
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to release stickers';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requests]);

  const cancelRequest = useCallback(async (requestId) => {
    try {
      setLoading(true);
      const response = await apiClient.post(
        `/sticker-requests/${requestId}/cancel`
      );
      setRequests(requests.map(r => r.id === requestId ? response.data : r));
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to cancel request';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [requests]);

  const reprintSticker = useCallback(async (stickerId) => {
    try {
      setLoading(true);
      const response = await apiClient.post(`/stickers/${stickerId}/reprint`);
      setError(null);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reprint sticker';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Removed fetchStickerTypes from useEffect since we don't need sticker types anymore

  const value = {
    stickerTypes,
    requests,
    loading,
    error,
    fetchStickerTypes,
    fetchRequests,
    createRequest,
    uploadAttachment,
    approveRequest,
    rejectRequest,
    markAsPaid,
    generateStickers,
    releaseStickers,
    cancelRequest,
    reprintSticker,
  };

  return (
    <StickerContext.Provider value={value}>
      {children}
    </StickerContext.Provider>
  );
};

export const useStickerContext = () => {
  const context = useContext(StickerContext);
  if (!context) {
    throw new Error('useStickerContext must be used within a StickerProvider');
  }
  return context;
};
