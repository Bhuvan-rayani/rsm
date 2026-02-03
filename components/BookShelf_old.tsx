import React, { useState, useRef } from 'react';

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
  onAddBook: (book: Book) => void;
  onRemoveBook: (bookId: string) => void;
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

const BookShelf: React.FC<BookShelfProps> = ({ books, onAddBook, onRemoveBook, THEME }) => {
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showPdfModal, setShowPdfModal] = useState(false);



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
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
          position: relative;
          z-index: 1;
          padding: 10px;
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

        .remove-btn {
          position: absolute;
          top: 4px;
          right: 4px;
          z-index: 20;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(239, 68, 68, 0.9);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 14px;
          opacity: 0;
          transition: all 0.2s ease;
          backdrop-filter: blur(4px);
          padding: 0;
        }

        .book-spine:hover .remove-btn {
          opacity: 1;
        }

        .remove-btn:hover {
          background: rgba(239, 68, 68, 1);
          transform: scale(1.15);
        }

        .add-book-btn {
          aspect-ratio: 3/4;
          border-radius: 4px;
          border: 2px dashed rgba(61, 220, 190, 0.4);
          background: linear-gradient(135deg, rgba(61, 220, 190, 0.08), rgba(79, 124, 255, 0.08));
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(4px);
        }

        .add-book-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 50%, rgba(61, 220, 190, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .add-book-btn:hover {
          border-color: rgba(61, 220, 190, 0.7);
          background: linear-gradient(135deg, rgba(61, 220, 190, 0.15), rgba(79, 124, 255, 0.12));
          transform: translateY(-6px);
          box-shadow: 0 12px 24px rgba(61, 220, 190, 0.15);
        }

        .add-book-btn:hover::before {
          opacity: 1;
        }

        .add-book-icon {
          font-size: 32px;
          transition: transform 0.3s ease;
        }

        .add-book-btn:hover .add-book-icon {
          transform: scale(1.2) rotate(90deg);
        }

        .add-book-text {
          font-size: 11px;
          font-weight: 700;
          text-align: center;
          color: rgba(61, 220, 190, 0.8);
          transition: color 0.3s ease;
        }

        .add-book-btn:hover .add-book-text {
          color: rgba(61, 220, 190, 1);
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Remove "${book.title}"?`)) {
                    onRemoveBook(book.id);
                  }
                }}
                className="remove-btn"
                title="Remove book"
              >
                ✕
              </button>
            </button>
          ))}

          {/* Add Book Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="add-book-btn"
            title="Add new book"
          >
            <div className="add-book-icon">+</div>
            <div className="add-book-text">Add Book</div>
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ backgroundColor: THEME.card }}>
            <button
              onClick={() => {
                setShowUploadModal(false);
                setUploadForm({
                  title: '',
                  author: '',
                  year: new Date().getFullYear(),
                  coverImage: null,
                  pdfFile: null,
                  previewUrl: ''
                });
                if (fileInputRef.current) fileInputRef.current.value = '';
                if (pdfInputRef.current) pdfInputRef.current.value = '';
              }}
              className="modal-close"
              style={{ color: THEME.textMuted }}
            >
              ✕
            </button>

            <h2 style={{ color: THEME.textPrimary, marginBottom: '24px', fontSize: '20px', fontWeight: 'bold' }}>
              📚 Add Book to Library
            </h2>

            <form onSubmit={handleSubmitBook}>
              <div className="form-group">
                <label className="form-label" style={{ color: THEME.textSecondary }}>
                  Book Title
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  className="form-input"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: THEME.textPrimary
                  }}
                  placeholder="Enter book title"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: THEME.textSecondary }}>
                  Author
                </label>
                <input
                  type="text"
                  value={uploadForm.author}
                  onChange={(e) => setUploadForm({ ...uploadForm, author: e.target.value })}
                  className="form-input"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: THEME.textPrimary
                  }}
                  placeholder="Enter author name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: THEME.textSecondary }}>
                  Publication Year
                </label>
                <input
                  type="number"
                  value={uploadForm.year}
                  onChange={(e) => setUploadForm({ ...uploadForm, year: parseInt(e.target.value) })}
                  className="form-input"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    color: THEME.textPrimary
                  }}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: THEME.textSecondary }}>
                  Book Cover Image
                </label>
                <div
                  className={`file-input-wrapper ${uploadForm.previewUrl ? 'selected' : ''}`}
                  style={{
                    borderColor: uploadForm.previewUrl ? THEME.accentPrimary : 'rgba(61, 220, 190, 0.3)',
                    backgroundColor: uploadForm.previewUrl ? 'rgba(61, 220, 190, 0.08)' : 'transparent'
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {uploadForm.previewUrl ? (
                    <div>
                      <img
                        src={uploadForm.previewUrl}
                        alt="Preview"
                        style={{ width: '60px', height: '85px', objectFit: 'cover', borderRadius: '6px', margin: '0 auto 8px' }}
                      />
                      <p style={{ color: THEME.accentPrimary, fontSize: '13px', fontWeight: '600' }}>
                        ✓ Image selected
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="file-icon" style={{ color: THEME.accentPrimary }}>📷</div>
                      <p style={{ color: THEME.textSecondary, fontSize: '13px', fontWeight: '600' }}>
                        Click to upload cover image
                      </p>
                      <p style={{ color: THEME.textMuted, fontSize: '12px', marginTop: '4px' }}>
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ color: THEME.textSecondary }}>
                  PDF File
                </label>
                <div
                  className={`file-input-wrapper ${uploadForm.pdfFile ? 'selected' : ''}`}
                  style={{
                    borderColor: uploadForm.pdfFile ? THEME.accentPrimary : 'rgba(61, 220, 190, 0.3)',
                    backgroundColor: uploadForm.pdfFile ? 'rgba(61, 220, 190, 0.08)' : 'transparent'
                  }}
                  onClick={() => pdfInputRef.current?.click()}
                >
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfChange}
                    className="hidden"
                  />
                  {uploadForm.pdfFile ? (
                    <div>
                      <div className="file-icon" style={{ color: THEME.accentPrimary }}>📄</div>
                      <p className="file-name" style={{ color: THEME.accentPrimary }}>
                        {uploadForm.pdfFile.name}
                      </p>
                      <p style={{ color: THEME.textMuted, fontSize: '12px' }}>
                        {(uploadForm.pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="file-icon" style={{ color: THEME.accentPrimary }}>📑</div>
                      <p style={{ color: THEME.textSecondary, fontSize: '13px', fontWeight: '600' }}>
                        Click to upload PDF
                      </p>
                      <p style={{ color: THEME.textMuted, fontSize: '12px', marginTop: '4px' }}>
                        PDF files only
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadForm({
                      title: '',
                      author: '',
                      year: new Date().getFullYear(),
                      coverImage: null,
                      pdfFile: null,
                      previewUrl: ''
                    });
                    if (fileInputRef.current) fileInputRef.current.value = '';
                    if (pdfInputRef.current) pdfInputRef.current.value = '';
                  }}
                  className="form-btn btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="form-btn btn-submit"
                  style={{
                    backgroundColor: THEME.accentPrimary,
                    color: THEME.background
                  }}
                >
                  {uploading ? 'Uploading...' : 'Add to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPdfModal && selectedBook && (
        <div className="pdf-modal-overlay">
          <div className="pdf-modal-container">
            <div className="pdf-header">
              <div className="pdf-title">📖 {selectedBook.title}</div>
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
            <div className="pdf-viewer">
              {selectedBook.pdfFile ? (
                <iframe src={URL.createObjectURL(selectedBook.pdfFile)} title={selectedBook.title} />
              ) : (
                <iframe src={selectedBook.pdfPath} title={selectedBook.title} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookShelf;
