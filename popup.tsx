"use client"

import "./styles.css"
import { useEffect } from "react"
import { sendToContentScript } from "@plasmohq/messaging"
import { useStorage } from "@plasmohq/storage/hook"

function IndexPopup() {
    const [isDisabled, setIsDisabled] = useStorage("disabled", false)

    useEffect(() => {
        sendToContentScript({
            name: "run",
        })
    }, [])

    const toggleSwitch = () => {
        setIsDisabled(!isDisabled)
    }

    return (
        <div className="w-[280px] bg-white p-4">
            {/* Compact Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-lg font-semibold text-gray-900">Pasteca</h1>
                    <p className="text-xs text-gray-500">Browser extension</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${!isDisabled ? "bg-green-500" : "bg-gray-300"}`}></div>
                    <span className={`text-sm font-medium ${!isDisabled ? "text-green-600" : "text-gray-400"}`}>
            {!isDisabled ? "Active" : "Inactive"}
          </span>
                </div>
            </div>

            {/* Compact Status with Icon */}
            <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${!isDisabled ? "bg-gray-900" : "bg-gray-300"}`}
                >
                    {!isDisabled ? (
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white"
                        >
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    ) : (
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-white"
                        >
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    )}
                </div>
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                        {!isDisabled ? "All features enabled" : "Extension disabled"}
                    </p>
                    <p className="text-xs text-gray-500">{!isDisabled ? "Ready to paste" : "Click to enable"}</p>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleSwitch}
                className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 mb-4
          ${
                    !isDisabled
                        ? "bg-gray-900 text-white hover:bg-gray-800"
                        : "bg-white text-gray-900 border border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                }`}
            >
                {!isDisabled ? "Disable Extension" : "Enable Extension"}
            </button>

            {/* Compact Hotkeys */}
            <div className="border-t border-gray-200 pt-3">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">Stealthy Paste</span>
                    <div className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">Z</kbd>
                        <span className="text-gray-400 text-xs">+</span>
                        <kbd className="px-1.5 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-mono">V</kbd>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default IndexPopup
