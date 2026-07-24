import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Chatman Security & Fire",
  description:
    "Privacy Policy for Chatman Security & Fire, Inc. — how we collect, use, and protect your information, including SMS messaging consent and opt-out.",
  alternates: { canonical: "/privacy-policy" },
};

const h2 = "text-xl font-bold text-gray-900 mt-8 mb-3";
const p = "text-gray-600 leading-relaxed mb-4";
const ul = "list-disc pl-6 space-y-1.5 text-gray-600 mb-4";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="July 24, 2026">
      <p className={p}>
        Chatman Security &amp; Fire, Inc. (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;) is committed to protecting your privacy. This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you visit our website, contact us,
        or use our services.
      </p>

      <h2 className={h2}>1. Information We Collect</h2>
      <p className={p}>We may collect the following types of personal information:</p>
      <ul className={ul}>
        <li><strong>Contact Information:</strong> Name, phone number, email address, and mailing address</li>
        <li><strong>Property Information:</strong> Property address, property type, and details related to your security or fire protection needs</li>
        <li><strong>Communication Data:</strong> Messages, form submissions, appointment requests, and service inquiries</li>
        <li><strong>Usage Data:</strong> Browser type, IP address, pages visited, and time spent on our website (via cookies and analytics tools)</li>
      </ul>

      <h2 className={h2}>2. How We Use Your Information</h2>
      <p className={p}>We use the information we collect to:</p>
      <ul className={ul}>
        <li>Respond to inquiries and provide quotes for our services</li>
        <li>Schedule and confirm site assessments, installations, and service appointments</li>
        <li>Send appointment reminders, service updates, and follow-up communications</li>
        <li>Send SMS messages related to your account, appointments, or service requests (with your consent)</li>
        <li>Process payments and manage your service account</li>
        <li>Comply with legal and regulatory requirements</li>
        <li>Improve our website and services</li>
      </ul>

      <h2 className={h2}>3. SMS Messaging</h2>
      <p className={p}>
        By providing your mobile phone number and opting in, you consent to receive SMS text messages
        from Chatman Security &amp; Fire, Inc. regarding:
      </p>
      <ul className={ul}>
        <li>Appointment confirmations and reminders</li>
        <li>Service updates and alerts</li>
        <li>Follow-up communications related to your inquiry or project</li>
      </ul>
      <p className={p}>Message frequency may vary. Standard message and data rates may apply.</p>
      <p className={p}>
        To opt out of SMS communications at any time, reply <strong>STOP</strong> to any message. To opt
        back in, reply <strong>START</strong>. For help, reply <strong>HELP</strong> or contact us at{" "}
        <a href="tel:+18326391433" className="text-orange-600 font-medium hover:underline">(832) 639-1433</a>.
      </p>
      <p className={p}>
        We do not sell your phone number or personal information to third parties for marketing purposes.
        No mobile information will be shared with third parties or affiliates for marketing or promotional
        purposes. SMS opt-in consent is never shared with any third party.
      </p>

      <h2 className={h2}>4. How We Share Your Information</h2>
      <p className={p}>
        We do not sell, trade, or rent your personal information to third parties. We may share your
        information with:
      </p>
      <ul className={ul}>
        <li>Service providers who assist us in operating our business (e.g., scheduling platforms, SMS providers) under strict confidentiality agreements</li>
        <li>Legal authorities when required by law, court order, or to protect the rights and safety of our company or others</li>
      </ul>

      <h2 className={h2}>5. Data Retention</h2>
      <p className={p}>
        We retain your personal information for as long as necessary to provide our services, comply with
        legal obligations, and resolve disputes. You may request deletion of your data at any time by
        contacting us.
      </p>

      <h2 className={h2}>6. Cookies &amp; Tracking</h2>
      <p className={p}>
        Our website may use cookies and similar tracking technologies to enhance your browsing experience.
        You may disable cookies through your browser settings; however, some features of our website may not
        function properly as a result.
      </p>

      <h2 className={h2}>7. Your Rights</h2>
      <p className={p}>You have the right to:</p>
      <ul className={ul}>
        <li>Access the personal information we hold about you</li>
        <li>Request correction of inaccurate data</li>
        <li>Request deletion of your personal data</li>
        <li>Opt out of SMS communications at any time by replying STOP</li>
        <li>Contact us with any privacy-related concerns</li>
      </ul>

      <h2 className={h2}>8. Children&apos;s Privacy</h2>
      <p className={p}>
        Our services are not directed to individuals under the age of 18. We do not knowingly collect
        personal information from children.
      </p>

      <h2 className={h2}>9. Changes to This Policy</h2>
      <p className={p}>
        We may update this Privacy Policy from time to time. Changes will be posted on this page with an
        updated &ldquo;Last Updated&rdquo; date. Continued use of our services after changes constitutes
        your acceptance of the updated policy.
      </p>

      <h2 className={h2}>10. Contact Us</h2>
      <p className={p}>If you have questions about this Privacy Policy or your personal data, please contact us:</p>
      <div className="bg-gray-50 rounded-xl p-5 text-gray-700 leading-relaxed">
        <strong>Chatman Security &amp; Fire, Inc.</strong><br />
        3403 West TC Jester Blvd #1112<br />
        Houston, TX 77018<br />
        Phone: <a href="tel:+18328597009" className="text-orange-600 font-medium hover:underline">(832) 859-7009</a><br />
        Email: <a href="mailto:info@chatmansecurityandfire.com" className="text-orange-600 font-medium hover:underline">info@chatmansecurityandfire.com</a><br />
        Web: <a href="https://chatmansecurityandfire.com" className="text-orange-600 font-medium hover:underline">chatmansecurityandfire.com</a>
      </div>
    </LegalPage>
  );
}
