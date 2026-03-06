"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast as SonnerToast } from "sonner"
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon
} from "lucide-react"

/*
  Active Core Toast — Dark Athletic Edition
  ─────────────────────────────────────────────
  Inverted palette: deep charcoal shell with a sharp
  left-border accent strip — like the bold product
  labels and "OUT OF STOCK" overlays in the storefront.

    • Background  : #111111  (near-black, matches nav text)
    • Left accent : 3px solid <per-type color>
    • Text         : #F9F9F9
    • Subtext      : #9CA3AF
    • Purple accent: #9333EA  (brand purple)
    • Radius       : 6px
    • Font         : Barlow Condensed display / DM Sans body
  ─────────────────────────────────────────────
*/

const TYPE_ACCENTS = {
  success: "#22C55E",
  error:   "#EF4444",
  warning: "#F59E0B",
  info:    "#9333EA",
  loading: "#9333EA",
  default: "#9333EA",
}

const baseStyle = (accentColor = "#9333EA") => ({
  background: "#111111",
  border: "none",
  borderLeft: `3px solid ${accentColor}`,
  borderRadius: "6px",
  boxShadow: "0 8px 32px 0 rgba(0,0,0,0.45), 0 2px 8px 0 rgba(0,0,0,0.3)",
  fontFamily: "'Barlow', 'DM Sans', system-ui, sans-serif",
  fontSize: "13px",
  fontWeight: "500",
  letterSpacing: "0.02em",
  color: "#F9F9F9",
  padding: "13px 16px",
  gap: "10px",
  minWidth: "300px",
  maxWidth: "380px",
})

const sharedClassNames = {
  description: "text-[#9CA3AF] text-[12px] font-normal mt-0.5 tracking-wide",
  actionButton:
    "!bg-transparent !text-[#9333EA] !border-0 !font-semibold !text-[12px] !tracking-widest !uppercase hover:!opacity-75 transition-opacity",
  cancelButton:
    "!bg-transparent !text-[#6B7280] !border-0 !text-[12px] hover:!text-[#F9F9F9] transition-colors",
  closeButton:
    "!left-auto !right-3 !top-5/8 !-translate-y-1/2 absolute flex items-center justify-center !bg-[#1F1F1F] !border-0 text-[#6B7280] hover:text-[#F9F9F9] hover:!bg-[#2A2A2A] !rounded-full !w-5 !h-5 transition-all",
  toast: "relative flex items-center pr-10",
}

const Toaster = (props) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme="dark"
      className="toaster group"
      closeButton
      visibleToasts={5}
      icons={{
        success: <CircleCheckIcon className="size-4" style={{ color: TYPE_ACCENTS.success }} />,
        info:    <InfoIcon className="size-4" style={{ color: TYPE_ACCENTS.info }} />,
        warning: <TriangleAlertIcon className="size-4" style={{ color: TYPE_ACCENTS.warning }} />,
        error:   <OctagonXIcon className="size-4" style={{ color: TYPE_ACCENTS.error }} />,
        loading: <Loader2Icon className="size-4 animate-spin" style={{ color: TYPE_ACCENTS.loading }} />,
      }}
      toastOptions={{
        duration: 1500,
        style: baseStyle(),
        classNames: sharedClassNames,
      }}
      {...props}
    />
  )
}

// ─── Dedupe guard ────────────────────────────────────────────────────────────
let lastToast = { msg: "", time: 0 }

const shouldShowToast = (msg) => {
  const now = Date.now()
  if (lastToast.msg === msg && now - lastToast.time < 500) return false
  lastToast = { msg, time: now }
  return true
}

// ─── Wrapped toast helpers ───────────────────────────────────────────────────
const customToast = (msg, props = {}) => {
  if (!shouldShowToast(msg)) return
  return SonnerToast(msg, { style: baseStyle(TYPE_ACCENTS.default), ...props })
}

customToast.success = (msg, props = {}) => {
  if (!shouldShowToast(msg)) return
  return SonnerToast.success(msg, { style: baseStyle(TYPE_ACCENTS.success), ...props })
}

customToast.error = (msg, props = {}) => {
  if (!shouldShowToast(msg)) return
  return SonnerToast.error(msg, { style: baseStyle(TYPE_ACCENTS.error), ...props })
}

customToast.info = (msg, props = {}) => {
  if (!shouldShowToast(msg)) return
  return SonnerToast.info(msg, { style: baseStyle(TYPE_ACCENTS.info), ...props })
}

customToast.warning = (msg, props = {}) => {
  if (!shouldShowToast(msg)) return
  return SonnerToast.warning(msg, { style: baseStyle(TYPE_ACCENTS.warning), ...props })
}

customToast.loading = (msg, props = {}) => {
  if (!shouldShowToast(msg)) return
  return SonnerToast.loading(msg, { style: baseStyle(TYPE_ACCENTS.loading), ...props })
}

customToast.dismiss = SonnerToast.dismiss

export { Toaster, customToast as toast }