// Research Books Data - Uploaded Books Collection
// These are the research methodology and writing books uploaded to the portal

export const researchBooks = [
  {
    id: 'turabian-1',
    title: 'A Manual for Writers of Research Papers, Theses, and Dissertations',
    author: 'Kate L. Turabian',
    year: 2018,
    coverImage: '/rsm/assets/covers/A Manual for Writers of Research Papers, Theses, and Dissertations (Kate L. Turabian).png',
    pdfPath: '/rsm/assets/pdfs/A Manual for Writers of Research Papers, Theses, and Dissertations (Kate L. Turabian).pdf'
  },
  {
    id: 'chin-1',
    title: 'How to Write a Great Research Paper',
    author: 'Beverly Chin (Book Builders)',
    year: 2016,
    coverImage: '/rsm/assets/covers/How to Write a Great Research Paper (Book Builders, Beverly Chin).png',
    pdfPath: '/rsm/assets/pdfs/How to Write a Great Research Paper (Book Builders, Beverly Chin).pdf'
  },
  {
    id: 'creswell-qualitative-1',
    title: 'Qualitative Inquiry and Research Design: Choosing Among Five Approaches',
    author: 'John W. Creswell, Cheryl N. Poth',
    year: 2017,
    coverImage: '/rsm/assets/covers/Qualitative Inquiry and Research Design Choosing Among Five Approaches (John W. Creswell  Cheryl N. Poth).png',
    pdfPath: '/rsm/assets/pdfs/Qualitative Inquiry and Research Design Choosing Among Five Approaches (John W. Creswell  Cheryl N. Poth).pdf'
  },
  {
    id: 'creswell-research-design-1',
    title: 'Research Design: Qualitative, Quantitative, and Mixed Methods Approaches (6th Edition)',
    author: 'John W. Creswell, David J. Creswell',
    year: 2017,
    coverImage: '/rsm/assets/covers/Research Design Qualitative, Quantitative, and Mixed Methods Approaches, 6e (ePub Convert) (John W. Creswell, David J. Creswell).png',
    pdfPath: '/rsm/assets/pdfs/Research Design Qualitative, Quantitative, and Mixed Methods Approaches, 6e (ePub Convert) (John W. Creswell, David J. Creswell).pdf'
  },
  {
    id: 'booth-1',
    title: 'The Craft of Research (5th Edition)',
    author: 'Wayne C. Booth, Gregory G. Colomb',
    year: 2016,
    coverImage: '/rsm/assets/covers/The Craft of Research, 5th Edition (Wayne C. Booth, Gregory G. Colomb etc.).png',
    pdfPath: '/rsm/assets/pdfs/The Craft of Research, 5th Edition (Wayne C. Booth, Gregory G. Colomb etc.).pdf'
  },
  {
    id: 'mullaney-1',
    title: 'Where Research Begins: Choosing a Research Project That Matters to You (and the World)',
    author: 'Thomas S. Mullaney, Christopher Rea',
    year: 2019,
    coverImage: '/rsm/assets/covers/Where Research Begins Choosing a Research Project That Matters to You (and the World) (Thomas S. Mullaney Christopher Rea).png',
    pdfPath: '/rsm/assets/pdfs/Where Research Begins Choosing a Research Project That Matters to You (and the World) (Thomas S. Mullaney Christopher Rea).pdf'
  }
];

// HOW TO USE:
// Import in StudentDashboard.tsx:
//   import { researchBooks } from './researchBooksData';
//
// Initialize books state with research books:
//   const [books, setBooks] = useState(researchBooks);
//
// Or merge with existing books:
//   setBooks([...existingBooks, ...researchBooks]);
