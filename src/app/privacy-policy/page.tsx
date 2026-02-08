export const metadata = {
  title: "Privacy Policy - KashCraft",
};

export default function PrivacyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container-custom max-w-3xl py-12">
        <h1 className="mb-8 text-4xl font-bold">Privacy Policy</h1>
        <p className="mb-8 text-gray-600">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">1. Introduction</h2>
            <p>
              KashCraft ("we" or "us" or "our") operates the kashcraft.com website (the "Site").
              This page informs you of our policies regarding the collection, use, and disclosure of
              personal data when you use our Service and the choices you have associated with that
              data.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">
              2. Information Collection and Use
            </h2>
            <p>We collect several different types of information for various purposes:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>
                <strong>Personal Data:</strong> Name, email address, phone number, address
              </li>
              <li>
                <strong>Payment Information:</strong> Credit card details (processed securely)
              </li>
              <li>
                <strong>Usage Data:</strong> Browser type, pages visited, referral source
              </li>
              <li>
                <strong>Cookies:</strong> For authentication and user preferences
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">3. Use of Data</h2>
            <p>KashCraft uses the collected data for various purposes:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>To provide and maintain our Service</li>
              <li>To notify you about changes to our Service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information for improving our Service</li>
              <li>To monitor the usage of our Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">4. Security of Data</h2>
            <p>
              The security of your data is important to us, but remember that no method of
              transmission over the Internet or method of electronic storage is 100% secure. While
              we strive to use commercially acceptable means to protect your Personal Data, we
              cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">
              5. Changes to This Privacy Policy
            </h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">6. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@kashcraft.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
