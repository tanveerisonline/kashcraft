export const metadata = {
  title: "Terms of Service - KashCraft",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container-custom max-w-3xl py-12">
        <h1 className="mb-8 text-4xl font-bold">Terms of Service</h1>
        <p className="mb-8 text-gray-600">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">1. Agreement to Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to abide by the above, please do not
              use this service.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information
              or software) from KashCraft for personal, non-commercial transitory viewing only. This
              is the grant of a license, not a transfer of title, and under this license you may
              not:
            </p>
            <ul className="list-inside list-disc space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the site</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>
                Transfer the materials to another person or "mirror" the materials on other servers
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">3. Disclaimer</h2>
            <p>
              The materials on KashCraft's website are provided on an 'as is' basis. KashCraft makes
              no warranties, expressed or implied, and hereby disclaims and negates all other
              warranties including, without limitation, implied warranties or conditions of
              merchantability, fitness for a particular purpose, or non-infringement of intellectual
              property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">4. Limitations</h2>
            <p>
              In no event shall KashCraft or its suppliers be liable for any damages (including,
              without limitation, damages for loss of data or profit, or due to business
              interruption) arising out of the use or inability to use the materials on KashCraft's
              website.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on KashCraft's website could include technical, typographical,
              or photographic errors. KashCraft does not warrant that any of the materials on its
              website are accurate, complete, or current. KashCraft may make changes to the
              materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">6. Links</h2>
            <p>
              KashCraft has not reviewed all of the sites linked to its website and is not
              responsible for the contents of any such linked site. The inclusion of any link does
              not imply endorsement by KashCraft of the site. Use of any such linked website is at
              the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">7. Modifications</h2>
            <p>
              KashCraft may revise these terms of service for its website at any time without
              notice. By using this website, you are agreeing to be bound by the then current
              version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws
              of the United States, and you irrevocably submit to the exclusive jurisdiction of
              courts located in this location.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
              <br />
              Email: support@kashcraft.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
