import React, { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error)
    console.error('Error Info:', errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fee', border: '2px solid red' }}>
          <h2 style={{ color: 'red' }}>컴포넌트 렌더링 에러 발생!</h2>
          <details style={{ whiteSpace: 'pre-wrap', marginTop: '20px' }}>
            <summary>에러 메시지 (클릭하여 자세히 보기)</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <p>
            <button onClick={() => window.location.reload()}>페이지 새로고침</button>
          </p>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary