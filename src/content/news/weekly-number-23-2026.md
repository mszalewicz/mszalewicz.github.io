---
title: "Weekly News - #23"
pubDate: 2026-05-25
links:
    - title: "Using AI to write better code more slowly"
      url: "https://nolanlawson.com/2026/05/25/using-ai-to-write-better-code-more-slowly/"
      description: "Running multiple AI models in parallel to review code and then having a final agent reconcile their findings produces high-quality bug detection with near-zero false positives, though this approach often uncovers pre-existing bugs that send developers on tangential fixing quests. This slower, methodical style prioritizes codebase health and deep understanding over raw velocity, using tools like the grill-me skill to ensure complete comprehension of every change."

    - title: "My 'Grill Me' Skill Went Viral"
      url: "https://www.aihero.dev/my-grill-me-skill-has-gone-viral"
      description: "The grill-me skill uses relentless AI questioning to walk through every branch of a decision tree until reaching shared understanding, functioning as an enhanced form of rubber-duck debugging that works equally well for coding plans and non-technical decisions. Adding recommended answers to each question significantly speeds up the conversation by allowing simple affirmation rather than lengthy explanations."

    - title: "How my minimal, memory-safe Go rsync steers clear of vulnerabilities"
      url: "https://michael.stapelberg.ch/posts/2026-05-24-minimal-memory-safe-go-rsync-vulns/#go-verdict"
      description: "A Go reimplementation of rsync avoided eleven of twelve recent CVEs affecting the original C codebase through a combination of Go's bounds checking, zero initialization, os.Root API for traversal-resistant file access, and deliberate minimalism that skips complex features like incremental recursion and compression. The remaining vulnerability was a logic bug that no language could prevent, demonstrating that memory safety plus API design eliminates entire vulnerability classes."

    - title: "Field Guide to TSL and WebGPU"
      url: "https://blog.maximeheckel.com/posts/field-guide-to-tsl-and-webgpu/"
      description: "Three.js Shading Language provides a JavaScript-like abstraction that compiles to both WebGL's GLSL and WebGPU's WGSL, enabling developers to write shaders once and run them on either API while the WebGPURenderer automatically falls back to WebGL when needed. The node system eliminates the string-concatenation hell of onBeforeCompile by providing typed hooks like colorNode and positionNode that compose naturally, though texture handling requires understanding the distinction between the texture sampling function and the texture uniform wrapper."

---
