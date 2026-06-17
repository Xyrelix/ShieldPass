import { useState } from 'react';
import { Button } from '../common/Button';

interface DocumentUploadMockProps {
  onUploaded: () => void;
}

export function DocumentUploadMock({ onUploaded }: DocumentUploadMockProps) {
  const [uploaded, setUploaded] = useState(false);

  function handleFakeUpload() {
    setUploaded(true);
    onUploaded();
  }

  if (uploaded) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
        <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
        Document uploaded (mock — no real data stored)
      </div>
    );
  }

  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
      <p className="mb-3 text-sm text-gray-600">
        Upload a government-issued ID{' '}
        <span className="font-medium text-yellow-700">(this is a demo — any file works)</span>
      </p>
      <Button variant="secondary" size="sm" onClick={handleFakeUpload} type="button">
        Simulate upload
      </Button>
    </div>
  );
}
