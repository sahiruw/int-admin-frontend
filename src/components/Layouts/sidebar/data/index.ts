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
        title: "Bulk Add",
        url: "/koi/bulk-add",
        icon: PlusCircle,
        items: [],
      },
      {
        title: "View Koi",
        url: "/koi/view",
        icon: Eye,
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
      {
        title: "Customers",
        url: "/customers",
        icon: Users,
        items: [],
      },
      {
        title: "Shipping Locations",
        url: "/shipping-locations",
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
        title: "Sales Report",
        url: "/reports/sales",
        icon: FileText,
        items: [],
      },
      {
        title: "INV & PL by Date",
        url: "/reports/inv-pl-by-date",
        icon: Receipt,
        items: [],
      },
      {
        title: "Shipping List",
        url: "/reports/shipping-list",
        icon: Calendar,
        items: [],
      },
    ],
  },
  {
    label : "MANAGEMENT",
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
        icon: File,
        items: [],
      }

    ],
  }
];
