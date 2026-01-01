import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Upload, BookOpen, Trash2, Clock } from 'lucide-react';
import { db, getAllBooks, addBook, deleteBook, addTokens } from '../lib/db';

export default function Library() {
  const navigate = useNavigate();
  const books = useLiveQuery(() => getAllBooks(), []);
  
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentFile, setCurrentFile] = useState('');
  const [dragActive, setDragActive] = useState(false);
  
  // Handle file selection
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };
  
  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };
  
  // Process uploaded file
  const processFile = async (file) => {
    const fileType = file.name.toLowerCase().endsWith('.pdf') ? 'pdf' : 
                     file.name.toLowerCase().endsWith('.epub') ? 'epub' : null;
    
    if (!fileType) {
      alert('Please upload a PDF or EPUB file');
      return;
    }
    
    setUploading(true);
    setProgress(0);
    setCurrentFile(file.name);
    
    try {
      // Save book metadata to DB
      const bookId = await addBook({
        title: file.name.replace(/\.(pdf|epub)$/i, ''),
        fileName: file.name,
        fileType,
        uploadedAt: Date.now(),
      });
      
      // Choose appropriate worker
      const workerPath = fileType === 'pdf' 
        ? new URL('../lib/workers/pdf-parser.worker.js', import.meta.url)
        : new URL('../lib/workers/epub-parser.worker.js', import.meta.url);
      
      const worker = new Worker(workerPath, { type: 'module' });
      
      // Send file to worker
      worker.postMessage({ file, bookId });
      
      // Handle worker messages
      worker.onmessage = async (e) => {
        const { type, tokens, page, total, error } = e.data;
        
        if (type === 'progress') {
          setProgress(Math.round((page / total) * 100));
        } 
        else if (type === 'complete') {
          // Save tokens to IndexedDB in chunks (better performance)
          const CHUNK_SIZE = 1000;
          for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
            const chunk = tokens.slice(i, i + CHUNK_SIZE);
            await addTokens(chunk);
          }
          
          setUploading(false);
          setProgress(0);
          setCurrentFile('');
          worker.terminate();
          
          // Navigate to reader
          navigate(`/reader/${bookId}`);
        } 
        else if (type === 'error') {
          console.error('Parse error:', error);
          alert(`Error parsing file: ${error}`);
          setUploading(false);
          setProgress(0);
          setCurrentFile('');
          worker.terminate();
        }
      };
      
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error processing file');
      setUploading(false);
    }
  };
  
  // Delete book and all associated data
  const handleDelete = async (bookId, title) => {
    if (confirm(`Delete "${title}"? This cannot be undone.`)) {
      await deleteBook(bookId);
    }
  };
  
  // Format timestamp
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📚 RSVP Reader
          </h1>
          <p className="text-gray-600">
            Upload PDF or EPUB files to start speed reading
          </p>
        </div>
        
        {/* Upload Area */}
        <div className="mb-12">
          <div
            className={`
              relative border-2 border-dashed rounded-lg p-12 text-center
              transition-all duration-200 ease-in-out
              ${dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 bg-white hover:border-gray-400'
              }
              ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && document.getElementById('fileInput').click()}
          >
            {uploading ? (
              <div>
                <div className="animate-pulse mb-4">
                  <Upload className="w-16 h-16 mx-auto text-blue-500" />
                </div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  Processing {currentFile}...
                </p>
                <div className="max-w-md mx-auto">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">{progress}% complete</p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {dragActive ? 'Drop file here' : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-500">
                  PDF or EPUB files
                </p>
              </div>
            )}
            
            <input
              id="fileInput"
              type="file"
              className="hidden"
              accept=".pdf,.epub,application/pdf,application/epub+zip"
              onChange={handleFileSelect}
              disabled={uploading}
            />
          </div>
        </div>
        
        {/* Books Grid */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Your Library
          </h2>
          
          {!books || books.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <BookOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No books yet. Upload one to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <div
                  key={book.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow duration-200 group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
                        {book.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        {formatDate(book.uploadedAt)}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(book.id, book.title);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-red-50 rounded-lg"
                      title="Delete book"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <span className="inline-block px-2 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded">
                      {book.fileType.toUpperCase()}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => navigate(`/reader/${book.id}`)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                  >
                    Start Reading
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
