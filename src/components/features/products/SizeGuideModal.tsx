"use client";

import { useState } from "react";
import { Ruler } from "lucide-react";

interface SizeInfo {
  size: string;
  chest: string;
  waist: string;
  length: string;
}

interface SizeGuideModalProps {
  productId: string;
  open?: boolean;
  onClose?: () => void;
}

export function SizeGuideModal({ productId, open = false, onClose }: SizeGuideModalProps) {
  const [sizes, setSizes] = useState<SizeInfo[]>([]);
  const [loading, setLoading] = useState(false);

  const handleOpen = async () => {
    if (sizes.length > 0) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/v1/products/${productId}/size-guide`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setSizes(data.sizes || []);
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn btn-ghost btn-sm gap-2" onClick={handleOpen}>
        <Ruler size={16} /> Size Guide
      </button>

      {open && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold">
              <Ruler size={20} /> Size Guide
            </h3>

            {loading && <div className="skeleton h-40" />}

            {!loading && sizes.length > 0 && (
              <div className="overflow-x-auto">
                <table className="table-compact table w-full">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Chest (in)</th>
                      <th>Waist (in)</th>
                      <th>Length (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizes.map((size) => (
                      <tr key={size.size}>
                        <td className="font-semibold">{size.size}</td>
                        <td>{size.chest}</td>
                        <td>{size.waist}</td>
                        <td>{size.length}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-action">
              <button className="btn btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
          <div className="modal-backdrop" onClick={onClose} />
        </div>
      )}
    </>
  );
}
