
import { useState, useEffect } from "react";
import axios from "@/config/axios";

interface ShippingFeeResult {
  fee: number;
  feeFormatted: string;
}

export function useShippingFee(province: string | null | undefined) {
  const [shippingFee, setShippingFee] = useState<ShippingFeeResult | null>(null);
  const [loadingFee, setLoadingFee]   = useState(false);

  useEffect(() => {
    if (!province) { setShippingFee(null); return; }

    setLoadingFee(true);
    axios
      .get<ShippingFeeResult>("/api/shipping/fee", { params: { address: province } })
      .then(r => setShippingFee(r.data))
      .catch(() => setShippingFee({ fee: 30_000, feeFormatted: "30.000đ" })) // fallback
      .finally(() => setLoadingFee(false));
  }, [province]);

  return { shippingFee, loadingFee };
}