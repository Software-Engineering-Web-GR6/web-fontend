import { useState } from 'react'
import Button from './components/ui/Button'
import './App.css'

function App() {
  const [active, setActive] = useState(false)
  return (
    <div>
      <h1>Demo Button Component</h1>
      <div className="card">
        <Button
          active={active}
          onToggle={() => setActive(!active)}>
          <div></div>
        </Button>
      </div>
    </div>
  )
}

export default App
