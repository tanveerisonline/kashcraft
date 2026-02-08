import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const metadata = {
  title: "About KashCraft",
  description: "Learn about KashCraft and our commitment to authentic Kashmiri craftsmanship",
};

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Hero Section */}
      <section className="from-primary to-secondary bg-gradient-to-r py-20 text-white">
        <div className="container-custom">
          <h1 className="mb-4 text-5xl font-bold">About KashCraft</h1>
          <p className="text-lg opacity-90">Preserving Kashmiri Heritage, One Piece at a Time</p>
        </div>
      </section>

      <div className="container-custom space-y-16 py-16">
        {/* Our Story */}
        <section className="max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold">Our Story</h2>
          <p className="mb-4 leading-relaxed text-gray-700">
            KashCraft was founded with a single mission: to bring the authentic beauty of Kashmiri
            craftsmanship to the world. We believe in preserving traditional artisan techniques that
            have been passed down through generations.
          </p>
          <p className="leading-relaxed text-gray-700">
            Every product in our collection is carefully selected from master craftsmen in Kashmir,
            ensuring that you receive genuine, high-quality items that tell a story of tradition,
            skill, and dedication.
          </p>
        </section>

        {/* Our Values */}
        <section>
          <h2 className="mb-8 text-3xl font-bold">Our Values</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="p-6">
              <h3 className="mb-4 text-2xl font-bold">🎨 Authenticity</h3>
              <p className="text-gray-700">
                We work directly with artisans to bring you 100% authentic Kashmiri products
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="mb-4 text-2xl font-bold">♻️ Sustainability</h3>
              <p className="text-gray-700">
                Supporting traditional crafts helps preserve cultural heritage and livelihoods
              </p>
            </Card>
            <Card className="p-6">
              <h3 className="mb-4 text-2xl font-bold">✨ Quality</h3>
              <p className="text-gray-700">
                Every item is inspected to ensure the highest standards of craftsmanship
              </p>
            </Card>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="max-w-3xl">
          <h2 className="mb-6 text-3xl font-bold">Why Choose KashCraft?</h2>
          <ul className="space-y-4">
            <li className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <h4 className="mb-2 font-bold">Direct from Artisans</h4>
                <p className="text-gray-700">We partner directly with kashmiri craftspeople</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <h4 className="mb-2 font-bold">30-Day Money Back Guarantee</h4>
                <p className="text-gray-700">Shop with confidence knowing you can return items</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <h4 className="mb-2 font-bold">Free Shipping Over $100</h4>
                <p className="text-gray-700">Enjoy complimentary shipping worldwide</p>
              </div>
            </li>
            <li className="flex gap-4">
              <span className="text-2xl">✓</span>
              <div>
                <h4 className="mb-2 font-bold">Expert Support</h4>
                <p className="text-gray-700">Our team is here to answer any questions</p>
              </div>
            </li>
          </ul>
        </section>

        {/* CTA Section */}
        <section className="bg-primary rounded-lg px-8 py-12 text-center text-white">
          <h2 className="mb-4 text-3xl font-bold">Ready to Explore?</h2>
          <p className="mb-6 text-lg">Discover authentic Kashmiri craftsmanship today</p>
          <Link href="/products">
            <Button variant="secondary" size="lg">
              Shop Now
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
