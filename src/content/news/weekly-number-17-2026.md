---
title: "Weekly News - #17 2026"
pubDate: 2026-04-20
links:
    - title: "Automation That Screams Joy"
      url: "https://tigerbeetle.com/blog/2026-04-14-automation-screams-joy/"
      description: "Custom automation that lives outside standard CI platforms should be kept in the same repository as the main project and written in the same language to eliminate the friction of context switching and cross-team dependencies. The system is designed to auto-deploy through a self-bootstrapping script that continuously clones and runs the latest main branch, which means any developer with push access can change production automation through a simple pull request without ops involvement."
    - title: "unshare(1)"
      url: "https://man7.org/linux/man-pages/man1/unshare.1.html"
      description: "The unshare command creates isolated namespaces that virtualize core system resources—PIDs, network stacks, mount points, and user identities—allowing processes to operate with entirely separate views of the system than their parents. While container runtimes orchestrate multiple namespaces behind complex abstractions, unshare exposes this capability directly through the user namespace, which means unprivileged users can create lightweight sandboxes and gain root privileges within them without elevated permissions on the host."
    - title: "How (and why) we rewrote our production C++ frontend infrastructure in Rust"
      url: "https://blog.nearlyfreespeech.net/2026/04/17/how-and-why-we-rewrote-our-production-c-frontend-infrastructure-in-rust/"
      description: "A frontend system processing every customer request was rewritten from C++ to Rust despite functioning perfectly, driven by the friction of extending aging code in a language where safety is optional. Given that any bug could simultaneously affect all customers, the migration was validated through exhaustive testing including side-by-side proxy comparison of live traffic before the Rust version became authoritative."
    - title: "Jujutsu megamerges for fun and profit"
      url: "https://isaaccorbrey.com/notes/jujutsu-megamerges-for-fun-and-profit"
      description: "The megamerge workflow uses an octopus merge commit as the parent of all active branches, allowing developers to simultaneously work on every stream of code they care about in a single combined context. By layering changes on top of this megamerge and using commands like `absorb` and `squash` to redistribute work to specific branches, the system eliminates context-switching friction and prevents surprise merge conflicts without requiring developers to push the merge commit itself."
    # - title: ""
    #   url: "https://isaaccorbrey.com/notes/jujutsu-megamerges-for-fun-and-profit"
    #   description: ""
---
