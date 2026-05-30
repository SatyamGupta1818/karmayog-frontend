# FRONTEND CODING STANDARDS

# Overview

This document defines the frontend coding standards, architectural rules, folder structure practices, and business rules for the project.

The goal is to maintain:

* Clean code
* Reusable components
* Scalable architecture
* Consistent development patterns
* Maintainable frontend structure

---

# Frontend Tech Stack

* React.js
* Vite
* TypeScript
* Redux Toolkit
* RTK Query
* Tailwind CSS

---

# Folder Structure Rules

Frontend follows:

* Feature-based architecture
* Component-driven structure
* Modular scalability

Example structure:

```txt id="6xevht"
src/
├── app/
├── routes/
├── layouts/
├── pages/
├── modules/
├── components/
├── services/
├── hooks/
├── utils/
├── constants/
├── types/
├── assets/
├── styles/
└── socket/
```

---

# Component Rules

## Component Principles

* Keep components small and reusable
* Avoid large monolithic components
* One component = one responsibility
* Shared UI should go inside `/components/ui`

---

# Component Naming

Use:

```txt id="jmgrzd"
PascalCase
```

Examples:

```txt id="61o2p0"
TaskCard.jsx
ProjectTable.jsx
DashboardLayout.jsx
```

---

# File Naming Rules

## Components

```txt id="gpn6i9"
PascalCase
```

## Hooks

```txt id="vwq8ol"
camelCase
```

Examples:

```txt id="w9bpd8"
useAuth.js
useSocket.js
```

## Utility Files

```txt id="p6xkzb"
camelCase
```

---

# Page Structure Rules

Each page should:

* Handle layout composition
* Use reusable feature components
* Avoid heavy business logic

Business logic should remain:

* Inside hooks
* Redux logic
* RTK Query services
* Utility functions

---

# State Management Rules

Redux Toolkit should be used for:

* Global state
* Authentication
* User session
* Shared application state

Avoid:

* Excessive prop drilling
* Unnecessary global state

---

# RTK Query Rules

RTK Query should manage:

* API requests
* Caching
* Server state
* Loading states
* Error states

Do not:

* Write manual fetch logic repeatedly
* Duplicate API calls

---

# API Structure Rules

All API logic should remain inside:

```txt id="z7h3z8"
src/services/
```

Rules:

* Separate APIs module-wise
* Use centralized base API
* Handle auth tokens centrally
* Use interceptors/middleware properly

---

# Tailwind CSS Rules

Use:

* Utility-first classes
* Reusable UI patterns
* Consistent spacing system

Avoid:

* Inline styles
* Large custom CSS files
* Repeated Tailwind class duplication

---

# Reusable Component Rules

Reusable components should exist for:

* Buttons
* Inputs
* Tables
* Modals
* Cards
* Dropdowns
* Loaders
* Empty states

Goal:

* Maintain UI consistency
* Reduce duplicate code

---

# Routing Rules

Routes should:

* Be centralized
* Support lazy loading
* Support protected routes
* Support role-based rendering

Route configuration should remain scalable.

---

# Navigation Rules

Sidebar navigation should remain:

* Config-driven
* Centralized
* Dynamic

Navigation config should act as:

* Single source of truth

---

# Form Handling Rules

Forms should:

* Use reusable form components
* Validate properly
* Handle loading/error states
* Avoid duplicated form logic

---

# Error Handling Rules

Frontend should handle:

* API errors
* Unauthorized access
* Network failures
* Empty states
* Loading states

Never:

* Leave blank screens
* Expose raw backend errors

---

# Authentication Rules

Frontend auth system should support:

* Access token handling
* Refresh token flow
* Persistent login
* Protected routes
* Role-based rendering

---

# Real-Time Rules

WebSocket logic should:

* Remain centralized
* Handle reconnects
* Avoid duplicate listeners
* Support scalable event handling

---

# Performance Rules

Frontend should focus on:

* Lazy loading
* Code splitting
* Optimized rendering
* API caching
* Minimal re-renders

Avoid:

* Unnecessary state updates
* Deep prop drilling
* Large page components

---

# Business Rules

## Organization Rules

* A user belongs to one organization
* Organization data must remain isolated

---

## Department Rules

* Departments belong to organizations
* Employees belong to departments

---

## Project Rules

* Projects belong to organizations
* Projects can have multiple tasks
* Projects can have assigned teams

---

## Task Rules

* Tasks belong to projects
* Tasks can be assigned to employees
* Tasks have statuses
* Tasks have priorities
* Tasks support activity tracking

---

# RBAC Rules

Frontend must support:

* Super Admin
* Organization Admin
* Department Head
* Employee

UI rendering should respect:

* Permissions
* Roles
* Access control

---

# Engineering Principles

Frontend development should prioritize:

* Scalability
* Maintainability
* Reusability
* Clean architecture
* Production-grade practices

---

# Development Goal

The frontend should be:

* Enterprise-ready
* Easy to scale
* Easy to maintain
* AI-friendly
* Developer-friendly

---
