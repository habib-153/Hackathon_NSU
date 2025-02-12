export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "CrimePortal || Travel Tips & Destination Guides",
  description: "🚀 Your ultimate platform for sharing travel stories, discovering destinations, and connecting with fellow adventurers!",
  navItems: [
    {
      label: "NewsFeed",
      href: "/",
    },
    {
      label: "Contact",
      href: "/contact",
    },
    {
      label: "About",
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: "About",
      href: "/about",
    },
    {
      label: "NewsFeed",
      href: "/posts",
    },
    {
      label: "Contact",
      href: "/contact",
    }
  ],
};
