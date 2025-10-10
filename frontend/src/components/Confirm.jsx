import { useState } from "react";

export default function Confirm({ message, onConfirm, children }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div onClick={() => setOpen(true)}>{children}</div>

      {open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-md max-w-sm w-full text-center">
            <p className="text-gray-700 mb-4">{message}</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
                className="bg-red-500 text-white px-4 py-1.5 rounded hover:bg-red-600"
              >
                Yes
              </button>
              <button
                onClick={() => setOpen(false)}
                className="bg-gray-300 px-4 py-1.5 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
