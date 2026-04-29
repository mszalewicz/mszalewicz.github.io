---
title: "Frosk - local first password manager"
description: "Building a local-first password manager with Go's standard library and minimal dependencies."
pubDate: 2025-09-05
author: "Maciej Szalewicz"
---

I built Frosk because I wanted to see how far you could get with Go's standard library and a minimal set of dependencies. The idea was simple: a password manager that stores everything locally, encrypts on-device, and doesn't phone home to any servers. What started as a weekend experiment turned into a full cross-platform desktop app with a custom GUI, SQLite backend. This post is about what I've learned building it, the mistakes I made, and why I'd probably do some things differently if I started over today.

There's a weird gap between reading about cryptographic algorithms and actually using them. You read that AES-256-GCM is secure, that Argon2id is the modern standard for key derivation, and you think "cool, I'll just use those." But then you sit down to write the code and realize nobody tells you the practical stuff: how exactly do you structure the key derivation output? Where do you put the salt? How do you generate IVs without shooting yourself in the foot? When do you need constant-time comparison versus regular string comparison? These aren't theoretical questions — they're the difference between a password manager that actually protects data and one that just looks secure.

#### Architecture

The GUI layer lives in the gui/ directory and handles all the immediate-mode rendering with GioUI library. The backend layer in backend/ orchestrates the database communication and cryptographic operations, exposing clean methods like EncryptPasswordEntry and DecryptPasswordEntry that the GUI can call without knowing anything about the underlying implementation. The storage layer is just SQLite accessed through database/sql and the go-sqlite3 driver — no ORM, no abstraction layers, just raw SQL queries. This separation isn't revolutionary, but for a side project that I wanted to maintain long-term, keeping those boundaries clear, meant I could refactor one layer without breaking everything else. The GUI never sees a SQL query or an AES cipher block; it makes backend calls and gets results through channels.

#### The Dependency Philosophy

I set a constraint for myself - minimal number of dependencies. The reasoning was simple, every dependency is something that can break, something that might have a vulnerability ([like axios](https://www.trendmicro.com/en_us/research/26/c/axios-npm-package-compromised.html)), and something I should be able to audit if I'm building a security tool. So Frosk depends on GioUI for the GUI and go-sqlite3 for database access. That's it. The trade-off is that I ended up writing a lot of boilerplate code that a heavier framework would have handled for me. Want to center a window on the screen? That took a three-frame invalidate workaround in GioUI - otherwise window and it's content would be a little wobbled. Want form validation? Write it yourself. But here's the thing: I know exactly what every part of this codebase does, and if something breaks, there are only two external places to look. For a password manager, that auditability felt worth the extra typing.

#### Two-Layer Encryption

The crypto architecture uses two layers of key derivation, which I borrowed from reading about how commercial password managers work. When you first set up Frosk, you enter a master password. That password gets fed through Argon2id with a random salt, producing 64 bytes of key material. The first 32 bytes become a hash that's stored for authentication — I compare this later using subtle.ConstantTimeCompare to avoid timing attacks that could leak information about the password. The second 32 bytes become a key-derivation key that encrypts a completely random 32-byte user secret key. It's this user secret key, not the master password, that actually encrypts all your stored passwords using AES-256-GCM.

This two-layer design has a practical benefit that becomes obvious the first time you want to change your master password. If your passwords were encrypted directly with the master password, changing it would mean decrypting and re-encrypting every single entry in your database — potentially hundreds of passwords. With the two-layer approach, you only need to re-encrypt that 32-byte user secret key. It's fast, it's clean, and it means you can actually encourage people to rotate their master passwords without dreading the performance hit.

#### Argon2id: Memory-Hungry on Purpose

I set Argon2id to use 512 MB of memory, 3 passes, and 8 threads. These are aggressive parameters for a desktop app, and they make unlocking the vault take a second or two on modern hardware. Those parameters are intentionally expensive because they make brute-force attacks much harder. If someone gets a copy of your Frosk database and tries to guess your master password, each guess costs them 512 MB of RAM and three passes through the algorithm. On a modern GPU that could normally test billions of passwords per second, Argon2id with these settings might drop that to thousands or hundreds.

#### Building the GUI with GioUI

GioUI is an immediate-mode GUI framework, which is a very different mental model from the retained-mode frameworks most web developers are used to. In a retained-mode framework like Qt or React, you create UI components and they stick around in memory, updating automatically when state changes. In GioUI, every frame is a complete redraw. You don't create buttons and store references to them, you write a function that says "draw a button here" and that function runs X times per second. State management is entirely explicit. If you want to remember what a user typed into a text field, you store that string yourself and pass it back into the text widget on the next frame.

The entire UI for a view lives in one event loop that looks like this:

```go
for {
    switch e := window.Event().(type) {
    case app.DestroyEvent:
        return e.Err
    case app.FrameEvent: // <-- draw
        gtx := app.NewContext(ops, e)
        e.Frame(gtx.Ops)
    }
}
```

Frosk has five distinct views: initial setup for first-run master password creation, the main password list with fuzzy search, a decrypt view that prompts for your master password, a new entry form with password generation, and a deletion confirmation dialog. Each view opens its own app.Window and runs its own event loop. I handle view transitions using Go's labeled loops and `goto` statements, which I know makes some programmers uncomfortable, but for this specific case it works cleanly. Each view is just a labeled block in the event loop, and when you need to switch views, you jump to that block. It's unconventional but straightforward — you can see the entire control flow by reading the function top-to-bottom.

#### Search

The password list has fuzzy search using subsequence matching, so typing "ggl" finds "Google" even though the letters aren't contiguous. I implemented this as a simple case-insensitive character-by-character comparison that doesn't require the substring to be continuous. It's not as sophisticated as proper fuzzy search libraries, but it's instant and the implementation fits in about twenty lines of code.

#### Database, Concurrency, and Channels

The database schema is aggressively simple. Two tables: one for passwords and one for the master record. No foreign keys, no complex relationships, no migrations system — the schema is created on startup with CREATE TABLE IF NOT EXISTS and if I ever need to change it, I'll write a migration manually. For a single-user desktop app with one table that actually matters, this is fine. I use raw SQL through database/sql with no ORM because I didn't want to pull in another dependency, and honestly for these simple queries it would be overkill anyway.

The GUI stays responsive during slow operations by using Go channels for everything that might block. When you enter your master password, the decryption happens in a goroutine that sends the result back through a confirmDecryptionChan. When you save a new password, the encryption and database insert happen in a goroutine that reports success or failure through insertPasswordOperationChan. There's a refreshChan that triggers the password list to reload, and a closeLoaderChan that dismisses the loading spinner when operations complete. This pattern of "show loading state, do work in goroutine, update UI through channel" keeps the interface snappy even when Argon2id is chewing through 512 MB of memory to derive your key.

Error handling uses package-level sentinel errors like ServiceNameAlreadyTaken and MasterPasswordDoNotMatch that the backend can return and the GUI can check with errors.Is(). I wrap everything with fmt.Errorf("...: %w", err) to preserve context, and structured logging via slog, that writes JSON logs to a file in the application directory. If Frosk fails to start — say the database can't be created or the log file can't be opened — it shows a GioUI error window before exiting so you at least know what happened instead of staring at a silent crash.

#### Building and Shipping

The Makefile has four targets for building:

```
run           -> go run cmd/main.go
run_linux     -> go run --tags nowayland cmd/main.go
build         -> go build -ldflags="-s -w" -o bin/frosk cmd/main.go
build_linux   -> go build --tags nowayland -ldflags="-s -w" -o bin/frosk cmd/main.go
```

The -s -w flags strip debug symbols to reduce binary size, which gets the final executable down to around ~12mb. Dependencies are vendored with go mod vendor so builds are reproducible.

#### Why Build This?

Frosk started as a learning exercise and ended up as my daily driver password manager. It works, I understand every line of code, and I don't have to trust some company's cloud servers with my passwords. Building it taught me more about practical cryptography by forcing me to confront the uncomfortable gap between thoery and practice. The Go ecosystem made this straighforwad — between the standard library, x/crypto, and a couple of well-vetted dependencies, you can build real desktop software that handles sensitive data without pulling in a dependency tree that requires a map and compass to navigate.

If you're curious about the code, it's all on [GitHub](https://github.com/mszalewicz/frosk). And if you spot any problems, please open an issue.
