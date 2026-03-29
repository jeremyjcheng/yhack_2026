import { useState } from "react";
import { Link } from "react-router-dom";
import WelcomeCarousel from "../components/WelcomeCarousel";

/** Screenshots live in `frontend/public/` (`about.png`, `insight.png`, `map.png`). */
const WELCOME_SLIDES = [
  {
    image: "/about.png",
    imageAlt: "About Climate Risk Advisor",
    title: "About the project",
    description:
      "Climate Risk Advisor is an interactive web app for exploring county-level climate risk across the United States—making hazard data easier to understand, compare, and act on.",
  },
  {
    image: "/insight.png",
    imageAlt: "Insights dashboard",
    title: "National insights",
    description:
      "Browse KPIs, risk distributions, state rankings, sortable county tables, and top or bottom lists—filter by state and switch heat, flood, wildfire, or overall views.",
  },
  {
    image: "/map.png",
    imageAlt: "Interactive county map",
    title: "Explore the map",
    description:
      "Search by ZIP or city, toggle risk layers, read hover tooltips, and open any county for details, news-grounded recommendations, and chat with the Risk Advisor.",
  },
];

export default function WelcomePage() {
  const [index, setIndex] = useState(0);

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col items-center overflow-y-auto bg-app-bg px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-app-muted">
          Getting started
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-app-text sm:text-3xl">
          Climate Risk Advisor
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-app-muted sm:text-base">
          County climate risk, mapped and explained
        </p>
      </div>

      <div className="mt-8 w-full flex-1 flex flex-col items-center justify-center pb-8">
        <WelcomeCarousel
          slides={WELCOME_SLIDES}
          index={index}
          setIndex={setIndex}
        />
      </div>

      <div className="mt-auto flex w-full justify-center pb-6">
        <Link
          to="/"
          className="inline-flex h-12 min-w-[200px] items-center justify-center rounded-lg bg-app-primary px-8 text-sm font-semibold text-white shadow-md transition hover:bg-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2"
        >
          Open map
        </Link>
      </div>
    </div>
  );
}
