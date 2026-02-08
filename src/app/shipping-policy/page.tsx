export const metadata = {
  title: "Shipping Policy - KashCraft",
};

export default function ShippingPolicyPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container-custom max-w-3xl py-12">
        <h1 className="mb-8 text-4xl font-bold">Shipping Policy</h1>
        <p className="mb-8 text-gray-600">Last updated: February 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">1. Processing Time</h2>
            <p>
              All orders are processed within <strong>1-2 business days</strong> of receipt and
              payment confirmation. Orders placed on weekends or holidays will be processed on the
              next business day. You'll receive a shipping confirmation email with tracking
              information once your order ships.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">2. Shipping Methods & Costs</h2>
            <p>We offer the following shipping options at checkout:</p>

            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold">Standard Shipping</h3>
              <p className="mb-2">
                <strong>Cost:</strong> Free on orders over $100, otherwise $10
              </p>
              <p>
                <strong>Delivery Time:</strong> 5-7 business days
              </p>
            </div>

            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold">Express Shipping</h3>
              <p className="mb-2">
                <strong>Cost:</strong> $15
              </p>
              <p>
                <strong>Delivery Time:</strong> 2-3 business days
              </p>
            </div>

            <div className="rounded-lg bg-gray-50 p-4">
              <h3 className="mb-3 font-semibold">Overnight Shipping</h3>
              <p className="mb-2">
                <strong>Cost:</strong> $25
              </p>
              <p>
                <strong>Delivery Time:</strong> Next business day
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">3. Delivery Areas</h2>
            <p>
              We currently ship to all addresses within the continental United States, Hawaii, and
              Alaska. International shipping is available to select countries. Shipping times and
              costs vary based on destination.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">4. Tracking Your Order</h2>
            <p>
              Once your order ships, you'll receive an email with a tracking number and carrier
              information. You can use this number to track your package online. Tracking updates
              are typically available within 24 hours of shipment.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">5. Delivery Confirmation</h2>
            <p>
              All orders are shipped with delivery confirmation. Signature may be required for
              orders exceeding $500 in value. If delivery is unsuccessful, the carrier will attempt
              redelivery or return the package to our warehouse.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">
              6. Lost or Damaged Shipments
            </h2>
            <p>
              If your package arrives damaged, please inspect it immediately and document the damage
              with photos. Contact us within 24 hours of delivery with your order number and damage
              details. We will either replace the item or issue a full refund.
            </p>
            <p className="mt-3">
              For lost packages, please contact us if your order hasn't arrived within the expected
              delivery window. We will file a claim with the carrier and send you a replacement or
              refund.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">7. Address Changes</h2>
            <p>
              If you need to change your shipping address, please contact us as soon as possible. We
              can only update addresses for orders that have not yet been processed (typically
              within 2 hours of placement). Requests cannot be honored once shipment has begun.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">8. International Shipping</h2>
            <p>
              For international orders, customers are responsible for any import duties, taxes, or
              customs fees. Delivery times may vary significantly depending on the destination
              country and local customs processing. We ship internationally with select carriers and
              provide tracking to most countries.
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">9. Shipping Restrictions</h2>
            <p>We cannot ship to:</p>
            <ul className="list-inside list-disc space-y-2">
              <li>PO boxes (Express and Overnight only ship to street addresses)</li>
              <li>Addresses identified as high-risk for fraud</li>
              <li>Countries with trade restrictions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">10. Bulk Orders</h2>
            <p>
              For bulk orders exceeding 20 units, please contact our sales team for special shipping
              rates and delivery arrangements. Email: bulk@kashcraft.com
            </p>
          </section>

          <section>
            <h2 className="text-foreground mb-4 text-2xl font-bold">11. Contact Us</h2>
            <p>
              For shipping inquiries or concerns, reach out to our customer service team:
              <br />
              Email: shipping@kashcraft.com
              <br />
              Hours: Monday - Friday, 9 AM - 6 PM EST
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
