export type Brand = "Samsung" | "Xiaomi" | "Motorola" | "iPhone" | "LG";

export type Category =
  | "display"
  | "battery"
  | "charging_board"
  | "back_cover";

export type Product = {
  id: string;
  code: string;
  name: string;
  brand: Brand;
  category: Category;
  model: string;
  imageUrl: string;
  inStock: boolean;
  restockDate?: string;
  price: number;
  description?: string;
  tags?: string[];
  popularity?: number;
};

export const brandOptions: Array<{ key: Brand; label: Brand }> = [
  { key: "Samsung", label: "Samsung" },
  { key: "Xiaomi", label: "Xiaomi" },
  { key: "Motorola", label: "Motorola" },
  { key: "iPhone", label: "iPhone" },
  { key: "LG", label: "LG" },
];

export const categoryOptions: Array<{
  key: Category;
  label: string;
  description: string;
}> = [
  {
    key: "display",
    label: "Display",
    description: "Painéis originais e homologados, com garantia de 1 ano.",
  },
  {
    key: "battery",
    label: "Bateria",
    description: "Alta performance e segurança para reposição atacadista.",
  },
  {
    key: "charging_board",
    label: "Placa de Carga",
    description: "Componentes testados para reparos rápidos e confiáveis.",
  },
  {
    key: "back_cover",
    label: "Tampa Traseira",
    description: "Acabamentos premium para devolver o visual original.",
  },
];

export const products: Product[] = [
  {
    id: "display-samsung-a02",
    code: "DISP-SAM-A02",
    name: "Display Samsung A02",
    brand: "Samsung",
    category: "display",
    model: "A02",
    imageUrl: "/logo-iron.png",
    inStock: true,
    price: 89.90,
    popularity: 75,
  },
  {
    id: "display-samsung-a03",
    code: "DISP-SAM-A03",
    name: "Display Samsung A03",
    brand: "Samsung",
    category: "display",
    model: "A03",
    imageUrl: "/logo-iron.png",
    inStock: true,
    price: 95.50,
    popularity: 80,
  },
  {
    id: "display-samsung-a10",
    code: "DISP-SAM-A10",
    name: "Display Samsung A10",
    brand: "Samsung",
    category: "display",
    model: "A10",
    imageUrl: "/logo-iron.png",
    inStock: false,
    restockDate: "2025-11-10",
    price: 110.00,
    popularity: 60,
  },
  {
    id: "display-xiaomi-redmi12",
    code: "DISP-XIA-REDMI12",
    name: "Display Xiaomi Redmi 12",
    brand: "Xiaomi",
    category: "display",
    model: "Redmi 12",
    imageUrl: "/logo-iron.png",
    inStock: true,
    price: 125.00,
    popularity: 85,
  },
  {
    id: "battery-samsung-a02",
    code: "BAT-SAM-A02",
    name: "Bateria Samsung A02",
    brand: "Samsung",
    category: "battery",
    model: "A02",
    imageUrl: "/logo-iron.png",
    inStock: true,
    price: 45.00,
    popularity: 70,
  },
  {
    id: "battery-motorola-g22",
    code: "BAT-MOT-G22",
    name: "Bateria Motorola G22",
    brand: "Motorola",
    category: "battery",
    model: "Moto G22",
    imageUrl: "/logo-iron.png",
    inStock: false,
    restockDate: "2025-12-01",
    price: 52.00,
    popularity: 55,
  },
  {
    id: "charging-samsung-a13",
    code: "CHG-SAM-A13",
    name: "Placa de carga Samsung A13",
    brand: "Samsung",
    category: "charging_board",
    model: "A13",
    imageUrl: "/logo-iron.png",
    inStock: true,
    price: 38.50,
    popularity: 65,
  },
  {
    id: "charging-xiaomi-redmi9",
    code: "CHG-XIA-REDMI9",
    name: "Placa de carga Xiaomi Redmi 9",
    brand: "Xiaomi",
    category: "charging_board",
    model: "Redmi 9",
    imageUrl: "/logo-iron.png",
    inStock: true,
    price: 42.00,
    popularity: 70,
  },
  {
    id: "backcover-samsung-a32",
    code: "BKCV-SAM-A32",
    name: "Tampa traseira Samsung A32",
    brand: "Samsung",
    category: "back_cover",
    model: "A32",
    imageUrl: "/logo-iron.png",
    inStock: false,
    restockDate: "2025-11-20",
    price: 68.00,
    popularity: 50,
  },
  {
    id: "backcover-iphone-11",
    code: "BKCV-IPH-11",
    name: "Tampa traseira iPhone 11",
    brand: "iPhone",
    category: "back_cover",
    model: "iPhone 11",
    imageUrl: "/logo-iron.png",
    inStock: true,
    price: 180.00,
    popularity: 90,
  },
  {
    id: "display-iphone-12",
    code: "DISP-IPH-12",
    name: "Display iPhone 12",
    brand: "iPhone",
    category: "display",
    model: "iPhone 12",
    imageUrl: "/logo-iron.png",
    inStock: true,
    price: 650.00,
    popularity: 95,
  },
  {
    id: "battery-lg-k62",
    code: "BAT-LG-K62",
    name: "Bateria LG K62",
    brand: "LG",
    category: "battery",
    model: "K62",
    imageUrl: "/logo-iron.png",
    inStock: true,
    price: 48.00,
    popularity: 40,
  },
];

export function getProductsByBrandAndCategory(brand: Brand, category: Category) {
  return products.filter(
    (product) => product.brand === brand && product.category === category,
  );
}

