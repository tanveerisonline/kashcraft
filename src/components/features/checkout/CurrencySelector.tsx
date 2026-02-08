"use client";

import { useState, useEffect } from "react";
import { Globe } from "lucide-react";

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
];

interface CurrencySelectorProps {
  onSelect?: (code: string, symbol: string) => void;
}

export function CurrencySelector({ onSelect }: CurrencySelectorProps) {
  const [selected, setSelected] = useState("USD");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchDetected = async () => {
      try {
        const res = await fetch("/api/v1/currency/detect");
        if (!res.ok) return;
        const data = await res.json();
        if (data.currency) {
          setSelected(data.currency);
          const currency = CURRENCIES.find((c) => c.code === data.currency);
          onSelect?.(data.currency, currency?.symbol || "$");
        }
      } catch (err) {
        console.error("Error detecting currency:", err);
      }
    };

    fetchDetected();
  }, [onSelect]);

  const handleSelect = (code: string) => {
    setSelected(code);
    const currency = CURRENCIES.find((c) => c.code === code);
    onSelect?.(code, currency?.symbol || "$");
    setOpen(false);
  };

  const selectedCurrency = CURRENCIES.find((c) => c.code === selected);

  return (
    <div className="dropdown dropdown-end">
      <button className="btn btn-ghost btn-sm gap-2" onClick={() => setOpen(!open)}>
        <Globe size={16} />
        {selectedCurrency?.code}
      </button>

      {open && (
        <ul className="dropdown-content menu bg-base-100 rounded-box w-56 p-2 shadow">
          {CURRENCIES.map((currency) => (
            <li key={currency.code}>
              <a
                onClick={() => handleSelect(currency.code)}
                className={selected === currency.code ? "active" : ""}
              >
                <span>{currency.symbol}</span>
                <span>{currency.label}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
