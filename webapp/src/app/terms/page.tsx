import React from "react";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
      <p className="mb-4 text-sm text-slate-400">Last Updated: June 16, 2026</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-white mb-2">1. Acceptance of Terms</h2>
          <p>
            By accessing and using QRLink, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">2. Description of Service</h2>
          <p>
            QRLink provides a URL shortening and QR code generation service. We allow users to create short links that redirect to original URLs of their choosing.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">3. Acceptable Use Policy</h2>
          <p className="mb-2">
            You agree not to use the Service to create links to content that:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Promotes extreme violence or terrorism.</li>
            <li>Involves illegal acts, including but not limited to the distribution of illegal materials or child sexual abuse material (CSAM).</li>
            <li>Contains severe hate speech or harassment.</li>
            <li>Is designed to scam, phish, or distribute malware.</li>
          </ul>
          <p className="mt-2 text-sm text-slate-400">
            Note: Links redirecting to legal adult content involving consenting adults are permitted, provided they do not violate any of the other terms listed above.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">4. Automated Moderation</h2>
          <p>
            QRLink employs automated AI moderation tools to scan the contents of URLs you submit. We reserve the right to disable or delete any link that our systems flag as violating our Acceptable Use Policy without prior notice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">5. Disclaimer of Warranties</h2>
          <p>
            The service is provided on an "as is" and "as available" basis. QRLink makes no warranties, expressed or implied, and hereby disclaims all warranties, including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">6. Limitation of Liability</h2>
          <p>
            In no event shall QRLink or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on QRLink's website.
          </p>
        </section>
      </div>
    </div>
  );
}
