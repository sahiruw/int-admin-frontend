import {
  PlusSquare,
  Fish,
  Database,
  UserCircle,
  Leaf,
  MapPin,
  Truck,
  Box,
  BarChart3,
  ReceiptText,
  FileText,
  CalendarDays,
  Users,
  Settings,
  ShoppingBag,
  ClipboardList,
  TrendingUp,
  PackageOpen,
  Store,
  ShoppingCart,
  CreditCard,
  LineChart,
  PieChart,
  FileBar,
} from "lucide-react";

export const NAV_DATA = [
  {
    label: "KOI MANAGEMENT",
    items: [
      {
        title: "Bulk Add",
        url: "/koi/bulk-add",
        icon: PlusSquare,
        items: [],
      },
      {
        title: "View Koi",
        url: "/koi/view",
        icon: Fish,
        items: [],
      },
    ],
  },
  {
    label: "REPORTS & ANALYTICS",
    items: [
      {
        title: "PO By Breeder",
        url: "/reports/po-by-breeder",
        icon: ClipboardList, // More specific for purchase orders
        items: [],
      },
      {
        title: "Invoice By Customer",
        url: "/reports/invoice-by-customer",
        icon: ReceiptText,
        items: [],
      },
      {
        title: "Sales By Period",
        url: "/reports/sales",
        icon: TrendingUp, // Better represents sales growth/trends over time
        items: [],
      },
    ],
  },
  {
    label: "SHIPPING",
    items: [
      {
        title: "INV & PL by Date",
        url: "/reports/inv-pl-by-date",
        icon: FileText, // Better for inventory and packing list documents
        items: [],
      },
      {
        title: "Shipping Organizer",
        url: "/reports/shipping-list",
        icon: Truck, // More directly represents shipping
        items: [],
      },
    ],
  },
  {
    label: "DATABASE",
    items: [
      {
        title: "Breeders",
        url: "/breeders",
        icon: UserCircle,
        items: [],
      },
      {
        title: "Varieties",
        url: "/varieties",
        icon: Leaf,
        items: [],
      },
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
        items: [],
      },
      {
        title: "Shipping Locations",
        url: "/shipping-locations",
        icon: MapPin,
        items: [],
      },
      {
        title: "Box Sizes",
        url: "/shipping/box-sizes",
        icon: Box,
        items: [],
      },
    ],
  },
  {
    label: "ADMIN PANEL",
    items: [
      {
        title: "Users",
        url: "/users",
        icon: Users,
        items: [],
      },
      {
        title: "Configurations",
        url: "/configurations",
        icon: Settings,
        items: [],
      },
    ],
  },
];