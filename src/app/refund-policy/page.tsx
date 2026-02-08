export const metadata = {
  title: "Refund Policy - KashCraft",
};

export default function RefundPolicyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container-custom max-w-3xl py-12">
        <h1 className="mb-8 text-4xl font-bold">Refund Policy</h1>
        <p className="mb-8 text-gray-600">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">1. Overview</h2>
            <p>
              Thank you for shopping at KashCraft. We want you to be completely satisfied with your
              purchase. If you're not happy with your order, we offer a hassle-free refund policy.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">2. Refund Period</h2>
            <p>
              We offer a <strong>30-day return window</strong> from the date of purchase. Items must
              be returned within this period to be eligible for a refund. Items returned after 30
              days will not be accepted unless the product is defective.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">3. Condition of Items</h2>
            <p>Items must be returned in their original condition to qualify for a refund:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>Unused and unworn</li>
              <li>Original tags and packaging intact</li>
              <li>No signs of damage or excessive wear</li>
              <li>All accessories and components included</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">4. Return Process</h2>
            <p>To initiate a return:</p>
            <ol className="list-inside list-decimal space-y-2">
              <li>Contact our support team at returns@kashcraft.com</li>
              <li>Provide your order number and reason for return</li>
              <li>Receive return authorization and shipping instructions</li>
              <li>Ship the item back to us (prepaid return label provided for eligible items)</li>
              <li>Once received and inspected, we'll process your refund</li>
            </ol>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">5. Refund Timeline</h2>
            <p>
              Once we receive and inspect your returned item, refunds will be processed within 5-7
              business days. The refund will be credited to your original payment method. Please
              allow additional time for your financial institution to process the credit.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">6. Shipping Costs</h2>
            <p>
              Original shipping costs are non-refundable unless the return is due to our error or a
              defective product. For defective items, we will provide a prepaid return label. For
              other returns, customers are responsible for return shipping costs.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">
              7. Damaged or Defective Items
            </h2>
            <p>
              If you receive a damaged or defective item, please contact us immediately with photos
              of the issue. We will replace the item or issue a full refund, including original
              shipping costs, at no additional charge to you.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">8. Non-Refundable Items</h2>
            <p>The following items cannot be returned:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>Custom or made-to-order items</li>
              <li>Items marked as final sale</li>
              <li>Clearance items (unless defective)</li>
              <li>Digital products</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">9. Exchanges</h2>
            <p>
              If you'd like to exchange an item for a different size or color, you can initiate an
              exchange through our website or by contacting support. Exchanges within 30 days are
              usually processed with minimal additional shipping charges.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">10. Contact Us</h2>
            <p>
              For any questions about our refund policy, please contact us:
              <br />
              Email: returns@kashcraft.com
              <br />
              Phone: 1-800-KASHCRAFT
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
