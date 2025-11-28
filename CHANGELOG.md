# ✨ Changelog (`v3.57.2`)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version Info

```text
This version -------- v3.57.2
Previous version ---- v3.54.0
Initial version ----- v1.23.0
Total commits ------- 9
```

## [v3.57.2] - 2025-10-15

### 🆕 Added

- add proportional election mandate algorithm and vote result algorithm restrictions

## [v3.57.1] - 2025-10-14

### 🔄 Changed

- ensure political business is complete before activation

## [v3.57.0] - 2025-10-13

### 🆕 Added

- add majority election candidate reporting type

## [v3.56.1] - 2025-10-10

### 🔄 Changed

- correctly show party in majority election components

## [v3.56.0] - 2025-10-08

### 🆕 Added

- add party long description to majority election candidates

## [v3.55.0] - 2025-09-30

### 🔄 Changed

- update proto to restrict candidate and list number length

### 🔄 Changed

- restrict candidate and list number length

### 🔄 Changed

- use correct button click api

### 🔄 Changed

- support multiple exports per entity

## [v3.54.0] - 2025-08-25

### 🆕 Added

- add main voting cards domain of influence flag

## [v3.53.5] - 2025-08-08

### 🔄 Changed

- restrict editing of candidate reference to correct fields

## [v3.53.4] - 2025-08-08

### 🔄 Changed

- restrict locality to eCH length
- ensure correct swiss zip code

## [v3.53.3] - 2025-08-08

### 🔄 Changed

- improve political business import

## [v3.53.2] - 2025-07-28

## 🔄 Changed

- fix(VOTING-6086): error snackbars

## [v3.53.1] - 2025-07-22

### 🔄 Changed

- fix bc number clear spacing and perentage display

## [v3.53.0] - 2025-07-11

### 🔄 Changed

- bump BC version

## [v3.52.1] - 2025-07-07

### 🔄 Changed

- prevent vote type change after ballot create

## [v3.52.0] - 2025-07-04

### 🔄 Changed

- set majority election candidate number on import

## [v3.51.0] - 2025-07-03

### 🔄 Changed

- e-voting only contest export

## [v3.50.1] - 2025-07-03

### 🆕 Added

- add contest e-voting approval due date

## [v3.50.0] - 2025-07-01

### 🔄 Changed

- prevent certain political business changes after create

## [v3.49.1] - 2025-06-30

### 🔄 Changed

- fix create contest per preconfigured date

## [v3.49.0] - 2025-06-20

### 🆕 Added

- add e-voting approval on political businesses

## [v3.48.0] - 2025-06-18

### 🆕 Added

- add e-collecting email

## [v3.47.1] - 2025-06-05

### 🔄 Changed

- change vote sub type label

## [v3.47.0] - 2025-05-26

### 🔄 Changed

- refactor dockerfile
- remove redundant file copies
- add explicit workdir in final image to avoid surprises

### ❌ Removed

- remove entrypoint shell script since its functionality is shifted to the deployment in ops repo

### 🔒 Security

- refactor dockerfile
- using explicit nginx user instead of root for copying nginx configs and webroot

## [v3.46.4] - 2025-05-26

### 🔄 Changed

- initiative number of members committee is required for all dois

### 🔄 Changed

- fix secondary majority election filter naming in contest details

### 🆕 Added

- add e-collecting referendum and initiative properties

### 🔄 Changed

- highlight selected list union after create

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

### 🆕 Added

- add proportional election mandate algorithm and vote result algorithm restrictions

### 🆕 Added

- add majority election candidate reporting type

### 🔄 Changed

- correctly show party in majority election components

### 🆕 Added

- add party long description to majority election candidates

### 🔄 Changed

- update proto to restrict candidate and list number length

### 🔄 Changed

- restrict candidate and list number length

### 🔄 Changed

- use correct button click api

### 🔄 Changed

- support multiple exports per entity

### 🆕 Added

- add main voting cards domain of influence flag

### 🔄 Changed

- restrict editing of candidate reference to correct fields

### 🔄 Changed

- restrict locality to eCH length
- ensure correct swiss zip code

### 🔄 Changed

- improve political business import

## 🔄 Changed

- fix(VOTING-6086): error snackbars

### 🔄 Changed

- fix bc number clear spacing and perentage display

### 🔄 Changed

- bump BC version

### 🔄 Changed

- prevent vote type change after ballot create

### 🔄 Changed

- set majority election candidate number on import

### 🆕 Added

- add contest e-voting approval due date

### 🔄 Changed

- prevent certain political business changes after create

### 🔄 Changed

- fix create contest per preconfigured date

### 🆕 Added

- add e-voting approval on political businesses

### 🆕 Added

- add e-collecting email

### 🔄 Changed

- change vote sub type label

### 🔄 Changed

- refactor dockerfile
- remove redundant file copies
- add explicit workdir in final image to avoid surprises

### ❌ Removed

- remove entrypoint shell script since its functionality is shifted to the deployment in ops repo

### 🔒 Security

- refactor dockerfile
- using explicit nginx user instead of root for copying nginx configs and webroot

### 🔄 Changed

- initiative number of members committee is required for all dois

### 🔄 Changed

- fix secondary majority election filter naming in contest details

### 🆕 Added

- add e-collecting referendum and initiative properties

### 🔄 Changed

- highlight selected list union after create

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
