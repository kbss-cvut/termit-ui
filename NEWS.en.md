#### Version 2.13.0

- Implemented user interface for viewing and management of vocabulary and term snapshots.
- Added support for open only a subset of vocabularies for editing.
- Added support for storing vocabularies in repository contexts identified by an IRI different from vocabulary IRI.

#### Version 2.12.1

- Extend attributes of term snapshots in the public TermIt API.
- Improve the layout of non-SKOS attribute editor.

#### Version 2.12.0

- Added support for snapshots of vocabularies (and their content). Snapshots represent the state of a vocabulary at the moment of creation of the snapshot. This feature is currently mainly on the backend, UI supports only snapshot creation.

#### Version 2.11.3

- Fixed an issue with importing SKOS glossaries.
- Improve performance of vocabulary detail view.
- Fixed an issue with updating inferred term relationships.

#### Version 2.11.2

- Fixed styling conflicts of Markdown rendering.
- Unification of vocabulary import component styles.
- Fix layout of asset history table.
- Show term draft status in FTS results table.
- Backend performance and stability fixes.

#### Version 2.11.1

- Add support for Markdown formatting of term definition and scope note and vocabulary description.
- Show term status (draft/confirmed) on term detail. Allow directly toggling it.
- Optimize loading the list of all terms in a vocabulary.

#### Version 2.11.0

- Removed general resource management support from the open-source version.
- Fix version info display in Docker deployments.

#### Version 2.10.0

- Support filtering full text term search by vocabularies.
- Support accessing related terms in the public term API.
- Fix removal of a term after its definition source has been removed from document.

#### Version 2.9.0

- Whitelist of unmapped properties that are included in the term detail response in the public API.
- Plural unmapped property values are sorted alphabetically on term detail screen.
- Fix of exact matches, related matches & parents not showing up occasionally.

#### Version 2.8.0

- Simplified related terms UI.
- Implemented extension of SKOS export which allows exporting a glossary including terms from other vocabularies that are referenced in the glossary.
- Optimized removal of files containing term occurrences.
- Fixed issues with processing various kinds of accents and apostrophes in Annotace.

#### Version 2.7.0

- Improve SKOS import functionality.
- Ensure correct export of related/relatedMatch terms.
- Support exactMatch, related, and relatedMatch in the public REST API.
- Indicate when maximum uploaded file size is exceeded.
- Fix issues with using annotator in Firefox.

#### Version 2.6.0

- Distinguishing terms coming from different vocabularies by a badge.
- A vocabulary contains a badge with the number of its terms.
- SKOS import redesigned and extended.
- Bug fixes.

#### Version 2.5.1

- Using skos:broadMatch instead of skos:broader for a link to another vocabulary.
- Minor bug fixes.

#### Version 2.5.0

- Implemented support for SKOS related, relatedMatch and exactMatch.
- Minor bug fixes.

#### Version 2.4.1

- Redesigned forms (field help is now displayed on demand in popups).
- Improvements in the annotator UI.
- Simplified application infrastructure.
- Minor bug fixes.

#### Version 2.4.0

- Added a widget with comments to the dashboard.
- Annotator now displays the vocabulary used to annotate the file content and allows selecting vocabulary for text analysis.

#### Version 2.3.1

- Fixed issues with invocation of text analysis in Docker, as well as working with file contents.
- Fixed issues with public view (expired JWT, definition display).
- Optimized term retrieval.

#### Version 2.3.0

- Added support for discussion on terms (logged-in users only).
- Added support for user roles and basic authorization. Users may have restricted rights (view and commenting only), full rights (view and edit) or administrator rights.
- Admin can change roles of users.
- Default admin account is no longer generated on startup if another admin exists.

##### Version 2.2.0

- Reworked the relationship between vocabularies and documents.
- Improved handling of term definition sources in documents.
- Use a new filterable table with paging for resource and vocabulary list display.
- Support multilingual term description (skos:scopeNote).

##### Version 2.1.3

- Page title now changes based on navigation (easier history search).
- Fixed an issue in the invocation of text analysis on a new term's definition.
- Fixed inconsistent behavior of the file upload form.
- Fixed incorrect visualization of the validation score of a new term.

##### Version 2.1.2

- Redesign vocabularies and resources lists - use pageable and filterable table.
- Fix identifier generation issues.
- Improve validation results retrieval.
- Additional bug fixes.

##### Version 2.1.1

- Improved search results UI
- Fix minor frontend issues

##### Version 2.1.0

- Added support for SKOS altLabel and hiddenLabel.
- Added support for multilingual term attributes.
- Implemented validation of term quality in a vocabulary + results visualization.
- Implemented Docker support.

##### Version 2.0.0

- UI redesign.
- Added support for assigning multiple parents to a term.
- Optimized annotator.
- Further SKOS-ification of the model.
- Added read-only no-login view for browsing vocabularies and terms.

##### Version 1.3.0

- Implemented support for connecting a term to the source of its definition in a file.
- Added the possibility to discover terms related via definition or ontological relationships.
- Visualize terms not used to annotate any resource.
- Implemented support for creating new users in administration.

##### Version 1.2.1

- Added support for updating Resource metadata.
- Added support for user management and user profile editing.
- Allow disabling free registration in the application.
- Implemented support for creating document vocabularies.
- Numerous bug fixes and code improvements.
- Switched from DC elements to DC terms in the relevant parts of the ontological model.

##### Version 1.2.0

- Added support for Vocabulary dependencies (Vocabulary importing other Vocabularies).
- Terms can now have parent (skos:broader) from Vocabularies imported by the Term's owner Vocabulary.
- Allow downloading content of a File previously uploaded to TermIt.
- Improved full-text search accuracy.

##### Version 1.1.2

- File content upload implementation.
- Support for selecting vocabulary for text analysis.
- Added skos:definition attribute to Terms.
- Automatically assign Terms occurring in File content (based on text analysis) to the File.
- Source code published on [GitHub](https://github.com/kbss-cvut).

##### Version 1.1.1

- Display legend in the file content annotator.
- Hierarchical resource list visualization.
- Display terms assigned and occurring in a resource.
- Display resources to which a term is assigned or in which it occurs.

##### Version 1.1.0

- Performance optimizations.
- Minor bug fixes.

##### Version 1.0.0

- Support for resource management and assigning terms to resources.
- Creation of new terms based on text analysis output.
- Application dashboard redesign.
- Support for attaching arbitrary properties outside the application model to terms and vocabularies.

##### Version 0.4.0

- Export glossary into CSV/Excel.
- Full-text search support.
- Improved precision of text analysis results.
