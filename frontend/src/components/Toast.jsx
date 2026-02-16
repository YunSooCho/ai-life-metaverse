import PropTypes from 'prop-types'

export default function Toast({ show, message, type }) {
  if (!show) return null

  const toastTypes = {
    info: 'toast-info',
    success: 'toast-success',
    warning: 'toast-warning'
  }

  return (
    <div className={`toast ${toastTypes[type] || toastTypes.info}`}>
      {message}
    </div>
  )
}

Toast.propTypes = {
  show: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['info', 'success', 'warning']).isRequired
}