import {
  PlusCircle,
  Eye,
  Home,
  Users,
  Leaf,
  Truck,
  Package,
  FileText,
  Receipt,
  Calendar,
  Clock,
  List,
  File
} from "lucide-react";

export const NAV_DATA = [
  {
    label: "KOI MANAGEMENT",
    items: [
      {
        title: "Add Koi",
        url: "/koi/add",
        icon: PlusCircle,
        items: [],
      },
      {
        title: "View Koi",
        url: "/koi/view",
        icon: Eye,
        items: [],
      },
      {
        title: "Boarding Koi",
        url: "/koi/boarding",
        icon: Home,
        items: [],
      },
    ],
  },
  {
    label: "BREEDING & VARIETIES",
    items: [
      {
        title: "Breeders",
        url: "/breeders",
        icon: Users,
        items: [],
      },
      {
        title: "Varieties",
        url: "/varieties",
        icon: Leaf,
        items: [],
      },
    ],
  },
  {
    label: "SHIPPING & LOGISTICS",
    items: [
      {
        title: "Add Shipping Info",
        url: "/shipping/add",
        icon: Truck,
        items: [],
      },
      {
        title: "Box Sizes",
        url: "/shipping/box-sizes",
        icon: Package,
        items: [],
      },
    ],
  },
  {
    label: "REPORTS & ANALYTICS",
    items: [
      {
        title: "PO by Breeder",
        url: "/reports/po-breeder",
        icon: FileText,
        items: [],
      },
      {
        title: "Invoice by Customer",
        url: "/reports/invoice-customer",
        icon: Receipt,
        items: [],
      },
      {
        title: "Summary by Date & Breeder",
        url: "/reports/summary-date-breeder",
        icon: Calendar,
        items: [],
      },
      {
        title: "By Date",
        icon: Clock,
        items: [
          {
            title: "Shipping List by Date",
            url: "/reports/shipping-list-date",
            icon: List,
          },
          {
            title: "INV & PL by Date",
            url: "/reports/inv-pl-date",
            icon: File,
          },
        ],
      },
    ],
  },
];
