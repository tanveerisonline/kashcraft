import React from 'react';
import Link from 'next/link';

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={`bg-gray-800 text-white py-8 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Section 1: About */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">About Us</h3>
            <p className="text-sm text-gray-400">
              Kashcraft is your one-stop shop for unique and handcrafted items. We believe in quality, creativity, and customer satisfaction.
            </p>
          </div>

          {/* Section 2: Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-400 hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-400 hover:text-white">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Section 3: Contact Info */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Contact Info</h3>
            <p className="text-sm text-gray-400">
              123 Craft Lane, Artisan City, AC 12345
            </p>
            <p className="text-sm text-gray-400">
              Email: info@kashcraft.com
            </p>
            <p className="text-sm text-gray-400">
              Phone: (123) 456-7890
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-8 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Kashcraft. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export { Footer };
