import { MetadataRoute } from "next";

// Private areas no crawler should index — customer data, staff tools, APIs.
const PRIVATE = ["/admin/", "/api/", "/portal/", "/tech/", "/district-portal/"];

// AI assistants and the search indexes they draw from, named explicitly so
// the site's intent is unambiguous: public pages are open to be read, cited,
// and recommended. (The "*" rule already allows them; naming them guards
// against a future blanket block and documents who we want reading.)
//
// Note on robots.txt semantics: a crawler that matches a named group ignores
// the "*" group entirely — so each named group repeats the private paths.
const AI_AND_SEARCH_CRAWLERS = [
  "GPTBot", // OpenAI — model training / ChatGPT
  "OAI-SearchBot", // ChatGPT search results
  "ChatGPT-User", // ChatGPT fetching a page for a user
  "ClaudeBot", // Anthropic
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended", // Gemini
  "Googlebot",
  "Bingbot", // Bing → Microsoft Copilot, Alexa, DuckDuckGo, Yahoo, ChatGPT search
  "Applebot", // Siri, Spotlight, Apple Maps
  "Applebot-Extended", // Apple Intelligence
  "Amazonbot", // Alexa
  "DuckAssistBot", // DuckDuckGo AI answers
  "meta-externalagent", // Meta AI
  "YouBot", // You.com
  "cohere-ai",
  "MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: AI_AND_SEARCH_CRAWLERS, allow: "/", disallow: PRIVATE },
      { userAgent: "*", allow: "/", disallow: PRIVATE },
    ],
    // www, matching the canonical host and the sitemap's own URLs.
    sitemap: "https://www.chatmansecurityandfire.com/sitemap.xml",
    host: "https://www.chatmansecurityandfire.com",
  };
}
