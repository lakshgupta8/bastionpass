# BastionPass

BastionPass is a frontend-only password generator and local management utility built with React, TypeScript, and Tailwind CSS. It is designed to combine programmatic string randomization with offline storage mechanics and mathematical strength verification.

## Architecture & Core Features

* **Configurable Generation Engine**: Generates cryptographically secure strings by enforcing guaranteed selections across user-toggled character boundaries (uppercase, lowercase, numeric, and symbolic sets) paired with internal array shuffling.
* **Information Entropy Evaluation**: Computes real-world password resilience using the Shannon entropy formula based on string length and effective active pool sizes. It automatically applies score penalties for predictable inputs (such as consecutive repetitive character strings) to output realistic cracking estimates.
* **Dual Storage Strategy**: Synchronizes runtime application preferences (generator parameters) using document cookies via `js-cookie` to persist user workflows across browsing sessions. Password entries attached to customizable service tags are preserved securely offline within browser `localStorage`.
* **Clipboard Lifecycle**: Incorporates streamlined clipboard writing operations (`navigator.clipboard.writeText`) coupled with managed local timeout states to deliver clear micro-interaction feedback.

## Key Learnings & Engineering Takeaways

Building this project reinforced several fundamental web application concepts:

1. **Applied Security Metrics**: Transitioning from rudimentary string length criteria to mathematical entropy modeling provided a deeper understanding of real-world cryptographic resistance and automated brute-force threat vectors.
2. **Storage Separation**: Managing application boundaries clarified the respective utility of client storage layers—leveraging lightweight cookies for quick parameter restoration versus robust web storage APIs for uncompressed record persistence.
3. **Controlled Form State**: Integrating `react-hook-form` with standard state variables demonstrated efficient strategies for maintaining strict state synchronicity across dynamic form sliders, interactive toggle matrices, and side-effect listeners.
4. **CSS Token Design**: Configuring modern CSS primitives and inline custom styling rules within Tailwind CSS allowed for the creation of unified visual indicators, fluid background layers, and structured layouts without polluting layout markup.
