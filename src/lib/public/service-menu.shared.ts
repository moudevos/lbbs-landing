export type PublicServiceBranch = {
  slug: string;
  name: string;
};

export type PublicServiceMenuItem = {
  name: string;
  price: number | null;
  isVariablePrice: boolean;
  category?: { slug: string; name: string } | null;
};

export function formatPublicPen(price: number) {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(price);
}
