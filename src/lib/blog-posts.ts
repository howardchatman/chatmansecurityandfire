// Registry of published blog posts, powering the site RSS feed at /rss.xml.
// The blog itself is hosted in GoHighLevel (blog.chatmansecurityandfire.com);
// this registry mirrors each published post so we have a real RSS feed on our
// own domain to syndicate (LinkedIn, etc.). Add a new entry each time a post
// is published — newest first.

export interface BlogPost {
  title: string;
  url: string;          // full URL to the live post
  description: string;
  date: string;         // ISO date published
  category: string;
}

export const blogPosts: BlogPost[] = [
  {
    title: "Failed a Houston Fire Marshal Inspection? Here's Exactly What to Do",
    url: "https://blog.chatmansecurityandfire.com/failed-houston-fire-marshal-inspection-what-to-do",
    description:
      "Failed a fire marshal inspection in Houston? Here's what your deficiency report means, your correction timeline, the most common violations, and how to pass re-inspection fast.",
    date: "2026-08-01T14:00:00.000Z",
    category: "Fire & Life Safety",
  },
];
