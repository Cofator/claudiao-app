// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LevelProvider } from '@/hooks/useLevel'
import LoginPage from '@/pages/LoginPage'
import PairingPage from '@/pages/PairingPage'
import ChatPage from '@/pages/ChatPage'
import NotFoundPage from '@/pages/NotFoundPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LevelProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/parear" element={<PairingPage />} />
            <Route path="/c" element={<ChatPage />} />
            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </BrowserRouter>
      </LevelProvider>
    </QueryClientProvider>
  )
}

export default App