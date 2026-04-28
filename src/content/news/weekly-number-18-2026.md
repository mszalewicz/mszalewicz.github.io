---
title: "Weekly News - #18"
pubDate: 2026-04-27
links:
    - title: "Tracing Discord's Elixir Systems (Without Melting Everything)"
      url: "https://discord.com/blog/tracing-discords-elixir-systems-without-melting-everything"
      description: "Discord’s Elixir architecture uses independent processes per guild with no built-in metadata layer for trace context, which made standard distributed tracing impossible at their scale. The team built an envelope-based message transport to carry OpenTelemetry context between processes, then used dynamic sampling rates tied to fanout size and a fast-path bit check to prevent the CPU overhead that initially crippled their largest guilds."

    - title: "How to protect against OAuth-based supply chain breaches and credential sprawl"
      url: "https://1password.com/blog/protect-against-oauth-supply-chain-breaches"
      description: "OAuth-based supply chain breaches exploit the fact that valid tokens from compromised third-party services look entirely legitimate to most security tools, allowing attackers to access internal systems without bypassing authentication. The most effective defense is continuous discovery of connected applications combined with just-in-time credential issuance, because point-in-time audits cannot keep pace with how quickly shadow IT and AI tool integrations proliferate."

    - title: "Toolchain Horizons: Exploring Rust Dependency-Toolchain Compatibility"
      url: "https://tigerbeetle.com/blog/2026-04-24-toolchain-horizons/"
      description: "A point release of the syn crate bumped its minimum supported Rust version and broke TigerBeetle’s CI, prompting the team to remove every dependency from their Rust client and backport it to Rust 1.39. Testing the top one hundred crates on crates.io revealed that most of the ecosystem forces a roughly two-year toolchain upgrade cycle, not because the compiler changes but because transitive dependencies continually raise their rust-version requirements."

    - title: "Using GPT-5.5"
      url: "https://developers.openai.com/api/docs/guides/latest-model"
      description: "GPT-5.5 raises the baseline for production workflows but requires treating it as a new model family rather than a drop-in replacement for earlier GPT-5 models. The model defaults to medium reasoning effort and interprets prompts literally, which means teams get the best results by describing expected outcomes and constraints while letting the model choose its own execution path."
---
