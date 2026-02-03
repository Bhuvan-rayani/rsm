// Pre-loaded Book: Machine Learning in Action
// This file helps you add the existing PDF to your book shelf

export const preloadedBook = {
  id: 'ml-in-action-1',
  title: 'Machine Learning in Action',
  author: 'Peter Harrington',
  year: 2012,
  // Local cover image served from public folder
  coverImage: '/rsm/assets/covers/Machine Learning in Action (Peter Harrington).png',
  
  // Path to your PDF - served from public folder
  pdfPath: '/rsm/assets/pdfs/Machine Learning in Action (Peter Harrington).pdf'
};

// HOW TO ADD THIS BOOK TO YOUR SHELF:
// 
// Method 1: Add automatically on app load
// In StudentDashboard.tsx, modify the useEffect for loading books:
/*
useEffect(() => {
  const savedBooks = localStorage.getItem('rsm-books');
  if (savedBooks) {
    try {
      const books = JSON.parse(savedBooks);
      // Check if the book is already added
      if (!books.find(b => b.id === 'ml-in-action-1')) {
        setBooks([...books, preloadedBook]);
      } else {
        setBooks(books);
      }
    } catch (error) {
      // If no saved books, add the preloaded one
      setBooks([preloadedBook]);
    }
  } else {
    // No saved books, start with the preloaded book
    setBooks([preloadedBook]);
  }
}, []);
*/

// Method 2: Add via button click
// Add this button somewhere in your UI:
/*
<button onClick={() => setBooks([...books, preloadedBook])}>
  Load Machine Learning Book
</button>
*/

// Method 3: Add manually via browser console
// Open browser DevTools console and run:
/*
const book = {
  id: 'ml-in-action-1',
  title: 'Machine Learning in Action',
  author: 'Peter Harrington',
  year: 2012,
  coverImage: 'https://images-na.ssl-images-amazon.com/images/I/51P-ybmrO1L._SX397_BO1,204,203,200_.jpg',
  pdfPath: '/assets/books/Machine Learning in Action (Peter Harrington).pdf'
};

const existing = JSON.parse(localStorage.getItem('rsm-books') || '[]');
existing.push(book);
localStorage.setItem('rsm-books', JSON.stringify(existing));
location.reload();
*/

// HOW TO GET A BETTER COVER IMAGE:
// 
// 1. Search Google Images for "Machine Learning in Action book cover"
// 2. Right-click the image → Copy Image Address
// 3. Paste URL as coverImage value above
// 
// OR
//
// 1. Download the book cover image
// 2. Convert to Base64: https://www.base64-image.de/
// 3. Copy the Base64 string
// 4. Set coverImage: 'data:image/jpeg;base64,YOUR_BASE64_STRING'
