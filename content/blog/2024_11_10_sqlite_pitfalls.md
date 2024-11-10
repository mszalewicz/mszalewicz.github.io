---
title: "SQLite Pitfalls"
date: 2024-11-10T10:20:42+01:00
draft: false
---

## Intro

SQLite is the world’s  [most widely](https://www.sqlite.org/mostdeployed.html) used database, powering the backends of countless applications. For most software, it offers a reliable solution for embedded data storage, eliminating the need to reinvent the wheel. Its broad adoption means developers benefit from a well-documented, dependable tool with a familiar SQL dialect.

<br/>

Recent interest in SQLite has surged, particularly due to its fit for two key technological trends. First, it’s a strong choice for multi-tenant architectures, where platforms like Turso leverage SQLite to give each tenant an isolated database. This setup simplifies data management while maintaining privacy and scalability​. Second, SQLite has found new applications in web-based environments with the rise of WebAssembly (WASM). By embedding SQLite databases directly into browsers, developers can provide fast, local data storage that complements server-side databases. This enables efficient offline functionality and performance gains for web apps​. For a detailed example of this use case, check out Notion’s excelent blog [post](https://www.notion.so/blog/how-we-sped-up-notion-in-the-browser-with-wasm-sqlite) on how they sped up their browser app.

<br/>

More and more people, myself included, are becoming intrigued by SQLite. However, for those transitioning from other database systems, there are a few surprising differences to discover.

