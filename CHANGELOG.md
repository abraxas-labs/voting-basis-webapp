# ✨ Changelog (`v1.32.1`)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version Info

```text
This version -------- v1.32.1
Previous version ---- v1.23.0
Initial version ----- v1.23.0
Total commits ------- 38
```

## [v1.32.1] - 2022-11-28

### 🔄 Changed

- restrict logo upload to PNG and SVG

## [v1.32.0] - 2022-11-28

### 🔄 Changed

- set authority name for domain of influence

## [v1.31.0] - 2022-11-16

### 🔒 Security

- configure client refresh token flow (rfc-6749)

## [v1.30.0] - 2022-10-10

### 🆕 Added

- Name for protocol for domain of influence and counting circle
- Sortnumber for counting circle
- Protocol sort types for domain of influence and counting circle

## [v1.29.2] - 2022-10-04

### 🔄 Changed

- Updated voting-library to fix layouting issues

## [v1.29.1] - 2022-09-27

### 🔒 Security

- disable style inline optimization to allow a more restictive CPS eleminating script-src unsafe-inline

## [v1.29.0] - 2022-09-13

### 🆕 Added

- added review procedure and enforce for counting circle property for vote, majority election and proportional election

## [v1.28.2] - 2022-09-06

### 🔄 Changed

- included theme in header bar link

## [v1.28.1] - 2022-09-06

### 🔄 Changed

- optimise white labling to not overwrite the base components styles

## [v1.28.0] - 2022-09-01

### 🆕 Added

- Added white labling option

## [v1.27.8] - 2022-08-30

### 🔄 Changed

- Allow political business number modification on all political businesses after testing phase has ended

## [v1.27.7] - 2022-08-25

### 🔄 Changed

- Refactor and clean up code smells

## [v1.27.6] - 2022-08-23

### 🔄 Changed

- update vulnerable dependencies

## [v1.27.5] - 2022-08-18

### ❌ Removed

- TenantGuard, tenant is no longer in the URL

### 🔒 Security

- Changed auth flow to PKCE
- Use "Fragment" response mode
- Update dependencies

## [v1.27.4] - 2022-08-17

### 🔄 Changed

- Made political businesses only clickable/viewable for authorized users

## [v1.27.3] - 2022-08-15

### 🆕 Added

- Events to notify political businesses and political business unions about a contest merge

## [v1.27.2] - 2022-08-02

### 🔄 Changed

- contest list columns fixed

## [v1.27.1] - 2022-07-29

### 🔄 Changed

- update base components bugfixes

## [v1.27.0] - 2022-07-25

### 🔄 Changed

- update base components

## [v1.26.1] - 2022-07-18

### 🆕 Added

- gzip on
- outdated error page

### 🔄 Changed

- adapted authentication module type to match used iam lib

## [v1.26.0] - 2022-07-17

### 🆕 Added

- config.js: definitions of window env-handler (replacement ngssc)

### ❌ Removed

- ngssc-library

### 🔒 Security

- The default NGINX listen port is now 8080 instead of 80
- nginx:1.19-alpine image changed to nginxinc/nginx-unprivileged:1.20-alpine

## [v1.25.0] - 2022-07-15

### 🆕 Added

- add domain of influence external printing center eai message type

## [v1.24.2] - 2022-07-12

### 🔄 Changed

- secondary majority election module routing fixed

## [v1.24.1] - 2022-07-08

### 🔄 Changed

- revert angular 9 update changes

## [v1.24.0] - 2022-07-06

### 🆕 Added

- added voting documents e-voting message type to canton settings

## [v1.23.4] - 2022-07-04

### 🔄 Changed

- reverted angular 9 update and add workaround for entry components

## [v1.23.3] - 2022-06-29

### 🔄 Changed

- moved files into feature modules

## [v1.23.2] - 2022-05-25

### 🔄 Changed

- extend evoting date with time

## [v1.23.1] - 2022-05-23

### 🆕 Added

- tif support for domain of influence logos

## [v1.23.0] - 2022-05-09

### 🎉 Initial release for Bug Bounty
