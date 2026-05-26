---
title: "Weekly News - #22"
pubDate: 2026-05-24
links:
    - title: "Overview of renderers"
      url: "https://docs.godotengine.org/en/stable/tutorials/rendering/renderers.html"
      description: "Godot 4 offers three renderers with clear tradeoffs: Forward+ provides all rendering features using modern low-level APIs but runs poorly on older hardware, Mobile targets newer devices with fewer features, and Compatibility uses OpenGL to support the widest range of hardware including web export. The RenderingDevice abstraction allows Forward+ and Mobile to use Vulkan, Direct3D 12, or Metal interchangeably, with automatic fallback chains ensuring projects run even when preferred APIs are unavailable."

    - title: "Mythos finds a curl vulnerability"
      url: "https://daniel.haxx.se/blog/2026/05/11/mythos-finds-a-curl-vulnerability/"
      description: "Anthropic's Mythos AI model found only one confirmed vulnerability in curl's 176,000 lines of heavily audited C code, with four other flagged issues being false positives or non-security bugs, suggesting the marketing hype exceeded the practical advantage over other AI scanning tools. The finding validates curl's extensive defensive infrastructure including capped dynamic buffers, explicit numeric parsing limits, and per-protocol response size caps that systematically close bug classes."

    - title: "Gorilla: A fast, scalable, in-memory time series database"
      url: "https://blog.acolyer.org/2016/05/03/gorilla-a-fast-scalable-in-memory-time-series-database/"
      description: "Facebook's Gorilla stores 2 billion time series in memory by using delta-of-deltas compression that represents 96% of timestamps in a single bit and XOR-based floating-point compression that handles 51% of identical values with just one bit, achieving 12x overall reduction. The in-memory design prioritizes recent data and low-latency reads over historical retention, enabling real-time correlation analysis that helped identify production incidents within minutes."

    - title: "Configuring a Go HTTP Server for Unencrypted HTTP/2 (h2c)"
      url: "https://www.clarityboss.com/blog/go-http2-cleartext-h2c-cloud-run"
      description: "Go 1.24 simplifies HTTP/2 cleartext configuration by adding direct protocol selection on http.Server, eliminating the need for the x/net/http2/h2c wrapper and enabling cleaner code for environments like Cloud Run where TLS terminates at the load balancer. The new Protocols field allows explicitly enabling HTTP/1.1, HTTP/2, and unencrypted HTTP/2 independently through SetHTTP1 and SetUnencryptedHTTP2 methods."

---
