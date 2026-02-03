
import React from 'react';

interface EmbedRendererProps {
  url: string;
  title: string;
  type?: string;
}

const EmbedRenderer: React.FC<EmbedRendererProps> = ({ url, title, type }) => {
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');

  const getYouTubeEmbedUrl = (originalUrl: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = originalUrl.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
  };

  if (isYouTube && type === 'video') {
    const embedUrl = getYouTubeEmbedUrl(url);
    if (embedUrl) {
      return (
        <div className="rounded-xl overflow-hidden shadow-lg border-2 border-slate-200">
          <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold text-white">{title}</span>
            <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 font-medium">
              Open in YouTube
            </a>
          </div>
          <div className="aspect-video w-full bg-black">
            <iframe
              src={embedUrl}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      );
    }
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-400 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2.5 rounded-lg group-hover:bg-blue-700 transition-colors">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <div>
            <h4 className="text-base font-bold text-blue-900 group-hover:text-blue-700">{title}</h4>
            <p className="text-sm text-blue-600 truncate max-w-md">{url}</p>
          </div>
        </div>
        <svg className="w-5 h-5 text-blue-600 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </a>
  );
};

export default EmbedRenderer;
