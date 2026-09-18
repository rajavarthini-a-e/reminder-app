import React from 'react';
import { Illustration, IllustrationName } from '../ui/Illustration.js';

export { Illustration, type IllustrationName };

export const HomeIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <Illustration name="desk" className={className} />
);

export const UploadIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <Illustration name="books" className={className} />
);

export const CalendarIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <Illustration name="empty-calendar" className={className} />
);

export const MentorIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <Illustration name="mascot-encouraging" className={className} />
);

export const ProfileIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <Illustration name="mascot-idle" className={className} />
);

export const EmptyStateIllustration: React.FC<{ className?: string }> = ({ className }) => (
  <Illustration name="empty-roadmaps" className={className} />
);

export default Illustration;
