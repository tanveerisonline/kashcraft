"use client";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  items: FAQItem[];
  title?: string;
}

export function FAQSection({ items, title = "Frequently Asked Questions" }: FAQSectionProps) {
  return (
    <section className="py-12">
      <h2 className="mb-8 text-center text-3xl font-bold">{title}</h2>

      <div className="mx-auto max-w-2xl space-y-4">
        {items.map((item, idx) => (
          <details key={idx} className="border-base-300 collapse border">
            <summary className="collapse-title text-lg font-bold">{item.question}</summary>
            <div className="collapse-content">
              <p className="pt-4 text-gray-600">{item.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
