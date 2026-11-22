# Office Documents releases

GitHub Actions builds macOS arm64 and Windows x64 candidates from the same commit. Each build starts the packaged helper and checks the `driver_status` stdio response. The archives and SHA-256 sidecars are attached to the [candidate run](https://github.com/ling-stack-org/ling-plugin-office-documents/actions/workflows/release.yml).

The macOS archive contains a complete `OfficeDriver.app` with its bundle identity, signed resources and Apple Events entitlement. Windows includes the self-contained .NET 8 executable. Publish reviewed platform-signed binaries from the release environment after checking the platform signature and running the native release gates. [Native release gates](office-documents-native-plugin.md#release-gates)

After signing the native item in `dist/office-driver`, set `LING_PLUGIN_RELEASE_TAG` to the matching stable tag and run `node scripts/stage-runtime.mjs darwin arm64` or `node scripts/stage-runtime.mjs win32 x64` on the corresponding target. The staging step preserves the signed bytes and checks the release identity against `LING_PLUGIN_DARWIN_TEAM_ID` on macOS or `LING_PLUGIN_WINDOWS_SIGNER_SHA256` on Windows.

Upload the archives and SHA-256 sidecars from `dist/packages` under the new immutable tag. The archives carry source-commit provenance. Submit the tag, source commit and platform archive digests to the [official Ling catalog](https://github.com/ling-stack-org/ling-stack/blob/main/docs/design/plugin-independent-packaging.md).
