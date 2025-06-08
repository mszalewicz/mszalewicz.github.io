---
title: "Iterating over local IP addresses in Go"
date: 2025-01-15T00:00:00+01:00
tags: ["Go", "Network"]
draft: false
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

		if strings.HasPrefix(thisMachineIP.String(), "192.168") {
		    ...
		}
	}
}
```

## CIDR and subnet mask

If you're already famililar with concepts, jumpt to [next section](#code_continued)

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

Great, now we know two ways to write a subnet mask, but what does it actually mean? Network bit masking is a method to divide an IP address into two parts: the network portion and the device (host) portion. A subnet mask, such as `ffffff00` in hexadecimal, represents a binary pattern of `11111111.11111111.11111111.00000000` in bits. This means the first 24 bits are reserved for identifying the network, while the remaining 8 bits are for individual devices within that network. To visualise:

```
        FF    FF     FF    00

         │    │       │    │
     ┌───┘    │       │    └───┐
     │        │       │        │        hexadecimal to binary
     │        │       │        │
     ▼        ▼       ▼        ▼

 11111111.11111111.11111111.00000000

     │         │     │         │
     │         │     │         │        binary to IP notation
     │         │     │         │
     └───┐     │     │    ┌────┘
         ▼     ▼     ▼    ▼

        255 . 255 . 255 . 0

         │     │     │    │
         │     │     │    │             map between mask and IP address
         │     │     │    │
         ▽     ▽     ▽    ▽


        192 . 168 .  1  . 1
        ▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬   ▲
        └──────┬──────┘   └───────┐
               │                  │

        network portion      host portion

```

## Code continued {#code_continued}

Now that we understand masking, we can implement the search for candidate entries to check if they are instances of our application within the local network. Below is the final version of the code, with `highlighted` parts showing the changes made from the previous version. In brief, we create a goroutine for each valid address within the range defined by the subnet mask. Each goroutine attempts to establish a TCP connection on port `44444`. This port was chosen to avoid conflicts with known reserved ports, but it might be changed in the final version of the application. If a valid connection is established, we print the candidate network address for further verification.

We’ll discuss the most interesting part below.

```go {linenos=table,hl_lines=["25-27", "30-45","50-57"]}
func findAddresses() {
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

			var wg sync.WaitGroup
			targetPort := "44444"
			timeout := 500 * time.Millisecond

			if strings.HasPrefix(thisMachineIP.String(), "192.168") {
				for ip := thisMachineIP.Mask(ipNet.Mask); ipNet.Contains(ip); incrementIP(ip) {
					wg.Add(1)

					go func(ip string) {
						defer wg.Done()

						conn, err := net.DialTimeout("tcp", address, timeout)

						if err == nil {
							fmt.Printf("Server candidate found at %s\n", address)
							conn.Close()
						}
					}(ip.String())
				}
				wg.Wait()
			}
		}
	}
}

func incrementIP(ip net.IP) {
	for pos := len(ip) - 1; pos >= 0; pos-- {
		ip[pos]++
		if ip[pos] > 0 {
			break
		}
	}
}
```

We are focusing on how the iteration over a given address space is performed. The initialization statement for our loop is `ip := thisMachineIP.Mask(ipNet.Mask)`. This calculates the **network identifier** for the given address and subnet mask. For example, in the network `192.168.1.1/16`, the result would be `192.168.0.0`.

```go
for ip := thisMachineIP.Mask(ipNet.Mask); ipNet.Contains(ip); incrementIP(ip) {
		...
}
```

The loop condition, `ipNet.Contains(ip)`, ensures that the loop continues as long as the current IP address is within the range of valid addresses in the target network.

The final part is the loop statement, executed after each iteration. The `incrementIP(ip)` function increments the bytes of the IP address, starting from the last byte. A key concept here is that when a byte reaches its maximum value of **255**, incrementing it by **1** causes it to wrap around to **0**. For example, if the last byte is `255`, it becomes `0` upon incrementing.

This wrapping mechanism, combined with the condition `if ip[pos] > 0 {break}`, creates a natural progression through the address space.

```go
func incrementIP(ip net.IP) {
	for pos := len(ip) - 1; pos >= 0; pos-- {
		ip[pos]++
		if ip[pos] > 0 {
			break
		}
	}
}
```

Let's illustrate this with an example. Initial condition results in:

```
192.168.0.0
```

Then incrementIP(), adds 1 to last byte of address:

```
192.168.0.0
192.168.0.1
192.168.0.2
...
192.168.0.253
192.168.0.254
192.168.0.255
```

The next call to incrementIP() will reset the last byte to 0. However, since the condition `if ip[pos] > 0 {break}` is no longer satisfied (the byte is 0), the loop `for pos := len(ip) - 1; pos >= 0; pos-- {}` continues. In this case, last byte will stay as 0 and the increment will modify the second-to-last byte.

```
192.168.0.0
192.168.0.1
192.168.0.2
...
192.168.0.253
192.168.0.254
192.168.0.255
192.168.1.0
```

The process will continue until it reaches `192.168.255.255`, as the next value falls outside the scope of our example network. As you can see, the entire process of iterating through the given address space is achieved in a concise and self-describing manner. This approach efficiently handles address progression without requiring complex logic. The simplicity and clarity of the method make it easy to understand and implement in context involving IP address manipulation.

## Footnotes

- In the code, I spawn a new goroutine for each address that needs to be checked. It’s important to note that this approach can put a strain on your system resources. For a typical local network, there are up to 254 addresses to check, meaning the same number of goroutines may be created in the worst-case scenario. This is manageable. However, since each goroutine waits for a TCP response, their lifecycle is extended, which can create bottlenecks. During testing with a larger network like `192.168.0.0/16`, the program ran into crashes. In this case, theoretically as many as 65,534 goroutines could be created. A more efficient strategy would involve using a goroutine pool, where goroutines are recycled as tasks are completed. For simplicity and to keep the focus on the program's core logic, I decided not to implement a goroutine pool in this example.




