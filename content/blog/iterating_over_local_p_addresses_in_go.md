---
title: "Iterating over local IP addresses in Go"
date: 2024-11-17T09:19:47+01:00
tags: ["go", "network"]
draft: true
---

While developing an application for local network communication and file transfer, I stumbled upon a simple approach for iterating over valid IP address subsets in Go. The brilliance of this method lies in its simplicity and conciseness. If you'd like to jump straight to the code used during the preliminary design phase to establish a local network connection, it’s available [here](https://github.com/mszalewicz/workbench/blob/main/local_network_receive_send/main.go).

<!--more-->

Before we dive in, let's ensure we're on the same page about what we aim to achieve here.

```
FF    FF    FF    00

 │     │     │    │
 │     │     │    │    hexadecimal to IP notation
 │     │     │    │
 ▼     ▼     ▼    ▼

255 . 255 . 255 . 0

 │     │     │    │
 │     │     │    │    map between mask and IP address
 │     │     │    │
 ▽     ▽     ▽    ▽


192 . 168 .  1  . 0
▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬   ▲
└──────┬──────┘   └───────┐
       │                  │

network portion      host portion
```

```
address found by go: 192.168.1.24/24
```

[Classless Inter-Domain Routing](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing)

```
inet 192.168.1.24 netmask 0xffffff00 broadcast 192.168.1.255
```