# Changelog

All notable changes to the "Green Coder" extension will be documented in this file.

## [0.1.1] - 2025-01-27

### Fixed
- Resolved TypeScript compilation errors that prevented packaging
- Fixed missing type declarations for glob module
- Improved TypeScript configuration for better build compatibility
- Excluded UI components from main compilation to resolve JSX conflicts
- Set strict mode to false temporarily to resolve type inference issues
- **Fixed Python file analysis not automatically triggering** - Added automatic analysis on document open and active editor
- **Fixed missing green score display** - Integrated status bar with analyzer for real-time score updates
- **Fixed command registration conflicts** - Unified command naming and removed duplicate registrations

### Changed
- Updated TypeScript configuration for better module resolution
- Improved build process reliability
- Enhanced development workflow for future releases
- **Enhanced automatic analysis** - Python files now automatically trigger analysis when opened or become active
- **Improved status bar integration** - Green score now displays automatically without manual commands

### Note
- Python analyzer functionality was already fully implemented in previous versions
- This release focuses on build system fixes and **automatic analysis triggering** to enable the green score to appear

## [0.1.0] - 2025-06-07

### Added
- Comprehensive JavaScript/TypeScript analysis with 50+ checks
- Support for React patterns and anti-patterns
- New command: "Analyze Current File for Sustainability"
- Automatic analysis on file save
- Detailed output channel with issue categorization
- Support for JSX/TSX files

### Fixed
- Fixed issue with JavaScript file analysis not being triggered
- Improved error handling and user feedback
- Fixed duplicate analyzer initialization
- Better type safety throughout the codebase

### Changed
- Improved detection of inefficient data fetching patterns
- Enhanced state management analysis for React components
- Better handling of async/await patterns
- More accurate issue reporting with line and column numbers

## [0.0.1] - 2025-06-05

### Added
- Initial release of Green Coder
- Support for JavaScript/TypeScript and Python code analysis
- Real-time code analysis
- Green Score calculation
- Performance and sustainability suggestions
