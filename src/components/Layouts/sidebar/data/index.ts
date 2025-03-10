import * as Icons from "../icons";

export const NAV_DATA = [
  {
    label: "MAIN MENU",
    items: [

      {
        title: "Breeder & Variety",
        url: "/breeders",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Add Koi",
        url: "/breeders",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Shipped Koi",
        url: "/breeders",
        icon: Icons.Calendar,
        items: [],
      },
      {
        title: "Breeder & Variety",
        url: "/breeders",
        icon: Icons.Calendar,
        items: [],
      },
    ]
  },
  {
    label: "REPORTS",
    items: [
      {
        title: "Charts",
        icon: Icons.PieChart,
        items: [
          {
            title: "Basic Chart",
            url: "/charts/basic-chart",
          },
        ],
      },
      {
        title: "UI Elements",
        icon: Icons.FourCircle,
        items: [
          {
            title: "Alerts",
            url: "/ui-elements/alerts",
          },
          {
            title: "Buttons",
            url: "/ui-elements/buttons",
          },
        ],
      },
      {
        title: "Authentication",
        icon: Icons.Authentication,
        items: [
          {
            title: "Sign In",
            url: "/auth/sign-in",
          },
        ],
      },
    ],
  },
];
