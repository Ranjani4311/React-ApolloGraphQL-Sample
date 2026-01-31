import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ExpenseGrid from './components/ExpenseGrid.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExpenseGrid />
  </StrictMode>,
)
