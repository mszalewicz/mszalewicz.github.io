---
title: "Weekly News - #24"
pubDate: 2026-05-26
links:
    - title: "How Monero's proof of work works"
      url: "https://blog.alcazarsec.com/tech/posts/how-moneros-proof-of-work-works"
      description: "Monero's proof-of-work system RandomX deliberately makes mining behave like general-purpose computing by executing random CPU programs that exercise cache, floating-point units, and memory controllers, which erodes the advantage of specialized ASIC hardware. The system chains eight programs together so miners cannot cherry-pick easy workloads, while maintaining a light verification mode that uses only 256 MiB instead of the full 2 GiB dataset."

    - title: "Learning Software Architecture"
      url: "https://matklad.github.io/2026/05/12/software-architecture.html"
      description: "Software architecture is learned by doing rather than studying, with Conway's law dictating that code structure inevitably mirrors organizational incentives rather than abstract ideals. The practical path forward is either nudging incentive structures when opportunities arise or adapting to them by isolating features with runtime boundaries and catch_unwind guards that allow quality to vary without poisoning the entire system."

    - title: "Replacing a 3 GB SQLite database with a 10 MB FST binary"
      url: "https://til.andrew-quinn.me/posts/replacing-a-3-gb-sqlite-database-with-a-7-mb-fst-finite-state-trandsucer-binary/"
      description: "A Finnish-English dictionary application achieved a 300x space reduction by replacing a SQLite database with a finite-state transducer that compresses both prefixes and suffixes, making it ideal for agglutinative languages where many words share common endings. The insight validates shipping a working but suboptimal solution first to enable cheap experimentation, then revisiting with deeper domain knowledge to discover serendipitous optimizations."

    - title: "You don't need CGO to use SQLite in your Go binary"
      url: "https://til.andrew-quinn.me/posts/you-don-t-need-cgo-to-use-sqlite-in-your-go-binary/"
      description: "Pure Go SQLite implementations like modernc.org/sqlite eliminate the need for CGO, preserving Go's trivial cross-compilation capabilities while still supporting FTS5 and the baked-data pattern of embedding databases directly into binaries. The tradeoff is worth accepting for most use cases since it enables shipping a single executable that works across all platforms without managing C toolchains."

---
