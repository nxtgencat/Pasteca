import "./styles.css"

import { useEffect, useState } from "react"

import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

function IndexPopup() {
  const [isDisabled, setIsDisabled] = useStorage("disabled", false)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    sendToContentScript({
      name: "run"
    })
  }, [])

  const toggleSwitch = () => {
    setIsDisabled(!isDisabled)
  }

  return (
    <div className="min-w-[300px] bg-gray-900 p-6 shadow-lg">
      {/* Status Card */}
      <div className="bg-gray-800 rounded-xl p-4 shadow-md border border-gray-700 mb-5">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center
            ${!isDisabled ? "bg-emerald-900/30 text-emerald-500" : "bg-gray-700 text-gray-400"}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round">
              {!isDisabled ? (
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              ) : (
                <circle cx="12" cy="12" r="10"></circle>
              )}
              {!isDisabled && (
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              )}
              {isDisabled && <line x1="8" y1="12" x2="16" y2="12"></line>}
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-medium text-white">
              {!isDisabled ? "Active" : "Inactive"}
            </h2>
            <p className="text-sm text-gray-400">
              {!isDisabled
                ? "Extension is currently running"
                : "Extension is currently disabled"}
            </p>
          </div>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="flex justify-center">
        <button
          className={`relative overflow-hidden group px-6 py-3 rounded-lg font-medium transition-all duration-300 
            ${!isDisabled ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"} 
            text-white shadow-md hover:shadow-lg active:scale-95 w-full`}
          onClick={toggleSwitch}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}>
          <div className="relative z-10 flex items-center justify-center gap-2">
            {!isDisabled ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                </svg>
                Disable
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                Enable
              </>
            )}
          </div>
          <div
            className={`absolute inset-0 w-full h-full transition-transform duration-500 ease-out 
            ${isHovering ? "scale-x-100" : "scale-x-0"} origin-left
            ${!isDisabled ? "bg-rose-700" : "bg-emerald-700"}`}
          />
        </button>
      </div>
    </div>
  )
}

export default IndexPopup
