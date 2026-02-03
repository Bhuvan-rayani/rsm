// Sample Books Data for Testing
// You can use this to pre-populate your book library

export const sampleBooks = [
  {
    id: '1',
    title: '1632',
    author: 'Eric Flint',
    year: 2000,
    coverImage: 'https://img.youtube.com/vi/placeholder1/maxresdefault.jpg', // Replace with actual cover image
    pdfPath: '/assets/pdfs/1632.pdf' // Place PDF in public/assets/pdfs/
  },
  {
    id: '2',
    title: 'A Stalled Ox',
    author: 'Saki',
    year: 1914,
    coverImage: 'https://img.youtube.com/vi/placeholder2/maxresdefault.jpg',
    pdfPath: '/assets/pdfs/stalled-ox.pdf'
  },
  {
    id: '3',
    title: 'A Tale of Two Cities',
    author: 'Charles Dickens',
    year: 1859,
    coverImage: 'https://img.youtube.com/vi/placeholder3/maxresdefault.jpg',
    pdfPath: '/assets/pdfs/tale-two-cities.pdf'
  },
  {
    id: '4',
    title: 'Scarlet Pimpernel',
    author: 'Baroness Orczy',
    year: 1905,
    coverImage: 'https://img.youtube.com/vi/placeholder4/maxresdefault.jpg',
    pdfPath: '/assets/pdfs/scarlet-pimpernel.pdf'
  },
  {
    id: '5',
    title: 'Awake!',
    author: 'Henry Kuttner',
    year: 1947,
    coverImage: 'https://img.youtube.com/vi/placeholder5/maxresdefault.jpg',
    pdfPath: '/assets/pdfs/awake.pdf'
  },
  {
    id: '6',
    title: 'Best Served Cold',
    author: 'Joe Abercrombie',
    year: 2009,
    coverImage: 'https://img.youtube.com/vi/placeholder6/maxresdefault.jpg',
    pdfPath: '/assets/pdfs/best-served-cold.pdf'
  },
  {
    id: '7',
    title: 'Monsters of Pressne',
    author: 'Rick Riordan',
    year: 2015,
    coverImage: 'https://img.youtube.com/vi/placeholder7/maxresdefault.jpg',
    pdfPath: '/assets/pdfs/monsters-pressne.pdf'
  },
  {
    id: '8',
    title: 'Broken Wings',
    author: 'Kahlil Gibran',
    year: 1912,
    coverImage: 'https://img.youtube.com/vi/placeholder8/maxresdefault.jpg',
    pdfPath: '/assets/pdfs/broken-wings.pdf'
  },
  {
    id: '9',
    title: 'Conversion',
    author: 'Katherine Howe',
    year: 2014,
    coverImage: 'https://img.youtube.com/vi/placeholder9/maxresdefault.jpg',
    pdfPath: '/assets/pdfs/conversion.pdf'
  }
];

// HOW TO USE:
// 1. Place your PDF files in public/assets/pdfs/
// 2. Replace the placeholder cover images with actual book cover URLs or Base64
// 3. Import this file in StudentDashboard:
//    import { sampleBooks } from './sampleBooksData';
// 4. Initialize state with sample data:
//    const [books, setBooks] = useState(sampleBooks);
// 5. Or add a "Load Sample Data" button to populate the library

// EXAMPLE: To convert image file to Base64 for coverImage
// 1. Open your image in browser
// 2. Use online converter: https://www.base64-image.de/
// 3. Copy the Base64 string and paste as coverImage value

// EXAMPLE: Complete book entry with Base64 cover
/*
{
  id: '1',
  title: '1632',
  author: 'Eric Flint', 
  year: 2000,
  coverImage: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...',
  pdfPath: '/assets/pdfs/1632.pdf'
}
*/
