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

The [native driver contract](docs/office-documents-native-plugin.md) describes the wire protocol and Excel capabilities. See [release and verification](docs/RELEASE.md) for platform packaging.
