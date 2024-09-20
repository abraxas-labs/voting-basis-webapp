# ✨ Changelog (`v3.20.1`)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version Info

```text
This version -------- v3.20.1
Previous version ---- v3.6.0
Initial version ----- v1.23.0
Total commits ------- 44
```

## [v3.20.1] - 2024-09-11

### 🔄 Changed

- move federal identification to ballot question

## [v3.20.0] - 2024-09-06

### 🆕 Added

- add federal identification

## [v3.19.4] - 2024-09-04

### 🔄 Changed

- migrate from gcr to harbor

## [v3.19.3] - 2024-09-04

### 🔄 Changed

- reset internal plausibilisation

## [v3.19.2] - 2024-09-04

### 🔄 Changed

- adjust with from tableheader
- includes voting-angular-library update to 5.1.2

## [v3.19.1] - 2024-08-28

### :arrows_counterclockwise: Changed

- improve warning when creating secondary election with existing ballot groups

## [v3.19.0] - 2024-08-28

### 🆕 Added

- optional individual candidates on majority elections

### 🔄 Changed

- proportional election list change listener

## [v3.18.1] - 2024-08-28

🔄 Changed

update bug bounty template reference
patch ci-cd template version, align with new defaults

## [v3.18.0] - 2024-08-22

### 🆕 Added

- add counting circle and proportional election list change listener

## [v3.17.4] - 2024-08-21

### 🔄 Changed

- enforce final results for standard ballot

## [v3.17.3] - 2024-08-15

### 🔄 Changed

- delete candidate throws if candidate is in a ballot group

## [v3.17.2] - 2024-08-15

### :arrows_counterclockwise: Changed

- show ballot question id and allow different count of tie break questions

## [v3.17.1] - 2024-08-14

### 🔄 Changed

- proportional election union main list optional

## [v3.17.0] - 2024-08-14

### :arrows_counterclockwise: Changed

- improve domain of influence search

## [v3.16.1] - 2024-08-14

### 🔄 Changed

- use current date as default on counting circle e-voting

## [v3.16.0] - 2024-08-13

### 🆕 Added

- add party to proportional election list

## [v3.15.4] - 2024-08-12

### 🔄 Changed

- deprecated sex type undefined

## [v3.15.3] - 2024-08-07

### :arrows_counterclockwise: Changed

- show political business sub types for votes

## [v3.15.2] - 2024-08-06

### 🔄 Changed

- creating counting circles with only valid cantons

## [v3.15.1] - 2024-08-06

### :x: Removed

- remove canton settings update same tenant permission

## [v3.15.0] - 2024-07-31

### :arrows_counterclockwise: Changed

- only display vote questions in e-voting contests

## [v3.14.0] - 2024-07-29

### :new: Added

- added variant questions on multiple ballots

## [v3.13.0] - 2024-07-26

### 🔄 Changed

- Make DOI short name optional
- Increase max length of DOI/counting circle code to 20 from 12

## [v3.12.0] - 2024-07-19

### 🆕 Added

- canton settings with publish results before audited tentatively

## [v3.11.0] - 2024-07-16

### 🔄 Changed

- set counting circle e-voting at a specific date

## [v3.10.2] - 2024-07-15

### 🔄 Changed

- index.html set default language to german and disable google translation

## [v3.10.1] - 2024-07-11

### :arrows_counterclockwise: Changed

- update dependencies and use esbuild

## [v3.10.0] - 2024-07-04

### 🔄 Changed

- change enable title

### 🆕 Added

- create secondary election in context menu

## [v3.9.2] - 2024-07-03

### 🔄 Changed

- fix contest is created twice in the contest list

## [v3.9.1] - 2024-07-03

### 🔄 Changed

- add and edit contest updates

## [v3.9.0] - 2024-06-27

### 🆕 Added

- add internal plausibilisation canton settings

## [v3.8.1] - 2024-06-26

### 🔄 Changed

- create contest updates values correctly

## [v3.8.0] - 2024-06-25

### 🆕 Added

- add create contest on highest hierarchical level canton settings

## [v3.7.1] - 2024-06-25

### 🔄 Changed

- unsaved changes dialog in political business edit

## [v3.7.0] - 2024-06-21

### 🆕 Added

- add political business finalize canton settings

## [v3.6.6] - 2024-06-19

### 🔄 Changed

- move truncate long table header to voting lib

## [v3.6.5] - 2024-06-12

### 🔄 Changed

- adjust counting circle detail layout

## [v3.6.4] - 2024-06-06

### :arrows_counterclockwise: Changed

- update voting lib to fix outdated access tokens on server streaming retries

## [v3.6.3] - 2024-06-05

### :arrows_counterclockwise: Changed

- allow to clear voting card color

## [v3.6.2] - 2024-06-04

### 🔄 Changed

- keep navigation activated state after navigation cancel

## [v3.6.1] - 2024-06-04

### 🔄 Changed

- stick button bar to the bottom

## [v3.6.0] - 2024-05-29

### 🆕 Added

- add publish results enabled canton setting

## [v3.5.4] - 2024-05-27

### 🔄 Changed

- change plausibilisiert state color

## [v3.5.3] - 2024-05-27

### 🔄 Changed

- app loading spinner

## [v3.5.2] - 2024-05-22

### 🔄 Changed

- more space between dropdown and label
- checkbox text is now inline

## [v3.5.1] - 2024-05-22

### 🔄 Changed

- angular update UI optimizations

## [v3.5.0] - 2024-05-22

### 🆕 Added

- add ballot question type

### 🆕 Added

- add counting circle table sort and filter

### 🔄 Changed

- app loading spinner

### 🆕 Added

- update mandate algorithm for proportional elections in unions

### 🔄 Changed

- move Stimmregister flag from canton settings to DOI

### 🔄 Changed

- only root domain of influences should be visible on contest creation

### :arrows_counterclockwise: Changed

- bugfixes for contest and political business list

### :new: Added

- add sorting and filterting to political business list

### :new: Added

- check for unique political business number

BREAKING CHANGE: update to Angular 17 version

### 🔄 Changed

- Angular Update to version 17

### 🆕 Added

- add state plausibilised disabled canton setting

### 🆕 Added

- add counting circle result state descriptions

### :new: Added

- added voting card color to domain of influence

### :arrows_counterclockwise: Changed

- users may not be able to create, edit or delete contests

- add evoting counting circle

- added view partial counting circle results flag to domain of influence

### 🔄 Changed

- adjust domain of influence overview overflow height

### 🆕 Added

- add couting circle table overflow

- add unsaved changes guard and unload host listener

### 🔄 Changed

- ux improvements

### 🆕 Added

- add evoting counting circle

### 🆕 Added

- add virtual top level domain of influence

### 🆕 Added

- add vote result algorithm popular and counting circle majority

### 🆕 Added

- add political assembly

### :new: Added

- added permissions for canton admin

### :new: Added

- added canton to counting circle

### 🔄 Changed

- Standardized proportional election mandate algorithms in unions

### 🆕 Added

- Double proportional election mandate algorithms

### 🔄 Changed

- update voting-lib to v2.6.3

### 🆕 Added

- Add counting circle electorate

### 🆕 Added

- add candidate check digit

### :lock: Security

- change from roles to permissions

### 🆕 Added

- add new zh features flag

### 🆕 Added

- Add counting machine flag to canton settings

### 🆕 Added

- add multiple vote ballots

### :arrows_counterclockwise: Changed

- apply strict policy for files that should not be cached

### :arrows_counterclockwise: Changed

- configure caching for statically named resource config.js
- set version tag for referenced config.js in index.html to enforce initial client-side cache invalidation

### :new: Added

- add support for custom oauth scopes.

### :new: Added

- add environment indicator badge in header

### :arrows_counterclockwise: Changed

- setup automatic refresh to only listen for the access_token lifetime since the IdP only responds with the access_token

### 🔄 Changed

- political first name of candidate from simple text to complex text

### 🔄 Changed

- display list and order number for created lists correctly

### ❌ Removed

- remove swiss post order number

### 🆕 Added

- party import mappings for proportional election candidates

### ❌ Removed

- revert commit 6c24fa62023da2dbd9473ee23f438faab4878903

BREAKING CHANGE: update to Angular 14 version

### 🔄 Changed

- Angular 14 Update

### 🆕 Added

- add swiss post data

### 🆕 Added

- Add domain of influence voting card shipping choice

### 🔄 Changed

- end of testing phase time component disabled if testing phase ended

### 🔄 Changed

- disable candidate move buttons during reordering

### 🔄 Changed

- show list unions on lists

### 🔄 Changed

- update cd-templates to resolve blocking deploy-trigger

### 🔄 Changed

- canton settings add electoral register settings

### 🆕 Added

- Added domain of influence sap customer order number

### 🔄 Changed

- wrap buttons for proportional election lists

### 🆕 Added

- List union main list selection: show list order number and description

### 🔄 Changed

- prevent loop of selection/deselection of contest import files

### 🔄 Changed

- Domain of influence BFS is required and needs to be unique if the domain of influence is of type MU

### 🔄 Changed

- update base-components library

### ❌ Removed

- remove internal description, invalid votes and individual empty ballots allowed from elections

### 🔄 Changed

- add optional text for formfield default options

### 🆕 Added

- add domain of influence canton

### 🔄 Changed

- changed path to logo for whitelabeling

### 🆕 Added

- add white labeling logo for customers

### 🔄 Changed

- reorder candidates

### 🆕 Added

- add candidate origin

### 🔄 Changed

- proportional election candidate party selection

### 🔄 Changed

- set authority name for domain of influence

### 🔒 Security

- configure client refresh token flow (rfc-6749)

### 🆕 Added

- Name for protocol for domain of influence and counting circle
- Sortnumber for counting circle
- Protocol sort types for domain of influence and counting circle

### 🔄 Changed

- Updated voting-library to fix layouting issues

### 🔒 Security

- disable style inline optimization to allow a more restictive CPS eleminating script-src unsafe-inline

### 🆕 Added

- added review procedure and enforce for counting circle property for vote, majority election and proportional election

### 🔄 Changed

- included theme in header bar link

### 🔄 Changed

- optimise white labling to not overwrite the base components styles

### 🆕 Added

- Added white labling option

### 🔄 Changed

- Allow political business number modification on all political businesses after testing phase has ended

### 🔄 Changed

- Refactor and clean up code smells

### ❌ Removed

- TenantGuard, tenant is no longer in the URL

### 🔒 Security

- Changed auth flow to PKCE
- Use "Fragment" response mode
- Update dependencies

### 🔄 Changed

- Made political businesses only clickable/viewable for authorized users

### 🆕 Added

- Events to notify political businesses and political business unions about a contest merge

### 🔄 Changed

- contest list columns fixed

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

## [v3.4.0] - 2024-05-21

### 🆕 Added

- add counting circle table sort and filter

## [v3.3.1] - 2024-05-13

### 🔄 Changed

- app loading spinner

## [v3.3.0] - 2024-05-07

### 🆕 Added

- update mandate algorithm for proportional elections in unions

## [v3.2.0] - 2024-05-04

### 🔄 Changed

- move Stimmregister flag from canton settings to DOI

## [v3.1.4] - 2024-04-25

### 🔄 Changed

- only root domain of influences should be visible on contest creation

## [v3.1.3] - 2024-04-24

### :arrows_counterclockwise: Changed

- bugfixes for contest and political business list

## [v3.1.2] - 2024-04-24

### :new: Added

- add sorting and filterting to political business list

## [v3.1.1] - 2024-04-24

### 🔄 Changed

- add sorting and filtering to contest list

## [v3.1.0] - 2024-04-24

### :new: Added

- check for unique political business number

## [v3.0.0] - 2024-04-19

BREAKING CHANGE: update to Angular 17 version

### 🔄 Changed

- Angular Update to version 17

## [v2.16.0] - 2024-04-19

### 🆕 Added

- add state plausibilised disabled canton setting

## [v2.15.0] - 2024-04-18

### 🆕 Added

- add counting circle result state descriptions

## [v2.14.0] - 2024-04-17

### :new: Added

- added voting card color to domain of influence

## [v2.13.0] - 2024-04-15

### :arrows_counterclockwise: Changed

- users may not be able to create, edit or delete contests

- add evoting counting circle

- added view partial counting circle results flag to domain of influence

### 🔄 Changed

- adjust domain of influence overview overflow height

### 🆕 Added

- add couting circle table overflow

- add unsaved changes guard and unload host listener

### 🔄 Changed

- ux improvements

## [v2.12.0] - 2024-04-08

### 🆕 Added

- add evoting counting circle

## [v2.11.0] - 2024-03-14

### 🆕 Added

- add virtual top level domain of influence

### 🆕 Added

- add vote result algorithm popular and counting circle majority

### 🆕 Added

- add political assembly

### :new: Added

- added permissions for canton admin

### :new: Added

- added canton to counting circle

## [v2.10.1] - 2024-02-06

### 🔄 Changed

- Standardized proportional election mandate algorithms in unions

## [v2.10.0] - 2024-02-06

### 🆕 Added

- Double proportional election mandate algorithms

## [v2.9.2] - 2024-02-02

### 🔄 Changed

- update voting-lib to v2.6.3

## [v2.9.1] - 2024-02-01

### 🔄 Changed

- remove domain of influence type hierarchy checks

## [v2.9.0] - 2024-01-31

### 🆕 Added

- Add counting circle electorate

## [v2.8.0] - 2024-01-26

### 🆕 Added

- add candidate check digit

## [v2.7.0] - 2024-01-10

### :lock: Security

- change from roles to permissions

## [v2.6.0] - 2024-01-04

### 🆕 Added

- add new zh features flag

## [v2.5.1] - 2023-12-22

### 🔄 Changed

- load canton defaults for vote

## [v2.5.0] - 2023-12-20

### 🆕 Added

- Add counting machine flag to canton settings

## [v2.4.0] - 2023-12-19

### 🆕 Added

- add multiple vote ballots

## [v2.3.5] - 2023-11-28

### :arrows_counterclockwise: Changed

- apply strict policy for files that should not be cached

## [v2.3.4] - 2023-11-27

### :arrows_counterclockwise: Changed

- configure caching for statically named resource config.js
- set version tag for referenced config.js in index.html to enforce initial client-side cache invalidation

## [v2.3.3] - 2023-11-24

### :new: Added

- add support for custom oauth scopes.

## [v2.3.2] - 2023-11-09

### :new: Added

- add environment indicator badge in header

## [v2.3.1] - 2023-10-24

### :arrows_counterclockwise: Changed

- setup automatic refresh to only listen for the access_token lifetime since the IdP only responds with the access_token

## [v2.3.0] - 2023-09-01

### 🔄 Changed

- political first name of candidate from simple text to complex text

## [v2.2.2] - 2023-08-29

### 🔄 Changed

- display list and order number for created lists correctly

## [v2.2.1] - 2023-08-18

### ❌ Removed

- remove swiss post order number

## [v2.2.0] - 2023-08-10

### 🆕 Added

- party import mappings for proportional election candidates

## [v2.1.0] - 2023-08-09

### 🔄 Changed

- make proportional election lists, candidates and list unions reordable again

## [v2.0.0] - 2023-08-08

### ❌ Removed

- revert commit 6c24fa62023da2dbd9473ee23f438faab4878903

BREAKING CHANGE: update to Angular 14 version

### 🔄 Changed

- Angular 14 Update

## [v1.41.0] - 2023-07-26

### 🆕 Added

- add swiss post data

## [v1.40.5] - 2023-07-18

### 🆕 Added

- Add domain of influence voting card shipping choice

## [v1.40.4] - 2023-07-12

### 🔄 Changed

- end of testing phase time component disabled if testing phase ended

## [v1.40.3] - 2023-06-21

### 🔄 Changed

- disable candidate move buttons during reordering

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
