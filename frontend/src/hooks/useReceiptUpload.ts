import { useEffect, useRef, useState } from 'react';
import { Expense } from '../types/expense';
import { useAuth } from '../contexts/AuthContext';
import { mapExpense, sortByDateDesc } from './useExpenses';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type SetExpenses = React.Dispatch<React.SetStateAction<Expense[]>>;

export function useReceiptUpload(
  expenses: Expense[],
  setExpenses: SetExpenses,
  getAuthHeaders: () => Promise<Record<string, string>>
) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
  const [processingReceipt, setProcessingReceipt] = useState(false);
  const [processingTimedOut, setProcessingTimedOut] = useState(false);
  const knownExpenseIdsRef = useRef<Set<string>>(new Set());

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !API_BASE_URL) return;

    setProcessingTimedOut(false);
    event.target.value = '';
    setUploadStatus('uploading');

    try {
      // Step 1: get presigned upload URL
      const headers = await getAuthHeaders();
      const urlRes = await fetch(`${API_BASE_URL}/receipt/upload`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ contentType: file.type || 'image/jpeg' }),
      });

      if (!urlRes.ok) {
        console.error('Failed to get upload URL', await urlRes.text());
        setUploadStatus('error');
        return;
      }

      const { uploadUrl } = await urlRes.json();

      // Step 2: upload file directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type || 'image/jpeg' },
        body: file,
      });

      if (!uploadRes.ok) {
        console.error('Failed to upload receipt to S3', uploadRes.status);
        setUploadStatus('error');
        return;
      }

      setUploadStatus('idle');
      setProcessingReceipt(true);
      setProcessingTimedOut(false);
      knownExpenseIdsRef.current = new Set(expenses.map((e) => e.id));
    } catch (error) {
      console.error('Receipt upload failed', error);
      setUploadStatus('error');
    }
  };

  useEffect(() => {
    if (!processingReceipt || !API_BASE_URL || !user) return;

    const POLL_INTERVAL = 4000;
    const TIMEOUT = 60000;
    const startTime = Date.now();

    const intervalId = setInterval(async () => {
      if (Date.now() - startTime > TIMEOUT) {
        setProcessingTimedOut(true);
        setProcessingReceipt(false);
        clearInterval(intervalId);
        return;
      }

      try {
        const headers = await getAuthHeaders();
        const res = await fetch(`${API_BASE_URL}/expenses`, { headers });
        if (!res.ok) return;

        const items = await res.json();
        const mapped = (items || []).map(mapExpense);
        const newExpense = mapped.find((e: Expense) => !knownExpenseIdsRef.current.has(e.id));
        if (newExpense) {
          setExpenses(sortByDateDesc(mapped));
          setProcessingReceipt(false);
          clearInterval(intervalId);
        }
      } catch (error) {
        console.error('Polling failed', error);
      }
    }, POLL_INTERVAL);

    return () => clearInterval(intervalId);
  }, [processingReceipt, user]);

  return {
    fileInputRef,
    uploadStatus,
    processingReceipt,
    processingTimedOut,
    handleFileSelect,
  };
}
