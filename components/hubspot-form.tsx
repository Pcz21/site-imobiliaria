"use client"

import Script from "next/script"

// Formulário do HubSpot (CRM). O script de embed detecta as divs
// .hs-form-frame na página e injeta o formulário dentro delas.
// Os domínios do HubSpot precisam estar liberados no CSP (next.config.mjs).
export function HubspotForm() {
  return (
    <>
      <Script
        src="https://js.hsforms.net/forms/embed/51705738.js"
        strategy="afterInteractive"
      />
      <div
        className="hs-form-frame"
        data-region="na1"
        data-form-id="9b92d739-b856-45a4-acca-98cb33cb86e5"
        data-portal-id="51705738"
      />
    </>
  )
}
