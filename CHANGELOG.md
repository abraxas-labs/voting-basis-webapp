# ✨ Changelog (`v3.64.0`)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Version Info

```text
This version -------- v3.64.0
Previous version ---- v3.62.2
Initial version ----- v1.23.0
Total commits ------- 5
```

## [v3.64.0] - 2026-04-21

### 🔄 Changed

- validation for doi shortname

## [v3.63.3] - 2026-04-15

### 🔄 Changed

- update dependencies

## [v3.63.2] - 2026-04-08

### 🔄 Changed

- set political business edit to locked if no write permissions

## [v3.63.1] - 2026-03-25

### 🔄 Changed

- update base components and angular lib

## [v3.63.0] - 2026-03-24

### 🔄 Changed

- angular 21 and theming update

## [v3.62.2] - 2026-03-13

### 🔄 Changed

- remove accumulation updates candidate positions

## [v3.62.1] - 2026-03-12

### 🔄 Changed

- removing accumulated candidates preserves the order of the positions

## [v3.62.0] - 2026-03-12

### 🆕 Added

- feat(VOTING-6623): stistat export settings

## [v3.61.0] - 2026-03-11

### :arrows_counterclockwise: Changed

- i18n HAS_EMPTY_VOTING_CARDS

- feat(VOTING-6334): rm ecollecting settings

- e-voting approval fixes and prevent deletion of candidates after e-voting ever approved

### 🔄 Changed

- correct wording for deleting list with one candidate confirmation text

### 🔄 Changed

- delete list after last proportional election candidate is deleted

- add additional candidate fields

## [v3.60.1] - 2026-02-06

### 🔄 Changed

- extend CD pipeline with enhanced bug bounty publication workflow

## [v3.60.0] - 2026-01-19

### 🆕 Added

- add canton AR

## [v3.59.5] - 2026-01-19

### 🔄 Changed

- set contest detail paging to max 20 items

## [v3.59.4] - 2026-01-16

### 🔄 Changed

- do not try to reorder placeholder list

## [v3.59.3] - 2026-01-07

### 🔄 Changed

- enable voter duplicates without enabled electoral registration

## [v3.59.2] - 2025-12-17

### 🔄 Changed

- improve tables

## [v3.59.1] - 2025-12-17

### 🔄 Changed

- select proportional election list after it has been created

## [v3.59.0] - 2025-12-10

### 🔄 Changed

- message title text

### 🔄 Changed

- change candidate election dialog layout

### 🆕 Added

- note after step 2 by majority election: majority-election-edit and secondary-majority-election-edit componenet.

### 🔄 Changed

- update base components and angular lib

### 🆕 Added

- add option for manual ballot number generation

### 🔄 Changed

- require short descriptions in all languages in e-voting contests

### 🆕 Added

- show empty list in proportional elections

### 🔄 Changed

- angular and base components update

## [v3.58.0] - 2025-12-03

- require short descriptions in all languages in e-voting contests

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

### :new: Added

- support read only roles

## [v3.28.0] - 2024-11-27

### ❌ Removed

- remove secondary majority election allowed candidates

### 🔄 Changed

- change candidate lastname labels

### 🔄 Changed

- update dependencies

### 🔄 Changed

- optimize domain of influence edit dialog

### 🆕 Added

- feat(VOTING-4526): allow overwriting the candidate number of referenced majority candidates

### 🔄 Changed

- tooltips and add truncate with tooltips directive

### 🔄 Changed

- hide responsible for voting cards for non admins if not activated

### 🔄 Changed

- archived contest list without archive per and state column

### ❌ Removed

- remove unnecessary space for checkboxes and radio buttons

### 🆕 Added

- publish results option on domain of influence

### 🆕 Added

- add tooltip for truncated table headers and cell values

### 🔄 Changed

- upgrade dependencies

## [v3.27.4] - 2024-10-31

### :arrows_counterclockwise: Changed

- disable enforce result entry for votes after testing phase ended

## [v3.27.3] - 2024-10-30

### 🔄 Changed

- contest detail union description and election group number column

## [v3.27.2] - 2024-10-28

### 🔄 Changed

- remove admin tenant all permissions

## [v3.27.1] - 2024-10-25

### 🔄 Changed

- proportional election list created twice

## [v3.27.0] - 2024-10-24

### 🆕 Added

- add political business summaries

## [v3.26.0] - 2024-10-18

### 🆕 Added

- add STISTAT municipality flag to domain of influence

## [v3.25.2] - 2024-10-16

### 🔄 Changed

- add loading spinner for political business editing

## [v3.25.1] - 2024-10-16

### 🔄 Changed

- adjust date format that the BC can handle it

## [v3.25.0] - 2024-10-15

### 🆕 Added

- add filtering and sorting to counting circle assignment table

## [v3.24.1] - 2024-10-15

### 🆕 Added

- add confirm dialog before assigning counting circles to a domain of influence

## [v3.24.0] - 2024-10-15

### 🔄 Changed

- allow candicate locality and origin to be optional

## [v3.23.0] - 2024-10-15

### 🆕 Added

- superior authority domain of influence

## [v3.22.2] - 2024-10-11

### 🔄 Changed

- change list union descriptions

## [v3.22.1] - 2024-10-07

### 🔄 Changed

- rename political business and political business union tenant permissions

## [v3.22.0] - 2024-10-07

### 🔒 Security

- enable modifications for all political business and political business unions as admin and canton admin

## [v3.21.3] - 2024-10-03

### ❌ Removed

- remove zh feature flag

## [v3.21.2] - 2024-10-03

### 🔄 Changed

- fix logout after new tab is opened

## [v3.21.1] - 2024-09-27

### 🔄 Changed

- preselect canton for new counting circle

## [v3.21.0] - 2024-09-25

### 🔄 Changed

- foreigner and minor voters

## [v3.20.2] - 2024-09-23

### 🔄 Changed

- disable new political business button menu

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
