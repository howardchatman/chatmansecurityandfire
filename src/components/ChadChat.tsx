// ChadChat is switched off: it renders nothing, so the existing <ChadChat />
// references across the site are harmless. The site currently has no chat
// bubble — visitors use the lead forms or call (346) 852-5540.
//
// Bring Chad back by rendering the assistant here; every page that already
// includes <ChadChat /> picks it up.
export default function ChadChat() {
  return null;
}
