// @ts-nocheck
import React, { Component } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles.css'

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return <main style={{ color: '#f4f4f5', padding: 32, fontFamily: 'system-ui' }}>
        <h1>La aplicación no pudo iniciarse.</h1>
        <p>{this.state.error.message}</p>
        <p>Abre la consola del navegador (F12) si necesitas más detalle.</p>
      </main>
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppErrorBoundary><App /></AppErrorBoundary>,
)
