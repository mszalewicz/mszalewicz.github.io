---
title: "Weekly News - #20"
pubDate: 2026-05-22
links:
    - title: "Redis array type: short story of a long development"
      url: "https://antirez.com/news/164"
      description: "The Redis Array data type was developed over four months using AI assistants for specification refinement and code generation, resulting in a sparse directory-of-slices design that morphs into a super-directory structure when conditions require supporting massive indices without huge allocations. AI provided the safety net for tedious tasks like 32-bit support and comprehensive testing while allowing the developer to venture into complexity levels that would have been skipped otherwise."

    - title: "Programming Still Sucks"
      url: "https://www.stvn.sh/writing/programming-still-sucks-fqffhyp"
      description: "The software industry's current dysfunction stems from leadership optimizing for short-term metrics and AI-driven layoffs rather than sustainable engineering, having systematically eliminated apprenticeship pipelines while depending on invisible institutional knowledge carried by senior engineers who inherited it from mentors now gone. The result is a generation of technical leaders who signed off on destroying the very systems that produce people capable of maintaining critical infrastructure."

    - title: "This blog ran on Ubuntu 16.04 for 10 years. I migrated it to FreeBSD"
      url: "https://crocidb.com/post/this-blog-ran-on-ubuntu-16-04-for-10-years-i-migrated-it-to-freebsd/"
      description: "A decade-old Ubuntu 16.04 server was replaced with a FreeBSD system using jails managed by Bastille for per-site isolation, achieving 15x better request throughput and 94% success rate under load testing compared to 7% on the legacy system. The migration leveraged FreeBSD's mature ZFS filesystem for snapshots and PF firewall for routing, demonstrating that container-style virtualization existed in BSD systems 25 years before Docker."

    - title: "Understanding the Go Runtime: Slices, Maps, and Channels"
      url: "https://internals-for-interns.com/posts/go-runtime-slices-maps-channels/"
      description: "Go's slice is a 24-byte header pointing to a backing array that doubles in capacity until 256 elements then transitions to 1.25x growth, while maps use Swiss Tables with a three-level structure of directory, tables, and 8-slot groups with control words for fast probing. Channels implement a circular buffer with sendq and recvq wait queues, using direct value handoff between parked goroutines when available rather than copying through the buffer."

---
