# Ling Office Documents Plugin

This repository owns the macOS arm64 Apple Events helper and the Windows x64 self-contained Excel COM helper for Ling Desktop. The native protocol is `ling.office.driver.v1`.

The package is built and released independently. Ling verifies the signed catalog, artifact digest, member checksums, manifest identity and platform before enabling the helper. Runtime permissions remain owned by Ling Desktop and the operating system.

## Local build

```sh
pnpm install --frozen-lockfile
pnpm package:mac
# or
pnpm package:win
```

The Windows helper requires the .NET 8 SDK. The macOS helper requires Xcode command-line tools.

The product contract and release gates are in [docs/office-documents-native-plugin.md](docs/office-documents-native-plugin.md).
