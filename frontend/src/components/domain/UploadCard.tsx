import React, { useState, useRef } from 'react';
import { Card } from '../ui/Card.js';
import { Button } from '../ui/Button.js';
import { Heading, Text } from '../ui/Typography.js';
import { UploadIllustration } from '../illustrations/index.js';
import { Upload, FileText, CheckCircle2, AlertCircle, RefreshCw, FileCode } from 'lucide-react';
import clsx from 'clsx';

export type UploadState =
  | 'idle'
  | 'drag_active'
  | 'uploading'
  | 'parsing'
  | 'error'
  | 'unsupported';

export interface UploadCardProps {
  onFileSelect: (file: File) => void;
  onTextSubmit: (text: string) => void;
  state?: UploadState;
  errorMessage?: string | null;
  onResetError?: () => void;
  className?: string;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  onFileSelect,
  onTextSubmit,
  state = 'idle',
  errorMessage,
  onResetError,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file');
  const [dragOver, setDragOver] = useState(false);
  const [planText, setPlanText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (selectedFile: File) => {
    const validExtensions = ['.pdf', '.docx', '.md', '.markdown', '.txt'];
    const fileName = selectedFile.name.toLowerCase();
    const isValid = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValid) {
      if (onFileSelect) onFileSelect(selectedFile); // Let caller handle unsupported state
      return;
    }
    onFileSelect(selectedFile);
  };

  const isWorking = state === 'uploading' || state === 'parsing';
  const isError = state === 'error' || state === 'unsupported' || Boolean(errorMessage);

  return (
    <Card variant="default" className={clsx('p-6 sm:p-8 space-y-6', className)}>
      {/* Mode Switcher */}
      <div className="flex items-center justify-center">
        <div className="p-1 bg-surface-secondary dark:bg-surface-darkCard rounded-2xl border border-border flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('file')}
            disabled={isWorking}
            className={clsx(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'file'
                ? 'bg-surface dark:bg-surface-dark text-primary shadow-subtle'
                : 'text-secondary-text hover:text-primary-text'
            )}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            disabled={isWorking}
            className={clsx(
              'px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'text'
                ? 'bg-surface dark:bg-surface-dark text-primary shadow-subtle'
                : 'text-secondary-text hover:text-primary-text'
            )}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Plan Text</span>
          </button>
        </div>
      </div>

      {/* Error Alert Banner */}
      {isError && (
        <div className="p-4 bg-danger-soft border border-danger/30 rounded-2xl flex items-start gap-3 text-left">
          <AlertCircle className="w-5 h-5 text-danger flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-danger">Failed to process roadmap</p>
            <p className="text-xs text-primary-text mt-0.5">
              {errorMessage || 'Unsupported file format. Please upload PDF, DOCX, Markdown, or plain text.'}
            </p>
          </div>
          {onResetError && (
            <button
              onClick={onResetError}
              className="text-xs font-bold text-danger hover:underline flex-shrink-0"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {/* File Upload Zone */}
      {activeTab === 'file' ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={clsx(
            'border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all flex flex-col items-center justify-center',
            dragOver || state === 'drag_active'
              ? 'border-success bg-success-soft/30'
              : 'border-border dark:border-surface-darkBorder bg-surface-secondary/40 hover:bg-surface-secondary/70',
            isWorking && 'opacity-60 pointer-events-none'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.md,.markdown,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-24 h-24 sm:w-28 sm:h-28 mb-4 flex items-center justify-center">
            <UploadIllustration className="w-full h-full" />
          </div>

          {isWorking ? (
            <div className="space-y-3">
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>
                  {state === 'parsing'
                    ? 'AI Mentor extracting milestones & tasks...'
                    : 'Uploading document...'}
                </span>
              </div>
              <Text variant="caption" tone="secondary">
                Analyzing structure, extracting timelines, and building your schedule
              </Text>
            </div>
          ) : (
            <div className="space-y-3">
              <Heading variant="heading" tone="primary">
                Drag and drop your roadmap here
              </Heading>
              <Text variant="caption" tone="secondary" className="max-w-sm mx-auto">
                Supports PDF syllabi, DOCX study schedules, Markdown plans, or plain text
              </Text>

              <div className="pt-2">
                <Button
                  variant="success"
                  size="md"
                  onClick={() => fileInputRef.current?.click()}
                  icon={<Upload className="w-4 h-4" />}
                >
                  Browse Local Files
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Text Input Zone */
        <div className="space-y-4">
          <textarea
            value={planText}
            onChange={(e) => setPlanText(e.target.value)}
            disabled={isWorking}
            placeholder="Paste your study plan, certification curriculum, or ChatGPT-generated roadmap here..."
            rows={8}
            className="w-full p-4 rounded-2xl bg-surface-secondary dark:bg-surface-darkCard border border-border dark:border-surface-darkBorder text-primary-text dark:text-gray-100 placeholder:text-disabled text-sm outline-none focus:ring-2 focus:ring-success focus:border-transparent font-mono resize-y"
          />

          <div className="flex justify-end">
            <Button
              variant="success"
              size="md"
              disabled={!planText.trim() || isWorking}
              isLoading={isWorking}
              onClick={() => onTextSubmit(planText)}
              icon={<FileCode className="w-4 h-4" />}
            >
              Parse & Generate Roadmap
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UploadCard;
