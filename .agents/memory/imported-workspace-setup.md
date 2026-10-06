---
name: Imported workspace setup
description: Tool limitations encountered when setting up this imported workspace
---

Imported artifact manifests can exist on disk while the artifact registry is empty. Validating and replacing the existing manifests registers their services without scaffolding over the imported application.

**Why:** The import retained the manifests, but initially had neither registered artifacts nor managed workflows.

**How to apply:** Check both the registry and existing manifests before creating any artifact; preserve imported packages.

The package installation callback performs a package add, not an installation of every workspace package. A successful root package add does not mean the application dependencies were linked.

**Why:** The root tools were installed while leaf workspace packages still lacked dependencies.

**How to apply:** For an imported workspace, install the full workspace from its lockfile and check leaf package availability before starting services.
