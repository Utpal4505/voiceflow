# VoiceFlow Development & Agent Guidelines

## 1. Branching & Git Workflow Rules (MANDATORY)
- **NEVER work directly on `main`**: All new features, enhancements, prototypes, bugfixes, refactoring, and experimental code must be created and developed on a dedicated feature branch (e.g. `feature-<name>`, `feat-<name>`, `fix-<name>`).
- **`main` Branch Protection**: The `main` branch is strictly reserved for production-ready, thoroughly verified code and automated GitHub Actions release builds.
- **Branch Lifecycle**:
  1. Always verify the current branch before starting work (`git status`, `git branch`).
  2. Create a feature branch before modifying or creating code.
  3. Verify all builds and tests pass (`cargo check`, `pnpm --filter @voiceflow/desktop build`, `pnpm --filter @voiceflow/api build`).
  4. Commit feature work with descriptive semantic commit messages (`feat: ...`, `fix: ...`, `refactor: ...`).

## 2. Platform Architecture Constraints
- **Ultra-Light Base Footprint**: Keep the base installer ultra-light (~34 MB). Do NOT bundle heavy AI weight files directly into the installer. Any large models belong in the downloadable Model Manager.
- **Cross-Platform Parity**: Windows 10/11 (MSVC) and macOS Apple Silicon (ARM64 Metal) must always maintain parity and compile without errors.
- **macOS Windowing Rules**: Avoid `Cmd+Space` (reserved by Spotlight/Siri). Never call `.hwnd()` on non-Windows platforms.
- **Hands-Free Wake Word**: Must run 100% offline with VAD silence gating to ensure near-zero idle CPU consumption.
