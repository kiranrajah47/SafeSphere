import React from 'react';
import Modal from '../ui/Modal';
import AlertBanner from '../ui/AlertBanner';
import { Play, Info, HeartPulse } from 'lucide-react';

export default function VideoPlayerModal({ guide, isOpen, onClose }) {
  if (!guide || !isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={guide.title}
      subtitle={`Video Guide • ${guide.category} • Duration: ${guide.videoDuration || guide.readTime}`}
      maxWidth="max-w-3xl"
    >
      <div className="space-y-4">
        
        {/* Embed Video Player Container */}
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-800">
          {guide.videoUrl ? (
            <iframe
              src={guide.videoUrl}
              title={guide.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-white space-y-2 p-6 text-center">
              <Play className="w-12 h-12 text-red-500" />
              <p className="text-sm font-bold">Video Stream Preview</p>
              <p className="text-xs text-slate-400 max-w-sm">
                Demonstration video content for {guide.category}. (Connect live video feed in production)
              </p>
            </div>
          )}
        </div>

        {/* Medical Disclaimer Banner for Health Guides */}
        {guide.categoryGroup === 'HEALTH' && (
          <AlertBanner type="warning" title="Important Medical Disclaimer">
            The medical information provided in this video is for educational and emergency response awareness purposes only. It does not replace professional medical advice, diagnosis, or emergency healthcare services. Always contact emergency services (112) immediately in a life-threatening emergency.
          </AlertBanner>
        )}

        {/* Description & Key Takeaways */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Summary</h4>
          <p className="text-xs font-medium text-slate-900 leading-relaxed">
            {guide.description}
          </p>
        </div>

      </div>
    </Modal>
  );
}
