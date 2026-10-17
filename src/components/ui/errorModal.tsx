import { IoMdClose } from "react-icons/io";
import { FaTriangleExclamation } from "react-icons/fa6";
import { type ErrorModalProps } from "@/types/index";

export function ErrorModal({
  mainText,
  onClose,
  okButtonText = "OK",
}: ErrorModalProps) {
  return (
    <div
      id="popup-modal"
      tabIndex={-1}
      onClick={onClose}
      className="overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full bg-gray-800/10"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="relative p-4 w-full max-w-md  max-h-full top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
      >
        <div className="relative bg-white rounded-lg shadow-sm">
          <button
            type="button"
            className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
            data-modal-hide="popup-modal"
            onClick={onClose}
          >
            <IoMdClose className="text-md w-5 h-5" />
            <span className="sr-only">Close modal</span>
          </button>
          <div className="p-4 md:p-5 text-center">
            <FaTriangleExclamation className="mx-auto mb-4 text-red-500 w-12 h-12" />
            <h3 className="mb-5 text-lg font-normal text-center text-gray-500">
              {mainText}
            </h3>
            <button
              data-modal-hide="popup-modal"
              type="button"
              onClick={onClose}
              className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm inline-flex items-center px-10 py-2.5 text-center"
            >
              {okButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
