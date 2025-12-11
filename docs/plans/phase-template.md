# Phase 1: <phase name> - Implementation Plan

**Date:** <date-created>
**Last Updated:** <date-updated>
**Status:** <summary of what work has been done vs outstanding>
**Scope:** <short description of what this phase intends to do>

---

## Overview

*Short explanation of what this phase intends to do and how the phase is divided into  sequential steps*

1. **Step x: <step name>** - <details>
2. **Step y: <step name>** - <details>
3. **Step z: <step name>** - <details>

## Step x: <step name>

### Goal

*Explain goal for this step*.

### Implementation Order

#### Step x.1: <substep name>

**Prerequisites**
- *list of any Prerequisites*

*bullet point list of implementation steps*

## File Structure & Architecture

### New Files to Create

*explanation of which files to create*

### Architectural Principles
1. **Separation of data and logic** - `/data` holds definitions, `/utils` has calculations
2. **Type safety** - All game entities have strict TypeScript types
3. **Store-based state** - Zustand stores manage game state
4. **Incremental extension** - Extend existing files rather than rewrite

## Testing Strategy

### Automated Unit Tests (Required for All Utils)

Write comprehensive unit tests using Vitest. Tests must be written alongside implementation.

### Manual/Integration Tests

**After each phase implementation, manually verify:**

*list of manual verification steps*

