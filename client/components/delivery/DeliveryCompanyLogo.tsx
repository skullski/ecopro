import { useEffect, useMemo, useState } from 'react';
import { DELIVERY_LOGO_FALLBACK_SRC, getDeliveryCompanyLogoCandidates } from '@/lib/deliveryLogos';

type Props = {
  name?: string | null;
  className?: string;
  alt?: string;
};

export function DeliveryCompanyLogo({ name, className, alt }: Props) {
  const candidates = useMemo(() => getDeliveryCompanyLogoCandidates(name), [name]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [name]);

  const src = candidates[index] || DELIVERY_LOGO_FALLBACK_SRC;

  return (
    <img
      src={src}
      alt={alt || String(name || 'Delivery company')}
      className={className}
      onError={() => {
        setIndex((i) => (i + 1 < candidates.length ? i + 1 : i));
      }}
    />
  );
}
