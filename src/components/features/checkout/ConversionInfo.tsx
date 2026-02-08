"use client";

interface ConversionInfoProps {
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  amount: number;
}

export function ConversionInfo({ fromCurrency, toCurrency, rate, amount }: ConversionInfoProps) {
  const converted = amount * rate;

  return (
    <div className="card bg-base-100 p-4 shadow">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex-1 text-center">
          <p className="text-sm text-gray-500">From</p>
          <p className="text-2xl font-bold">{amount.toFixed(2)}</p>
          <p className="text-lg text-gray-700">{fromCurrency}</p>
        </div>

        <div className="px-4">
          <button className="btn btn-ghost btn-sm">⇄</button>
        </div>

        <div className="flex-1 text-center">
          <p className="text-sm text-gray-500">To</p>
          <p className="text-primary text-2xl font-bold">{converted.toFixed(2)}</p>
          <p className="text-lg text-gray-700">{toCurrency}</p>
        </div>
      </div>

      <div className="divider my-2" />

      <p className="text-center text-sm text-gray-500">
        1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
      </p>
    </div>
  );
}
