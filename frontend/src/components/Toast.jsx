import PropTypes from 'prop-types'

export default function Toast({ message = '', type = 'info', show, onClose = null }) {
  if (!show || !message) return null

  const getToastClass = () => {
    switch (type) {
      case 'success':
        return 'pixel-toast pixel-toast-success'
      case 'warning':
        return 'pixel-toast pixel-toast-warning'
      case 'info':
      default:
        return 'pixel-toast pixel-toast-info'
    }
  }

  return (
    <div className={`toast ${getToastClass()}`}>
      <span className="pixel-font pixel-text-sm">{message}</span>
    </div>
  )
}

Toast.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['success', 'warning', 'info']),
  show: PropTypes.bool.isRequired,
  onClose: PropTypes.func
}