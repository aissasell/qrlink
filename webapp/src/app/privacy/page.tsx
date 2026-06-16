import React from "react";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12 text-slate-300">
      <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
      <p className="mb-4 text-sm text-slate-400">Last Updated: June 16, 2026</p>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold text-white mb-2">1. Information We Collect</h2>
          <p className="mb-2">We collect the following types of information:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account Information:</strong> When you create an account, we collect your email address and securely store authentication credentials via Google Firebase.</li>
            <li><strong>Usage Data:</strong> We collect the original URLs you submit to generate short links and QR codes.</li>
            <li><strong>Cookies and Local Storage:</strong> We use cookies and local storage to manage your authentication session and remember your cookie consent preferences.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">2. How We Use Your Information</h2>
          <p className="mb-2">We use the information we collect to:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Provide, operate, and maintain the QRLink service.</li>
            <li>Process and evaluate the safety of the URLs you submit using automated moderation tools.</li>
            <li>Authenticate users and protect against fraudulent or illegal activity.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">3. Data Sharing and Third Parties</h2>
          <p>
            We do not sell your personal data. We share data only with essential third-party service providers (such as Google Cloud and Firebase) to host our infrastructure and provide automated content moderation (Vertex AI). These providers are bound by strict confidentiality and data protection agreements.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">4. Data Security and Deletion</h2>
          <p>
            We implement industry-standard security measures to protect your data. You have the right to request the deletion of your account and associated data at any time through the Profile settings page. When an account is deleted, all associated links and authentication data are permanently removed from our active systems.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white mb-2">5. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
        </section>
      </div>
    </div>
  );
}
