// Toast configuration and helper functions
const Toast = {
  success: function(message) {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "var(--lighter-purple)",
      className: "toast-success",
      close: true,
      stopOnFocus: true,
    }).showToast();
  },

  error: function(message) {
    Toastify({
      text: message,
      duration: 10000,
      gravity: "top",
      position: "right",
      backgroundColor: "var(--dark-red)",
      className: "toast-error",
      close: true,
      stopOnFocus: true,
    }).showToast();
  },

  warning: function(message) {
    Toastify({
      text: message,
      duration: 5000,
      gravity: "top",
      position: "right",
      backgroundColor: "var(--orange-brown)",
      className: "toast-warning",
      close: true,
      stopOnFocus: true,
    }).showToast();
  },

  info: function(message) {
    Toastify({
      text: message,
      duration: 3000,
      gravity: "top",
      position: "right",
      backgroundColor: "var(--lighter-purple)",
      className: "toast-info",
      close: true,
      stopOnFocus: true,
    }).showToast();
  }
};
