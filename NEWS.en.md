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
