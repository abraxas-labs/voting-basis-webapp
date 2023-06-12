# ✨ Changelog (`v1.40.2`)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version Info

```text
This version -------- v1.40.2
Previous version ---- 
Initial version ----- v1.23.0
Total commits ------- 4
```

## [v1.40.2] - 2023-06-09

### 🔄 Changed

- show list unions on lists

## [v1.40.1] - 2023-05-02

### 🔄 Changed

- update cd-templates to resolve blocking deploy-trigger

## [v1.40.0] - 2023-05-01

### 🔄 Changed

- canton settings add electoral register settings

## [v1.39.3] - 2023-05-01

### 🆕 Added

- Added domain of influence sap customer order number

## [v1.39.2] - 2023-03-01

### 🔄 Changed

- wrap buttons for proportional election lists

## [v1.39.1] - 2023-02-15

### 🔄 Changed

- proportional election list union main list popup min width

## [v1.39.0] - 2023-02-13

### 🆕 Added

- List union main list selection: show list order number and description

## [v1.38.1] - 2023-02-07

### 🔄 Changed

- prevent loop of selection/deselection of contest import files

## [v1.38.0] - 2023-02-01

### 🔄 Changed

- Domain of influence BFS is required and needs to be unique if the domain of influence is of type MU

## [v1.37.3] - 2023-01-30

### 🔄 Changed

- add missing checkbox label

## [v1.37.2] - 2023-01-27

### 🔄 Changed

- add time component for contest fields

## [v1.37.1] - 2023-01-20

### 🔄 Changed

- use theme logo from library

## [v1.37.0] - 2023-01-20

### 🔄 Changed

- change app title depending on theme

## [v1.36.0] - 2023-01-20

### 🔄 Changed

- cache last used theme

## [v1.35.3] - 2023-01-19

### 🔄 Changed

- election candidate locality and origin is allowed to be empty for communal political businesses

## [v1.35.2] - 2023-01-11

### 🔄 Changed

- update base-components library

## [v1.35.1] - 2023-01-05

### ❌ Removed

- remove internal description, invalid votes and individual empty ballots allowed from elections

## [v1.35.0] - 2022-12-21

### 🔄 Changed

- add export provider

## [v1.34.3] - 2022-12-19

### 🔄 Changed

- add optional text for formfield default options

## [v1.34.2] - 2022-12-16

### 🆕 Added

- add domain of influence canton

## [v1.34.1] - 2022-12-13

### 🔄 Changed

- changed path to logo for whitelabeling

## [v1.34.0] - 2022-12-12

### 🆕 Added

- add white labeling logo for customers

## [v1.33.0] - 2022-12-05

### 🔄 Changed

- reorder candidates

### 🆕 Added

- add candidate origin

## [v1.32.2] - 2022-11-30

### 🔄 Changed

- proportional election candidate party selection

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

### 🆕 Added

- gzip on
- outdated error page

### 🔄 Changed

- adapted authentication module type to match used iam lib

### 🆕 Added

- config.js: definitions of window env-handler (replacement ngssc)

### ❌ Removed

- ngssc-library

### 🔒 Security

- The default NGINX listen port is now 8080 instead of 80
- nginx:1.19-alpine image changed to nginxinc/nginx-unprivileged:1.20-alpine

### 🆕 Added

- add domain of influence external printing center eai message type

### 🔄 Changed

- secondary majority election module routing fixed

### 🔄 Changed

- revert angular 9 update changes

### 🆕 Added

- added voting documents e-voting message type to canton settings

### 🔄 Changed

- reverted angular 9 update and add workaround for entry components

### 🔄 Changed

- moved files into feature modules

### 🔄 Changed

- extend evoting date with time

### 🆕 Added

- tif support for domain of influence logos

just a temporary fix. will be solved later by migrating to new base components

just a temporary fix. will be solved later by migrating to new base components

just a temporary fix. will be solved later by migrating to new base components

fix: package lock old version

Also allow users to view politicial business in readonly mode when testing phase ended

also removed count of candidates check

use location.go for refreshing the route again. also set the mat-stepper indicator type to number again

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
