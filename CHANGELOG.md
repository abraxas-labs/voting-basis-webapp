# ✨ Changelog (`v3.46.3`)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version Info

```text
This version -------- v3.46.3
Previous version ---- v3.35.0
Initial version ----- v1.23.0
Total commits ------- 29
```

## [v3.46.3] - 2025-04-15

### 🔄 Changed

- fix selection of superior authority

## [v3.46.2] - 2025-04-11

### 🔄 Changed

- Moved ContestListType to contest-list.model and added politicalAssembly if type is political assembly
- PoliticalAsseblyService: enhaced list function with state, added archive function, added archivePer and state to fuction mapToPoliticalAssembly
- PoliticalAssembly type: added properties state and archivePer
- contest-overview.components: make selection for politicalAssemblies with states and add the right selection to actual, passed and archived politicalAssemblies, chaged archive function to work for political assemlies also, changed table settings for proper action menue item handling
- contest-list.component: changed mapPoliticalAssemblyToListType function with archivePer, politicalAssembly, state and mapping PoliticalAssemblyState to ContestState, set locked=true if PoliticalAssemblyState!=ACTIVE.
- contest-archive-dialog.component: changed imput type from ContestSummary to ContestListType and make archivation work with political assemblies too.

## [v3.46.1] - 2025-04-09

### 🔄 Changed

- check permission for secondary majority election

## [v3.46.0] - 2025-03-27

### 🆕 Added

- add domain of influence franking licence away number

## [v3.45.1] - 2025-03-27

### 🔄 Changed

- set street, house number and country for secondary election candidate

## [v3.45.0] - 2025-03-26

### 🆕 Added

- add e-collecting settings on dois

## [v3.44.0] - 2025-03-14

### 🆕 Added

- add country, street and house number to election candidate

## [v3.43.7] - 2025-03-12

### 🔄 Changed

- fix tenant selection after bc update

### ❌ Removed

- Chamois and Gold from VOTING_CARD_COLORS

## [v3.43.6] - 2025-03-11

### 🔄 Changed

- change delete confirmation messages for domain of influences and contests

## [v3.43.5] - 2025-03-11

### 🔄 Changed

- load canton defaults when no domain of influence exists

## [v3.43.4] - 2025-03-07

### 🔄 Changed

- event watcher clean up filters correctly

## [v3.43.3] - 2025-03-05

### 🔄 Changed

- proportional election candidate origin required

## [v3.43.2] - 2025-03-04

### 🔄 Changed

- update dependencies

## [v3.43.1] - 2025-03-04

### 🔄 Changed

- ensure valid majority election ballot groups

## [v3.43.0] - 2025-02-28

### 🆕 Added

- generic event watcher

## [v3.42.0] - 2025-02-25

### 🆕 Added

- add form validation

## [v3.41.0] - 2025-02-25

### 🆕 Added

- add e-collecting flag

## [v3.40.1] - 2025-02-20

### 🔄 Changed

- add candidates to secondary majority election bugfixes

## [v3.40.0] - 2025-02-19

### 🔄 Changed

- show assigned counting circles for political business

## [v3.39.0] - 2025-02-18

### 🆕 Added

- add domain of influence multiple electoral register flag

## [v3.38.1] - 2025-02-14

### 🔄 Changed

- update node version

## [v3.38.0] - 2025-02-14

### :new: Added

- option to hide occupation title field

## [v3.37.0] - 2025-02-14

### 🆕 Added

- add ecounting flag to counting circles

## [v3.36.1] - 2025-02-14

### 🔄 Changed

- sort political assemblies correctly

## [v3.36.0] - 2025-02-13

### 🔄 Changed

- angular 19 update

## [v3.35.1] - 2025-02-12

### 🔄 Changed

- update max length for short and official descriptions in ballot to align with eCH-0155 v4.0 specification.

### 🔄 Changed

- set popup min width for firefox

### 🔄 Changed

- add candidates to secondary majority election bugfixes

## [v3.35.0] - 2025-02-06

### :new: Added

- added hide lower domain of influences in reports flag

## [v3.34.3] - 2025-01-21

### 🔄 Changed

- update base components

## [v3.34.2] - 2025-01-16

### 🔄 Changed

- sort domain of influences in dropdowns

## [v3.34.1] - 2025-01-16

### 🔄 Changed

- save electoral registration enabled when creating domain of influence

## [v3.34.0] - 2025-01-15

### 🔄 Changed

- change majority election candidate party field to autocomplete

## [v3.33.0] - 2025-01-10

### :arrows_counterclockwise: Changed

- restrict admin permissions

## [v3.32.2] - 2025-01-10

### 🔄 Changed

- assign counting circles dialog fix paging

## [v3.32.1] - 2025-01-10

### 🆕 Added

- add paging to cc assign dialog

## [v3.32.0] - 2025-01-07

### 🆕 Added

- add robots meta tag to instruct crawlers to not index content
- add X-Robots-Tag response header to instruct crawlers to not index content

## [v3.31.6] - 2025-01-07

### 🔄 Changed

- add paging for assigned cc in doi overview

## [v3.31.5] - 2025-01-07

### 🔄 Changed

- update dependencies

## [v3.31.4] - 2025-01-06

### 🔄 Changed

- toggle political business active switch should not jump back

## [v3.31.3] - 2024-12-19

### 🔄 Changed

- fixed height for assign counting circle pop up

## [v3.31.2] - 2024-12-19

### 🔄 Changed

- fix reordering of candidates and incumbent of referenced secondary candidates

## [v3.31.1] - 2024-12-13

### 🆕 Added

- add paginator for all contests tables in overview

## [v3.31.0] - 2024-12-11

### 🆕 Added

- domain of influence voting card flat rate owner

## [v3.30.2] - 2024-12-11

### 🔄 Changed

- change disabled form fields to readonly

## [v3.30.1] - 2024-12-11

### 🔄 Changed

- majority election candidate optional values in active contest

## [v3.30.0] - 2024-12-03

### 🆕 Added

- show roles in header tenant switch

## [v3.29.1] - 2024-11-29

### 🔄 Changed

- move resolve contest import from grpc to rest

## [v3.29.0] - 2024-11-28

### 🔄 Changed

- fix selection of superior authority

### 🔄 Changed

- Moved ContestListType to contest-list.model and added politicalAssembly if type is political assembly
- PoliticalAsseblyService: enhaced list function with state, added archive function, added archivePer and state to fuction mapToPoliticalAssembly
- PoliticalAssembly type: added properties state and archivePer
- contest-overview.components: make selection for politicalAssemblies with states and add the right selection to actual, passed and archived politicalAssemblies, chaged archive function to work for political assemlies also, changed table settings for proper action menue item handling
- contest-list.component: changed mapPoliticalAssemblyToListType function with archivePer, politicalAssembly, state and mapping PoliticalAssemblyState to ContestState, set locked=true if PoliticalAssemblyState!=ACTIVE.
- contest-archive-dialog.component: changed imput type from ContestSummary to ContestListType and make archivation work with political assemblies too.

### 🔄 Changed

- check permission for secondary majority election

### 🆕 Added

- add domain of influence franking licence away number

### 🔄 Changed

- set street, house number and country for secondary election candidate

### 🆕 Added

- add e-collecting settings on dois

### 🆕 Added

- add country, street and house number to election candidate

### 🔄 Changed

- fix tenant selection after bc update

### ❌ Removed

- Chamois and Gold from VOTING_CARD_COLORS

### 🔄 Changed

- change delete confirmation messages for domain of influences and contests

### 🔄 Changed

- load canton defaults when no domain of influence exists

### 🔄 Changed

- proportional election candidate origin required

### 🔄 Changed

- update dependencies

### 🔄 Changed

- ensure valid majority election ballot groups

### 🆕 Added

- generic event watcher

### 🆕 Added

- add form validation

### 🆕 Added

- add e-collecting flag

### 🔄 Changed

- add candidates to secondary majority election bugfixes

### 🔄 Changed

- show assigned counting circles for political business

### 🆕 Added

- add domain of influence multiple electoral register flag

### 🔄 Changed

- update node version

### :new: Added

- option to hide occupation title field

### 🆕 Added

- add ecounting flag to counting circles

### 🔄 Changed

- sort political assemblies correctly

### 🔄 Changed

- angular 19 update

### 🔄 Changed

- update max length for short and official descriptions in ballot to align with eCH-0155 v4.0 specification.

### 🔄 Changed

- set popup min width for firefox

### 🔄 Changed

- add candidates to secondary majority election bugfixes

### :new: Added

- added hide lower domain of influences in reports flag

### 🔄 Changed

- update base components

### 🔄 Changed

- sort domain of influences in dropdowns

### 🔄 Changed

- save electoral registration enabled when creating domain of influence

### 🔄 Changed

- change majority election candidate party field to autocomplete

### :arrows_counterclockwise: Changed

- restrict admin permissions

### 🔄 Changed

- assign counting circles dialog fix paging

### 🆕 Added

- add paging to cc assign dialog

### 🆕 Added

- add robots meta tag to instruct crawlers to not index content
- add X-Robots-Tag response header to instruct crawlers to not index content

### 🔄 Changed

- add paging for assigned cc in doi overview

### 🔄 Changed

- update dependencies

### 🔄 Changed

- toggle political business active switch should not jump back

### 🔄 Changed

- fixed height for assign counting circle pop up

### 🆕 Added

- add paginator for all contests tables in overview

### 🆕 Added

- domain of influence voting card flat rate owner

### 🔄 Changed

- change disabled form fields to readonly

### 🔄 Changed

- majority election candidate optional values in active contest

### 🆕 Added

- show roles in header tenant switch

### 🔄 Changed

- move resolve contest import from grpc to rest
