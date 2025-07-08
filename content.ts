import type { PlasmoCSConfig } from "plasmo"
import { listen } from "@plasmohq/messaging/message"
import { Storage } from "@plasmohq/storage"

type CSSPropertyValue = string | null
type EventType = keyof WindowEventMap
type StylePropertyOptions = {
  important?: boolean
  override?: boolean
}

const storage = new Storage()

interface ElementStyleManager {
  addStyle(property: string, value: CSSPropertyValue, options?: StylePropertyOptions): void
  removeStyle(property: string): void
}

class DOMElementStyleManager implements ElementStyleManager {
  constructor(private element: HTMLElement) {}

  addStyle(property: string, value: CSSPropertyValue, options: StylePropertyOptions = {}): void {
    const { important = false, override = true } = options
    if (override) {
      this.removeStyle(property)
    }
    if (this.element.style.setProperty) {
      this.element.style.setProperty(property, value ?? "", important ? "important" : "")
    } else {
      // Fallback for older browsers
      this.element.setAttribute(
        "style",
        `${this.element.style.cssText}${property}:${value}${important ? " !important" : ""};`,
      )
    }
  }

  removeStyle(property: string): void {
    if (this.element.style.setProperty) {
      this.element.style.removeProperty(property)
    } else {
      // @ts-ignore
      this.element.style.removeAttribute(property)
    }
  }
}

function isInsideCodeEditor(element: HTMLElement): boolean {
  // Add more selectors as needed for other editors
  const codeEditorSelectors = [
    ".monaco-editor", // Monaco (used by LeetCode, VSCode, etc.)
    ".CodeMirror", // CodeMirror
    ".ace_editor", // Ace Editor
  ]
  return codeEditorSelectors.some((selector) => element.closest(selector))
}

class InteractionEnabler {
  private eventsToEnable: EventType[] = [
    "paste",
    "copy",
    "cut",
    "drop",
    "scroll",
    "wheel",
    // @ts-ignore
    "mousewheel",
    "selectstart",
    "touchstart",
    "touchend",
    "dragstart",
    "dragend",
    "mousedown",
    "contextmenu",
  ]

  private keysPressed = new Set<string>()

  private enableEvent(type: EventType): void {
    window.addEventListener(
      type,
      (event: Event) => {
        // If the event target is inside a code editor, do not stop propagation
        if (event.target instanceof HTMLElement && isInsideCodeEditor(event.target)) {
          return
        }
        event.stopPropagation()
      },
      { capture: true },
    )
  }

  private enableAutocomplete(): void {
    document.querySelectorAll<HTMLElement>("[autocomplete]").forEach((elem) => {
      elem.setAttribute("autocomplete", "on")
    })
  }

  private enableDragging(): void {
    document.querySelectorAll<HTMLElement>("[draggable]").forEach((elem) => {
      elem.setAttribute("draggable", "auto")
    })
  }

  private enableTextSelection(): void {
    const elements = document.body.getElementsByTagName("*")
    Array.from(elements).forEach((elem) => {
      if (
        elem instanceof HTMLElement &&
        !isInsideCodeEditor(elem) // <-- Skip code editors
      ) {
        const styleManager = new DOMElementStyleManager(elem)
        styleManager.addStyle("user-select", "text", { important: true })
        // Also enable text selection for modern browsers
        styleManager.addStyle("-webkit-user-select", "text", {
          important: true,
        })
        styleManager.addStyle("-moz-user-select", "text", { important: true })
        styleManager.addStyle("-ms-user-select", "text", { important: true })
      }
    })
  }

  private enableClipboardAPI(): void {
    // Enable clipboard API for modern browsers
    document.addEventListener("copy", (e: ClipboardEvent) => {
      const selection = window.getSelection()
      if (selection && !selection.isCollapsed) {
        e.clipboardData?.setData("text/plain", selection.toString())
      }
    })
  }

  private enableInputFeatures(): void {
    // Enable common input features that might be disabled
    document.querySelectorAll<HTMLInputElement>("input, textarea").forEach((input) => {
      input.setAttribute("spellcheck", "true")
      input.removeAttribute("readonly")
      input.removeAttribute("disabled")
    })
  }

  private async stealthyPaste(): Promise<void> {
    try {
      // Get clipboard content
      const clipboardText = await navigator.clipboard.readText()

      // Find the active element
      const activeElement = document.activeElement as HTMLElement

      if (!activeElement) {
        console.log("No active element found for paste")
        return
      }

      // Handle different types of elements
      if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
        // For input and textarea elements
        const start = activeElement.selectionStart || 0
        const end = activeElement.selectionEnd || 0
        const currentValue = activeElement.value

        // Insert text at cursor position
        const newValue = currentValue.slice(0, start) + clipboardText + currentValue.slice(end)
        activeElement.value = newValue

        // Set cursor position after pasted text
        const newCursorPos = start + clipboardText.length
        activeElement.setSelectionRange(newCursorPos, newCursorPos)

        // Trigger input event to notify any listeners
        activeElement.dispatchEvent(new Event("input", { bubbles: true }))
      } else if (activeElement.isContentEditable) {
        // For contentEditable elements
        const selection = window.getSelection()
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0)
          range.deleteContents()

          // Create text node and insert
          const textNode = document.createTextNode(clipboardText)
          range.insertNode(textNode)

          // Move cursor to end of inserted text
          range.setStartAfter(textNode)
          range.setEndAfter(textNode)
          selection.removeAllRanges()
          selection.addRange(range)

          // Trigger input event
          activeElement.dispatchEvent(new Event("input", { bubbles: true }))
        }
      } else {
        // For other elements, try to simulate paste event
        const pasteEvent = new ClipboardEvent("paste", {
          bubbles: true,
          cancelable: true,
          clipboardData: new DataTransfer(),
        })

        // Add text data to clipboard event
        pasteEvent.clipboardData?.setData("text/plain", clipboardText)

        // Dispatch the event
        activeElement.dispatchEvent(pasteEvent)
      }

      console.log("Stealthy paste completed")
    } catch (error) {
      console.error("Failed to perform stealthy paste:", error)

      // Fallback: try to simulate Ctrl+V
      const pasteEvent = new KeyboardEvent("keydown", {
        key: "v",
        code: "KeyV",
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      })

      document.activeElement?.dispatchEvent(pasteEvent)
    }
  }

  private enableStealthyPasteHotkey(): void {
    // Track key presses
    document.addEventListener(
      "keydown",
      (event: KeyboardEvent) => {
        this.keysPressed.add(event.key.toLowerCase())

        // Check for z+v combination
        if (this.keysPressed.has("z") && this.keysPressed.has("v")) {
          event.preventDefault()
          event.stopPropagation()
          this.stealthyPaste()
          this.keysPressed.clear()
        }
      },
      { capture: true },
    )

    document.addEventListener(
      "keyup",
      (event: KeyboardEvent) => {
        this.keysPressed.delete(event.key.toLowerCase())
      },
      { capture: true },
    )

    // Clear keys on window blur to prevent stuck keys
    window.addEventListener("blur", () => {
      this.keysPressed.clear()
    })
  }

  async enable(): Promise<void> {
    const disabled = await storage.get<boolean>("disabled")
    if (disabled) {
      return
    }

    // Enable all events
    this.eventsToEnable.forEach((eventType) => this.enableEvent(eventType))

    // Enable all features
    this.enableAutocomplete()
    this.enableDragging()
    this.enableTextSelection()
    this.enableClipboardAPI()
    this.enableInputFeatures()
    this.enableStealthyPasteHotkey()
  }
}

// Usage
const enabler = new InteractionEnabler()
enabler.enable()

// Export for use in modules
export { InteractionEnabler }

export const config: PlasmoCSConfig = {
  run_at: "document_start",
}

listen(async () => {
  console.log("Running enabler")
  enabler.enable()
})
