---
title: "Iterating over local IP addresses in Go"
date: 2024-11-17T09:19:47+01:00
tags: ["go", "network"]
draft: true
---

While developing an application for local network communication and file transfer, I stumbled upon a simple approach for iterating over valid IP address subsets in Go. The brilliance of this method lies in its simplicity and conciseness. If you'd like to jump straight to the code used during the preliminary design phase to establish a local network connection, it’s available [here](https://github.com/mszalewicz/workbench/blob/main/local_network_receive_send/main.go).

<!--more-->

We aim to iterate over valid local IP addresses to identify potential instances of our application. For each candidate, we will attempt to establish a "handshake" using our own protocol. Specifically, interactions between application instances will occur over TCP, which guarantees that the order of data chunks sent between peers is managed by the Transmission Control Protocol. This will simplify our approach as we won't need to handle data ordering manually. Building on this foundation, we will design our own messaging scheme.

To achieve our objectives, we first need to discover candidate devices. We'll use Go’s net package to:

- Iterate over the network interfaces of the host machine.
- Identify the IP addresses assigned to each interface.
- Ensure that the local network address is assigned to at least one interface (i.e., confirm the machine is connected to the local network via Ethernet or Wi-Fi).
- Search for potential application instances on the local network.
- Establish a connection to confirm the receiver is a valid instance.

Currently, most routers use the **192.168.1.0/24** subnet for local networks. This raises a valid question: Why check all interfaces and manually iterate over usable addresses? Why not simplify the process by scanning the 254 possible addresses (excluding **192.168.1.0** as the network identifier and **192.168.1.255** as the broadcast address)? There are two reasons for this approach:

1. To gain experience and build tools for situations where the address space is unknown ahead of time.
2. To make the process adaptable for future support of IPv6 (i.e. fe80::/64).

## Building logic in Go

First, we need to identify the network interfaces available on the machine. We retrieve a list of interfaces that represent the various network adapters present, such as Ethernet or Wi-Fi:

```go
interfaces, err := net.Interfaces()

if err != nil {
	log.Fatal(err)
}
```

Next, we iterate through the collection of interfaces to examine the IP addresses assigned to each one. This step helps us determine the addresses that are bound to the host machine:

```go
interfaces, err := net.Interfaces()

if err != nil {
	log.Fatal(err)
}

for _, intrface := range interfaces {
	addresses, err := intrface.Addrs()

	if err != nil {
		log.Fatal(err)
	}
}
```

While processing `addresses`, we are:
1. **parsing the CIDR Format**: Each address is analyzed in CIDR (Classless Inter-Domain Routing) notation. We will explain what CIDR is in the next non-code paragraph.
2. **checking for IPv4**: For now, we focus solely on IPv4 addresses, as these are the ones relevant to our goal.
3. **filtering for "192.168"**: We specifically look for addresses in the `192.168.x.x` range, which is part of the IPv4 space reserved for small local networks. For more details, refer to [RFC 1918](https://datatracker.ietf.org/doc/html/rfc1918).

```go
interfaces, err := net.Interfaces()

if err != nil {
	log.Fatal(err)
}

for _, intrface := range interfaces {
	addresses, err := intrface.Addrs()

	if err != nil {
		log.Fatal(err)
	}

	for _, address := range addresses {

		thisMachineIP, ipNet, err := net.ParseCIDR(address.String())
		if err != nil {
			log.Fatal(err)
		}

		if thisMachineIP.To4() == nil {
			continue
		}

		if strings.Contains(thisMachineIP.String(), "192.168") {
		    ...
		}
	}
}
```

[CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing) is a simple notation used to represent an IP address along with its associated subnet mask. The format is `x.x.x.x/y`, where the `x.x.x.x` represents the IP address and `y` indicates the subnet mask's length in bits. For instance, `192.168.1.0/24` means the IP address is masked using the first 24 bits of the address. We'll explore the practical implications of this shortly.

It’s important to understand that CIDR is simply a way to **describe** the combination of an IP address and its subnet mask. The same information can also be expressed in other forms, such as an IP address paired with a hexadecimal representation of the subnet mask.

When inspecting the interfaces on a host machine using commands like `ifconfig` (macOS), `ip addr` (Linux), or `ipconfig` (Windows), you might encounter output similar to this:

```
...

inet 192.168.1.24 netmask 0xffffff00 broadcast 192.168.1.255

...
```

This specific example is what I retrieved from my own machine. Here, the **24** in the `192.168.1.24` address indicates that the interface was assigned this unique address by the local router. On another machine, you might see a different value for the last part of the IP address. Last part of the IP address is stored in 1 byte, it can range between **1** and **254** (the first and last values in the range are reserved, so the total is not 256). The specific value assigned depends on the router and the network configuration. It's important to note that this IP address is **unique** to your machine within the local network.

Important detail in the `ifconfig` output above is the subnet mask represented as a hexadecimal number. In the example, the subnet mask is shown as `0xffffff00`.

To explain briefly, hexadecimal numbers use two characters to represent each byte of information. Breaking down `0xffffff00` into four parts gives `[ff] [ff] [ff] [00]`. Each `ff` corresponds to 8 bits (since `ff` in hex equals 255 in decimal, which is 8 ones in binary), and `00` corresponds to 0 bits. Adding these together gives a total of 24 bits, aligning with the /24 in CIDR notation.

```
192.168.1.24/24 is equivalent to 192.168.1.24 0xffffff00
```



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


```
address: 192.168.1.24/24 | ip: 192.168.1.24 | mask: ffffff00
```