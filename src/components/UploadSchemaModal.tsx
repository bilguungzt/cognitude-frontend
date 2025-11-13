import React, { useState } from 'react';
import Modal from './Modal';
import { Button } from './Button';
import { api } from '../services/api';

interface UploadSchemaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchemaUploaded: () => void;
}

export const UploadSchemaModal: React.FC<UploadSchemaModalProps> = ({ isOpen, onClose, onSchemaUploaded }) => {
  const [schemaName, setSchemaName] = useState('');
  const [schemaContent, setSchemaContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async () => {
    if (!schemaName || !schemaContent) {
      setError('Both schema name and content are required.');
      return;
    }

    try {
      JSON.parse(schemaContent);
    } catch {
      setError('Invalid JSON format.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      await api.uploadSchema(schemaName, { schema_data: JSON.parse(schemaContent) });
      onSchemaUploaded();
      onClose();
    } catch (err) {
      setError(api.handleError(err));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload New Schema">
      <div className="space-y-4">
        <div>
          <label htmlFor="schemaName" className="block text-sm font-medium text-gray-700">
            Schema Name
          </label>
          <input
            type="text"
            id="schemaName"
            value={schemaName}
            onChange={(e) => setSchemaName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <label htmlFor="schemaContent" className="block text-sm font-medium text-gray-700">
            Schema Content (JSON)
          </label>
          <textarea
            id="schemaContent"
            rows={10}
            value={schemaContent}
            onChange={(e) => setSchemaContent(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono"
            placeholder='{ "type": "object", "properties": { ... } }'
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end space-x-2">
          <Button onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isUploading}>
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};