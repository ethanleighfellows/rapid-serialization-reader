import { Routes, Route, Navigate } from 'react-router-dom'
import Library from './pages/Library'
import Reader from './pages/Reader'

function App() {
  return (
    <div className="w-full h-full bg-gray-50">
      <Routes>
        <Route path="/" element={<Navigate to="/library" replace />} />
        <Route path="/library" element={<Library />} />
        <Route path="/reader/:bookId" element={<Reader />} />
      </Routes>
    </div>
  )
}

export default App
