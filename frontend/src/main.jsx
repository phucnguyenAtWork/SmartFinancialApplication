// main.jsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { AppShell } from './components/AppShell'
import { CurrencyProvider } from './components/context/CurrencyContext'

const root = createRoot(document.getElementById('root'))

root.render(
  <React.StrictMode>
    <CurrencyProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </CurrencyProvider>
  </React.StrictMode>
)
