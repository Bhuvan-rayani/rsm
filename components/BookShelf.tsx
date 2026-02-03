import React, { useState } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  coverImage: string;
  pdfPath: string;
  pdfFile?: File;
}

interface BookShelfProps {
  books: Book[];
  onAddBook?: (book: Book) => void;
  onRemoveBook?: (bookId: string) => void;
  THEME: {
    background: string;
    sidebar: string;
    card: string;
    cardHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    accentPrimary: string;
    accentSecondary: string;
    success: string;
    warning: string;
    error: string;
  };
}

const BookShelf: React.FC<BookShelfProps> = ({ books, THEME }) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);

  console.log('BookShelf received books:', books);

  return (
    <div className="w-full">
      <style>{`
        .book-rack {
          position: relative;
          padding: 40px 20px;
          background: linear-gradient(180deg, rgba(38, 36, 94, 0.2) 0%, rgba(20, 18, 63, 0.4) 100%);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .book-rack::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 100%;
          background: 
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 30px,
              rgba(139, 90, 43, 0.03) 30px,
              rgba(139, 90, 43, 0.03) 60px
            ),
            repeating-linear-gradient(
              0deg,
              rgba(139, 90, 43, 0.02) 0px,
              rgba(139, 90, 43, 0.02) 2px,
              transparent 2px,
              transparent 60px
            );
          pointer-events: none;
          border-radius: 16px;
        }

        .book-rack-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
          position: relative;
          z-index: 1;
          padding: 20px;
        }

        .book-spine {
          position: relative;
          aspect-ratio: 3/4;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 
            0 4px 12px rgba(0, 0, 0, 0.4),
            inset 1px 1px 0 rgba(255, 255, 255, 0.15),
            inset -1px -1px 0 rgba(0, 0, 0, 0.3);
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.1), transparent);
          transform-style: preserve-3d;
          border: none;
          padding: 0;
        }

        .book-spine:hover {
          transform: translateY(-12px) rotateZ(-3deg) translateX(2px);
          box-shadow: 
            0 20px 40px rgba(61, 220, 190, 0.25),
            0 0 30px rgba(61, 220, 190, 0.15),
            inset 1px 1px 0 rgba(255, 255, 255, 0.2),
            inset -1px -1px 0 rgba(0, 0, 0, 0.4);
          filter: brightness(1.1);
        }

        .book-spine img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.35s ease;
          filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.3));
        }

        .book-spine:hover img {
          transform: scale(1.08);
          filter: drop-shadow(4px 4px 12px rgba(0, 0, 0, 0.5));
        }

        .book-label {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 30%, rgba(0, 0, 0, 0.7) 70%, rgba(0, 0, 0, 0.9) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .book-spine:hover .book-label {
          opacity: 1;
        }

        .book-label-title {
          font-weight: 800;
          font-size: 11px;
          line-height: 1.2;
          margin-bottom: 2px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          color: #fff;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
        }

        .book-label-author {
          font-size: 9px;
          opacity: 0.85;
          color: #ddd;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
        }

        .pdf-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 60;
          backdrop-filter: blur(4px);
          padding: 20px;
        }

        .pdf-modal-container {
          width: 100%;
          height: 90vh;
          max-width: 1000px;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.8);
          display: flex;
          flex-direction: column;
          position: relative;
          border: 1px solid rgba(61, 220, 190, 0.3);
          background: rgba(26, 22, 83, 0.95);
        }

        .pdf-header {
          background: linear-gradient(90deg, rgba(26, 22, 83, 0.95), rgba(79, 124, 255, 0.1));
          padding: 16px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .pdf-title {
          color: #fff;
          font-weight: 700;
          font-size: 18px;
        }

        .pdf-close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          padding: 0;
        }

        .pdf-close-btn:hover {
          background: rgba(239, 68, 68, 0.8);
          transform: scale(1.1);
        }

        .pdf-viewer {
          flex: 1;
          overflow: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(0, 0, 0, 0.3);
        }

        .pdf-viewer iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        .pdf-fallback {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          text-align: center;
          gap: 20px;
        }

        .open-pdf-btn {
          background: linear-gradient(135deg, #3DDCBE 0%, #34C6AE 100%);
          color: #1A1653;
          padding: 16px 32px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 16px;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(61, 220, 190, 0.4);
        }

        .open-pdf-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 30px rgba(61, 220, 190, 0.6);
        }

        .open-pdf-btn:active {
          transform: translateY(0);
        }
      `}</style>

      {/* Book Rack */}
      <div className="book-rack">
        <div className="book-rack-grid">
          {books.map(book => (
            <button
              key={book.id}
              onClick={() => {
                setSelectedBook(book);
                setShowPdfModal(true);
              }}
              className="book-spine"
              title={`${book.title} by ${book.author}`}
            >
              <img src={book.coverImage} alt={book.title} />
              <div className="book-label">
                <div className="book-label-title">{book.title}</div>
                <div className="book-label-author">{book.author}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfModal && selectedBook && (
        <div className="pdf-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowPdfModal(false);
            setSelectedBook(null);
          }
        }}>
          <div className="pdf-modal-container">
            <div className="pdf-header">
              <div className="pdf-title">📖 {selectedBook.title}</div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <a
                  href={selectedBook.pdfFile ? URL.createObjectURL(selectedBook.pdfFile) : selectedBook.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-pdf-btn"
                  style={{
                    padding: '8px 20px',
                    fontSize: '14px',
                    background: 'rgba(61, 220, 190, 0.2)',
                    color: '#3DDCBE',
                    border: '1px solid #3DDCBE',
                    textDecoration: 'none'
                  }}
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => {
                    setShowPdfModal(false);
                    setSelectedBook(null);
                  }}
                  className="pdf-close-btn"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="pdf-viewer">
              <div className="pdf-fallback">
                <div style={{ fontSize: '72px', marginBottom: '10px' }}>📄</div>
                <h3 style={{ color: '#fff', fontSize: '24px', fontWeight: '700', marginBottom: '10px' }}>
                  {selectedBook.title}
                </h3>
                <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '16px', marginBottom: '30px' }}>
                  Click the button below to open and read this book
                </p>
                <a
                  href={selectedBook.pdfFile ? URL.createObjectURL(selectedBook.pdfFile) : selectedBook.pdfPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="open-pdf-btn"
                  style={{ textDecoration: 'none' }}
                >
                  📖 Open PDF in New Tab
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookShelf;
