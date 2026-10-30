import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/LandingPage";
import { AboutPage } from "./components/AboutPage";
import { ContactPage } from "./components/ContactPage";
import { AuthPage } from "./components/AuthPage";
import { DonorDashboard } from "./components/donor/DonorDashboard";
import { DonorHome } from "./components/donor/DonorHome";
import { NewDonation } from "./components/donor/NewDonation";
import { MyDonations } from "./components/donor/MyDonations";
import { DonationHistory } from "./components/donor/DonationHistory";
import { ProfilePage } from "./components/donor/ProfilePage";
import { NGODashboard } from "./components/ngo/NGODashboard";
import { NGOHome } from "./components/ngo/NGOHome";
import { AvailableDonations } from "./components/ngo/AvailableDonations";
import { MyPickups } from "./components/ngo/MyPickups";
import { CompletedPickups } from "./components/ngo/CompletedPickups";
import { NGOProfile } from "./components/ngo/NGOProfile";
import { DonationDetails } from "./components/donor/DonationDetails";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/about",
    Component: AboutPage,
  },
  {
    path: "/contact",
    Component: ContactPage,
  },
  {
    path: "/auth/:role?",
    Component: AuthPage,
  },
  {
    path: "/donor",
    Component: DonorDashboard,
    children: [
      {
        path: "dashboard",
        Component: DonorHome,
      },
      {
        path: "new-donation",
        Component: NewDonation,
      },
      {
        path: "my-donations",
        Component: MyDonations,
      },
      {
        path: "donation/:id",
        Component: DonationDetails,
      },
      {
        path: "history",
        Component: DonationHistory,
      },
      {
        path: "profile",
        Component: ProfilePage,
      },
    ],
  },
  {
    path: "/ngo",
    Component: NGODashboard,
    children: [
      {
        path: "dashboard",
        Component: NGOHome,
      },
      {
        path: "available-donations",
        Component: AvailableDonations,
      },
      {
        path: "my-pickups",
        Component: MyPickups,
      },
      {
        path: "completed",
        Component: CompletedPickups,
      },
      {
        path: "profile",
        Component: NGOProfile,
      },
    ],
  },
]);
