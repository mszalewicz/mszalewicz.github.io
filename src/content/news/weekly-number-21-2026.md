---
title: "Weekly News - #21"
pubDate: 2026-05-23
links:
    - title: "Migrating from Go to Rust"
      url: "https://corrode.dev/learn/migration-guides/go-to-rust/"
      description: "Teams migrate from Go to Rust not for raw speed but for compile-time guarantees that eliminate nil dereferences through Option types, data races through Send and Sync traits, and error handling mistakes through Result types with exhaustive checking. The borrow checker feels like friction initially but uncovers real bugs that manifest as production incidents in Go, while Rust's monomorphized generics provide zero-cost abstractions that Go's GC-shape stenciling cannot match."

    - title: "Build It Yourself"
      url: "https://lucumr.pocoo.org/2025/1/24/build-it-yourself/"
      description: "The Rust ecosystem's dependency culture has created unsustainable churn where simple functions like terminal size detection drag in multiple crates for a 50-year-stable API, driven by corporate code review culture that rewards library usage over simplicity. AI coding assistants now make writing dependency-free implementations faster than evaluating external libraries, suggesting a needed vibe shift toward celebrating minimal dependencies and code that achieves stability without constant updates."

    - title: "Claude vs Gemini vs Codex vs Qwen vs MiniMax Code Review"
      url: "https://milvus.io/blog/ai-code-review-gets-better-when-models-debate-claude-vs-gemini-vs-codex-vs-qwen-vs-minimax.md"
      description: "Benchmarking five flagship AI models on real production bugs revealed that the best single model (Claude) caught only 53% of issues, but five rounds of adversarial debate between models increased detection to 80% by having each model critique and build upon the others' findings. The optimal two-model pairing of Claude and Gemini reached 91% of the full five-model ceiling, demonstrating that multi-model debate patches individual blind spots more cost-effectively than using any single model alone."

    - title: "Notes about reading messages with the Python email packages"
      url: "https://utcc.utoronto.ca/~cks/space/blog/python/EmailPackagesNotes"
      description: "The Python 3 email package's modern EmailMessage API is only partially designed for real-world malformed messages, forcing developers to fall back to the older Message.get_payload() API to extract body text from non-compliant MIME structures like bounce messages that claim to be multipart/alternative but contain only '(Body suppressed)'. Similarly, message/delivery-status parts are parsed as multipart objects with empty bodies despite being plain text, requiring EmailMessage.as_string() on child objects to extract the actual delivery status headers."

---
