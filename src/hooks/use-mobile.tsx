
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

// Enhanced iOS detection hook with comprehensive iPhone detection
export function useIsIOS() {
  const [isIOS, setIsIOS] = React.useState<boolean>(false)

  React.useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || 
                       (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) || // iPad Pro detection
                       /webkit.*mobile/.test(userAgent)
    setIsIOS(isIOSDevice)
  }, [])

  return isIOS
}

// iPhone-specific optimizations hook
export function useIsIPhone() {
  const [isIPhone, setIsIPhone] = React.useState<boolean>(false)

  React.useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isIPhoneDevice = /iphone/.test(userAgent) || 
                          (window.screen.width <= 428 && window.screen.height <= 932) // iPhone size detection
    setIsIPhone(isIPhoneDevice)
    
    // Apply iPhone-specific optimizations
    if (isIPhoneDevice) {
      // Prevent zoom on input focus
      const viewport = document.querySelector('meta[name=viewport]')
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no')
      }
      
      // Add iPhone-specific body class
      document.body.classList.add('iphone-optimized')
      
      // Improve scroll performance - TypeScript-safe way to set webkit property
      const bodyStyle = document.body.style as any
      bodyStyle.webkitOverflowScrolling = 'touch'
    }
  }, [])

  return isIPhone
}
