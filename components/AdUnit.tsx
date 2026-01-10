"use client"

import Script from "next/script"

interface AdUnitProps {
  format?: string
  slotId?: string
  className?: string
}

export default function AdUnit({ 
  format = "auto", 
  slotId = "YOUR_AD_SLOT_ID",
  className = ""
}: AdUnitProps) {
  return (
    <div className={`my-8 ${className}`}>
      <div className="text-center text-sm text-gray-500 mb-2">
        Advertisement
      </div>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-9089093304511732"
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
      <Script id={`ad-${Date.now()}`} strategy="afterInteractive">
        {`(adsbygoogle = window.adsbygoogle || []).push({});`}
      </Script>
    </div>
  )
}