# Office Documents releases

GitHub Actions builds macOS arm64 and Windows x64 candidates from the same commit. Each build starts the packaged helper and checks the `driver_status` stdio response. The archives and SHA-256 sidecars are attached to the [candidate run](https://github.com/ling-stack-org/ling-plugin-office-documents/actions/workflows/release.yml).

The macOS archive contains a complete `OfficeDriver.app` with its bundle identity, signed resources and Apple Events entitlement. Windows includes the self-contained .NET 8 executable. Publish reviewed platform-signed binaries from the release environment after checking the platform signature and running the [native release gates](https://github.com/ling-stack-org/ling-stack/blob/main/docs/design/office-documents-native-plugin.md#release-gates).

Release assets use a new immutable version and carry source-commit provenance. Submit the Release URLs, sizes and SHA-256 values to the [official Ling catalog](https://github.com/ling-stack-org/ling-stack/blob/main/docs/design/plugin-independent-packaging.md).
