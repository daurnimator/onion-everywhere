A firefox/chrome extension that redirects to TOR-accessible versions of pages as advertised in [`Onion-Location` headers](https://community.torproject.org/onion-services/advanced/onion-location/).

This does *not* provide good privacy guarantees; but instead:

  - Normalizes TOR usage, so it is less of an oddity for anyone looking at network traffic
  - Makes hidden services available in your regular browser
  - Doesn't put load on TOR exit nodes when accessing hidden services

Inspired by https://gitlab.com/sanpi/onion-everywhere

To set up TOR, see https://news.ycombinator.com/item?id=21344692
