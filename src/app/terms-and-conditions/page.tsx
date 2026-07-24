import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms & Conditions | Chatman Security & Fire",
  description:
    "Terms and Conditions for Chatman Security & Fire, Inc. — services, SMS messaging terms, appointments, payment, warranties, and opt-out instructions.",
  alternates: { canonical: "/terms-and-conditions" },
};

const h2 = "text-xl font-bold text-gray-900 mt-8 mb-3";
const p = "text-gray-600 leading-relaxed mb-4";
const ul = "list-disc pl-6 space-y-1.5 text-gray-600 mb-4";

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions" lastUpdated="July 24, 2026">
      <p className={p}>
        Please read these Terms and Conditions (&ldquo;Terms&rdquo;) carefully before using the services of
        Chatman Security &amp; Fire, Inc. (&ldquo;Company,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;). By contacting us, submitting a form, or engaging our services, you agree to be
        bound by these Terms.
      </p>

      <h2 className={h2}>1. Services</h2>
      <p className={p}>
        Chatman Security &amp; Fire, Inc. provides professional security and fire protection services
        including, but not limited to:
      </p>
      <ul className={ul}>
        <li>Fire alarm system installation, service, and monitoring</li>
        <li>Fire sprinkler system installation and inspection</li>
        <li>Security system installation and monitoring</li>
        <li>CCTV / video surveillance installation</li>
        <li>Access control systems</li>
        <li>Smoke and carbon monoxide detector installation</li>
        <li>System inspection and testing</li>
        <li>Emergency system upgrades</li>
        <li>Fiber optics and IT/infrastructure services</li>
      </ul>
      <p className={p}>
        All services are subject to a separate written service agreement, proposal, or contract executed
        between the Company and the client prior to work commencing.
      </p>

      <h2 className={h2}>2. Quotes &amp; Estimates</h2>
      <p className={p}>
        All quotes and estimates provided by Chatman Security &amp; Fire, Inc. are based on information
        available at the time of assessment. Final pricing may vary based on actual site conditions, scope
        changes, material costs, or permit requirements discovered during installation. A written agreement
        will confirm final pricing before work begins.
      </p>

      <h2 className={h2}>3. SMS Communications</h2>
      <p className={p}>
        By providing your mobile phone number and consenting to SMS communications, you agree to receive
        text messages from Chatman Security &amp; Fire, Inc. including:
      </p>
      <ul className={ul}>
        <li>Appointment confirmations and reminders</li>
        <li>Service alerts and updates</li>
        <li>Follow-up communications related to your inquiry or project</li>
      </ul>
      <p className={p}>Message and data rates may apply. Message frequency varies based on your service activity.</p>
      <p className={p}>
        To opt out at any time, reply <strong>STOP</strong> to any SMS message. To resume messages, reply{" "}
        <strong>START</strong>. For assistance, reply <strong>HELP</strong> or call{" "}
        <a href="tel:+18326391433" className="text-orange-600 font-medium hover:underline">(832) 639-1433</a>.
      </p>

      <h2 className={h2}>4. Appointments &amp; Cancellations</h2>
      <ul className={ul}>
        <li>Site assessments and consultations are offered free of charge.</li>
        <li>Clients are asked to provide at least 24 hours notice to reschedule or cancel a confirmed appointment.</li>
        <li>Repeated no-shows or late cancellations may result in a scheduling fee.</li>
        <li>Chatman Security &amp; Fire, Inc. reserves the right to reschedule appointments due to crew availability, weather, or other unforeseen circumstances.</li>
      </ul>

      <h2 className={h2}>5. Payment Terms</h2>
      <ul className={ul}>
        <li>A deposit is required before work commences on any installation project. Deposit amount and terms will be specified in the written service agreement.</li>
        <li>Final payment is due upon substantial completion of work unless otherwise agreed in writing.</li>
        <li>Accepted payment methods will be specified in your service agreement.</li>
        <li>Unpaid balances are subject to applicable late fees as outlined in the service agreement.</li>
      </ul>

      <h2 className={h2}>6. Warranties</h2>
      <ul className={ul}>
        <li>Chatman Security &amp; Fire, Inc. warrants its installation workmanship against defects for a period specified in the executed service agreement.</li>
        <li>Equipment and hardware warranties are provided by the respective manufacturers and subject to their terms.</li>
        <li>Warranty coverage does not apply to damage caused by misuse, unauthorized modifications, natural disasters, or third-party interference.</li>
      </ul>

      <h2 className={h2}>7. Limitation of Liability</h2>
      <p className={p}>To the fullest extent permitted by applicable law, Chatman Security &amp; Fire, Inc. shall not be liable for:</p>
      <ul className={ul}>
        <li>Indirect, incidental, or consequential damages arising from the use or inability to use our services</li>
        <li>Losses resulting from system failure, equipment malfunction, power outages, or third-party service interruptions</li>
        <li>Damages exceeding the total amount paid for the specific service giving rise to the claim</li>
      </ul>
      <p className={p}>
        Our services are intended to reduce risk — they do not guarantee the prevention of fire, theft, or
        security incidents.
      </p>

      <h2 className={h2}>8. Permits &amp; Compliance</h2>
      <p className={p}>
        Chatman Security &amp; Fire, Inc. operates in compliance with applicable local, state, and federal
        regulations. Where required, we will coordinate permit applications on behalf of the client. The
        client is responsible for providing accurate property information and access necessary for permit
        filing and inspection.
      </p>

      <h2 className={h2}>9. Intellectual Property</h2>
      <p className={p}>
        All content on our website, including text, images, logos, and documentation, is the property of
        Chatman Security &amp; Fire, Inc. and may not be reproduced, distributed, or used without prior
        written permission.
      </p>

      <h2 className={h2}>10. Governing Law</h2>
      <p className={p}>
        These Terms shall be governed by and construed in accordance with the laws of the State of Texas,
        without regard to its conflict of law provisions. Any disputes shall be resolved in the courts of
        Harris County, Texas.
      </p>

      <h2 className={h2}>11. Changes to These Terms</h2>
      <p className={p}>
        We reserve the right to update these Terms at any time. Updated Terms will be posted on this page
        with a revised &ldquo;Last Updated&rdquo; date. Continued use of our services constitutes acceptance
        of the revised Terms.
      </p>

      <h2 className={h2}>12. Contact Us</h2>
      <p className={p}>For questions about these Terms, please contact:</p>
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
