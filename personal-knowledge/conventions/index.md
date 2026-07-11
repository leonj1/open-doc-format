# Concepts

* [Code Structure and Patterns](code-structure.md) — How I structure code inside the project directories — I/O interfaces + Fakes (no mocks), dependency injection, no implicit fallbacks, type discipline, immutability, Result types over exceptions, functional BDD testing over technical tests, size limits, and the strict separation between routes, services, and I/O.
* [Configuration Management](configuration.md) — How I handle config files, environment variables, credentials, and required values across local, staging, and production environments.
* [Dependencies and Default Libraries](dependencies.md) — Always use latest library versions with pinned lockfiles. Vendoring for Go. Go defaults: mux and zerolog. For other languages, follow industry standards.
* [Git and Commit Conventions](git-commits.md) — Branch strategy, commit message format, and PR workflow for personal and professional projects.
* [Language Preferences](languages.md) — Which programming languages I use and the decision framework for choosing one over another.
* [Naming Conventions](naming.md) — How I name classes, functions, and files — follow the language, nouns for classes, verbs for functions, specificity scales with depth.
* [Project Structure](project-structure.md) — Standard backend layout with production source and test code kept in dedicated, separate src/ and tests/ directories.
* [README 30-3 Rule](readme-30-3.md) — Every project README must convey what the project is in 30 seconds and how to get it running in 3 minutes.
