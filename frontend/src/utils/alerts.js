import Swal from "sweetalert2";

const sharedConfig = {
  customClass: {
    popup: "app-swal-popup",
    confirmButton: "app-swal-confirm",
    cancelButton: "app-swal-cancel"
  },
  buttonsStyling: false,
  reverseButtons: true
};

export function confirmAction({
  title,
  text,
  confirmButtonText = "Confirm",
  cancelButtonText = "Cancel",
  icon = "warning"
}) {
  return Swal.fire({
    ...sharedConfig,
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText,
    cancelButtonText,
    focusCancel: true
  });
}

export function showResultAlert({
  title,
  text,
  icon = "success",
  confirmButtonText = "Okay"
}) {
  return Swal.fire({
    ...sharedConfig,
    title,
    text,
    icon,
    confirmButtonText
  });
}
