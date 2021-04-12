import Constants from "../util/Constants";

const en = {
    locale: Constants.LANG.EN.locale,
    messages: {
        "please-wait": "Please wait...",
        create: "Create",
        save: "Save",
        cancel: "Cancel",
        "not-implemented": "Not implemented, yet!",
        edit: "Edit",
        remove: "Remove",
        required: "Required",
        optional: "Optional",
        actions: "Actions",
        description: "Description",
        submit: "Submit",
        approve: "Approve",
        "basic-information": "Basic Information",
        "created-info": "Created by {author} on {date}",
        "select.placeholder": "Select...",

        "connection.error": "Unable to connect to the server.",
        "ajax.unparseable-error":
            "Action failed. Server responded with unexpected error. If necessary, see browser log for more details.",
        "ajax.failed": "Unable to load data from the server.",

        "footer.copyright.kbss": "KBSS at FEE CTU in Prague",
        "footer.copyright.mvcr": "Ministry of the Interior",
        "footer.copyright.mvcr.tooltip": "Ministry of the Interior",
        "footer.version": "Version",
        "footer.grant.text": "This application is developed as part of the project OPZ no. CZ.03.4.74/0.0/0.0/15_025/0013983.",

        "news-viewer.title": "News",

        "auth.redirect-message": "Redirecting you to the authorization service.",
        "auth.unavailable-message": "Authorization service is not available. Please contact system administrators.",

        "login.title": "Log in",
        "login.error": "Authentication failed.",
        "login.progress-mask": "Logging in...",

        "main.nav.dashboard": "Dashboard",
        "main.nav.vocabularies": "Vocabularies",
        "main.nav.resources": "Resources",
        "main.nav.statistics": "Statistics",
        "main.nav.search": "Search",
        "main.nav.facetedSearch": "Faceted search",
        "main.nav.searchTerms": "Search terms",
        "main.nav.searchVocabularies": "Search vocabularies",
        "main.nav.create-vocabulary": "New Vocabulary",
        "main.nav.create-resource": "New Resource",
        "main.user-profile": "User profile",
        "main.logout": "Log out",
        "main.search.placeholder": "Search in the current workspace",
        "main.search.tooltip": "Go to the search screen",
        "main.search.count-info-and-link": "Showing {displayed} of {count} results. See all results.",
        "main.search.no-results": "No results found.",
        "main.lang-selector.tooltip": "Select user interface language",
        "main.issue-tracker.reportBug": "Report a bug",
        "main.issue-tracker.requestFeature": "Request a feature",

        "dashboard.widget.assetList.empty": "Found no assets to show here.",
        "dashboard.widget.assetList.lastEditMessage":
            "{operation, select, edit {Edited} other {Created}} by {user} {when}.",
        "dashboard.widget.assetList.lastEditMessageByYou":
            "{operation, select, edit {Edited} other {Created}} by You {when}.",
        "dashboard.widget.lastEditedAssets.title": "Last edited assets",
        "dashboard.widget.lastEditedAssets.all.title": "All",
        "dashboard.widget.lastEditedAssets.mine.title": "Mine",
        "dashboard.widget.lastEditedAssets.lastEditDate": "Last edited/created",
        "dashboard.widget.typeFrequency.title": "Term count in vocabularies",
        "dashboard.widget.alert.news":
            "TermIt is released in a new version {version}. Have a look at what's new by clicking on Version in the bottom right corner of application.",
        "dashboard.widget.donut.total-terms": "Total terms",
        "dashboard.widget.commentList.empty":
            "You will see here Your last comments and reactions to them.",
        "dashboard.widget.commentList.lastComment": "Last comment of the term.",
        "dashboard.widget.commentList.message": "{when} by {user} .",
        "dashboard.widget.commentList.messageByYou": "{when} by You .",
        "dashboard.widget.lastCommentedAssets.title": "Last commented terms",
        "dashboard.widget.lastCommentedAssets.all.title": "All",
        "dashboard.widget.lastCommentedAssets.mine.title": "Mine",
        "dashboard.widget.lastCommentedAssets.inReactionToMine.title":
            "With reaction to my comment",
        "dashboard.widget.lastCommentedAssets.byMe.title": "With my comment",

        "unauthorized.message": "You are not authorized to access this part.",

        "asset.link.tooltip": "View detail of this asset",
        "asset.iri": "Identifier",
        "asset.create.iri.help":
            "Asset identifier in the form of Internationalized Resource Identifier (IRI). Identifier will " +
            "be automatically generated based on the specified label. Or you can set it manually.",
        "asset.label": "Label",
        "asset.label.placeholder": "Enter label",
        "asset.create.button.text": "Create",
        "asset.author": "Author",
        "asset.created": "Created",
        "asset.create.showAdvancedSection": "Show advanced options",
        "asset.create.hideAdvancedSection": "Hide advanced options",
        "asset.remove.tooltip": "Remove this asset",
        "asset.remove.dialog.title": 'Remove {type} "{label}"?',
        "asset.remove.dialog.text":
            'Are you sure you want to remove {type} "{label}"?',

        "document.remove.tooltip.disabled":
            "In order to delete the document, delete the files first.",

        "vocabulary.management": "Vocabulary Management",
        "vocabulary.management.vocabularies": "Vocabularies",
        "vocabulary.management.empty":
            "No vocabularies found. Start by creating one.",
        "vocabulary.management.startTextAnalysis.title":
            "Start text analysis on definitions of terms in all vocabularies",
        "vocabulary.management.new": "New Vocabulary",
        "vocabulary.vocabularies.create.tooltip": "Create new vocabulary",
        "vocabulary.vocabularies.select.placeholder":
            "Start typing to filter vocabularies by name",
        "vocabulary.title": "Title",
        "vocabulary.create.title": "Create Vocabulary",
        "vocabulary.create.submit": "Create",
        "vocabulary.create.files": "Files",
        "vocabulary.create.files.help":
            "Optional. You can upload files (e.g. a texts of law) here.",
        "vocabulary.comment": "Description",
        "vocabulary.summary.title": "{name} - Summary",
        "vocabulary.summary.gotodetail.label": "View terms in this vocabulary",
        "vocabulary.summary.gotodetail.text": "View",
        "vocabulary.summary.export.title":
            "Export glossary terms from this vocabulary",
        "vocabulary.summary.export.text": "Export",
        "vocabulary.summary.export.csv": "CSV",
        "vocabulary.summary.export.csv.title": "Export to CSV",
        "vocabulary.summary.export.excel": "Excel",
        "vocabulary.summary.export.excel.title": "Export to MS Excel",
        "vocabulary.summary.export.ttl": "SKOS (Turtle)",
        "vocabulary.summary.export.ttl.title": "Export SKOS-compatible glossary serialized as Turtle",
        "vocabulary.summary.export.error": "Unable to retrieve exported data from server response.",
        "vocabulary.summary.startTextAnalysis.title": "Start text analysis on definitions of all terms in this vocabulary",
        "vocabulary.updated.message": "Vocabulary successfully updated.",
        "vocabulary.created.message": "Vocabulary successfully created.",
        "vocabulary.detail.subtitle": "Created by {author} on ",
        "vocabulary.detail.tabs.metadata": "Metadata",
        "vocabulary.detail.tabs.termdetail": "Term Detail",
        "vocabulary.detail.files": "Files",
        "vocabulary.detail.files.file": "Filename",
        "vocabulary.detail.noTermSelected": "Start by selecting a term in the tree on the left.",
        "vocabulary.detail.imports": "Dependencies",
        "vocabulary.detail.imports.edit": "Depends on vocabularies",
        "vocabulary.detail.document": "Document",
        "vocabulary.text-analysis.finished.message":
            "Text analysis of terms' definitions in this vocabulary successfully finished.",
        "vocabulary.all.text-analysis.invoke.message":
            "Text analysis of terms' definitions in all vocabularies successfully invoked.",
        "vocabulary.termchanges.creations": "Created terms",
        "vocabulary.termchanges.updates": "Updated terms",
        "vocabulary.termchanges.termcount": "Changed term count",
        "vocabulary.termchanges.loading": "Loading changes ...",
        "vocabulary.termchanges.empty": "No creations/updates of terms found.",
        "vocabulary.removed.message": "Vocabulary successfully removed.",
        "vocabulary.document.label": "Document for {vocabulary}",
        "vocabulary.document.attach": "Attach document",
        "vocabulary.document.create": "Create a new document",
        "vocabulary.document.create.title": "Create a document",
        "vocabulary.document.select": "Select an existing document",
        "vocabulary.document.select.title": "Select a document",
        "vocabulary.document.set": "Set document",
        "vocabulary.document.remove": "Detach document",

        "vocabulary.term.created.message": "Term successfully created.",
        "vocabulary.select-vocabulary": "Select a Vocabulary",

        "resource.management": "Resources management",
        "resource.management.resources": "Resources",
        "resource.management.empty":
            "No resources found. Start by registering some.",
        "resource.management.select.placeholder":
            "Start typing to filter resources by name",
        "resource.management.create.tooltip": "Create or upload a new resource",
        "resource.management.new": "New Resource",
        "resource.created.message": "Resource successfully created.",
        "resource.updated.message": "Resource successfully updated.",
        "resource.removed.message": "Resource successfully removed.",

        "resource.create.title": "Create resource",
        "resource.create.type": "Type",
        "resource.create.file.select.label":
            "Drag & drop a file here, or click to select file",
        "resource.metadata.description": "Description",
        "resource.metadata.terms.assigned": "Assigned terms",
        "resource.metadata.terms.assigned.tooltip":
            "Terms assigned to the resource as a whole",
        "resource.metadata.terms.occurrences": "Occurring terms",
        "resource.metadata.terms.occurrences.tooltip":
            "Terms occurring in the resource content",
        "resource.metadata.terms.occurrences.confirmed": "{count} - confirmed",
        "resource.metadata.terms.occurrences.confirmed.tooltip":
            "Occurrence confirmed/created by a user",
        "resource.metadata.terms.occurrences.suggested": "{count} - suggested",
        "resource.metadata.terms.occurrences.suggested.tooltip":
            "Occurrence suggested by the system",
        "resource.metadata.terms.edit.select.placeholder":
            "Start typing to search for relevant terms",
        "resource.metadata.file.content": "Content",
        "resource.metadata.file.content.view": "View",
        "resource.metadata.file.content.view.tooltip":
            "View file content and annotate it",
        "resource.metadata.file.content.download": "Download",
        "resource.metadata.document.vocabulary": "Document vocabulary",
        "resource.metadata.document.files.actions.add": "Add",
        "resource.metadata.document.files.actions.add.tooltip":
            "Add new file to this document",
        "resource.metadata.document.files.actions.add.dialog.title": "New file",
        "resource.metadata.document.files.empty":
            "No files found. Start by adding some.",
        "resource.file.vocabulary.create": "Add File",

        "term.language.selector.item":
            "View term data in language: {nativeLang} ({lang})",
        "term.language.add.placeholder": "Select...",
        "term.iri.help":
            "Term identifier in the form of Internationalized Resource Identifier (IRI). It will be " +
            "generated automatically based on the specified label, but you can adjust it manually. The identifier " +
            'can contain just alphanumerical characters and dashes ("-"). Slashes ("/") are used to separate ' +
            "hierarchical components of identifiers.",
        "term.label.help":
            "(Required) text uniquely describing the given concept/meaning within the current vocabulary." +
            "Abbreviations are not allowed ('Value added tax' instead of 'VAT'). The label is written in sentence case " +
            "- first letter in upper case, the others in lower case. Label should not be changed, as its change might impact " +
            "meaning of data described by this concept.",
        "term.definition.help":
            "(Optional) text describing the concept meaning. The definition unambiguously describes " +
            "concept meaning. If a concept is defined in a document, its definition is precise quotation of the respective part " +
            "of the document. Definition is used for full specification of concept meaning (e.g. 'Man' can be defined as 'a male person'). " +
            "Definition is always unique and cannot be combined from multiple sources.",
        "term.comment.help":
            "(Optional) non-definitorial text clarifying the meaning of the term.",
        "term.parent.help":
            "(Optional) broader term. It is used to model relationships to broader terms " +
            "(e.g. Church -> Building), types of instances (e.g. St. Paul's -> Cathedral), or parthood relationships (e.g. Handle -> Door).",
        "term.types.help":
            "(Optional) character of the term itself. Terms can be " +
            " either types or individuals. An example of a type is 'Person', an example of an individual " +
            "(instance of this type) is 'John Doe'. Individuals can be either 'Objects', 'Aspects', 'Relators', or " +
            "'Events'. Types are partitioned anologously - 'Object types', 'Aspect types', 'Relator types', 'Event types'. " +
            "An 'Object' (e.g. particular car, person, document) represents an independent entity which changes over time " +
            "(e.g. 'New York City', 'John Doe', 'Legal act no. 125/1995'). An 'Aspect' characterizes an 'Object' " +
            "(e.g. 'color of hair of John Doe') and is dependent on it. A 'Relator' represents a relation between two " +
            "(or more) 'objects' (e.g. Marriage of John and Claire) and is dependent on them. An 'Event' " +
            "(e.g. 'Olympics 1996 in Atlanta') denotes an entity which does not change over time and which has " +
            "already passed ('Olympics 2022' are not an 'Event' until they are over). Types represent groups/categories " +
            "of terms - 'Car' is an 'Object type'; 'Hair color' is an 'Aspect type'; 'Marriage' is a 'Relator type' and " +
            "'Already finished Olympic games' is an 'Event type'. If you are not sure, use general 'Type' or 'Individual' " +
            "or leave this field blank.",
        "term.source.help":
            "(Optional) reference to the origin of the term definition. It might refer to a particular " +
            "law section, or paragraph. Whenever the definition is marked in the document text, the source is filled automatically.",
        "term.edit.confirmed.tooltip": "Term is confirmed, therefore it cannot be edited.",
        "term.metadata.definition": "Definition",
        "term.metadata.definition.text": "Text",
        "term.metadata.definitionSource": "Document",
        "term.metadata.definitionSource.title":
            "The source of the definition of this term",
        "term.metadata.definitionSource.goto": "See in the document",
        "term.metadata.definitionSource.goto.tooltip":
            "Go to definition source in the corresponding document",
        "term.metadata.comment": "Scope note",
        "term.metadata.parent": "Parent terms",
        "term.metadata.parent.range.vocabulary": "Terms from current vocabulary",
        "term.metadata.parent.range.workspace": "Terms from the whole workspace",
        "term.metadata.parent.range.canonical": "Terms from the workspace and published SSP",
        "term.metadata.subTerms": "Sub terms",
        "term.metadata.types": "Type",
        "term.metadata.source": "Source",
        "term.metadata.altLabels.label": "Synonyms",
        "term.metadata.altLabels.placeholder": "Enter a new synonym and press \"Add\"",
        "term.metadata.altLabels.placeholder.text": "Add",
        "term.metadata.altLabels.remove": "Remove synonym",
        "term.metadata.altLabels.remove.text": "Remove",
        "term.metadata.altLabels.help": "(Optional) synonyms of the label. Synonyms can be contextual - e.g. term " +
            "named 'Organization address' can have a synonym 'Address', which is used in a specific context only " +
            "(e.g. in a form gathering information about an organization). ",
        "term.metadata.hiddenLabels.label": "Search strings",
        "term.metadata.hiddenLabels.placeholder":
            "Enter a new search string and press 'Add'",
        "term.metadata.hiddenLabels.placeholder.text": "Add",
        "term.metadata.hiddenLabels.remove": "Remove search string",
        "term.metadata.hiddenLabels.remove.text": "Remove",
        "term.metadata.hiddenLabels.help":
            "(Optional) search strings, which are not meant for visual presentation of terms and" +
            " serve mainly for search engines. Search strings do not need to be (contextual) synonyms to the label. E.g. " +
            "a term with label 'potato' can have search string 'spud'. ",
        "term.metadata.status": "Status",
        "term.updated.message": "Term successfully updated.",
        "term.metadata.labelExists.message":
            'Term with label "{label}" already exists in this vocabulary',
        "term.metadata.multipleSources.message":
            "Term has multiple sources. Upon save, only the current value will be saved and the remaining will be deleted.",
        "term.metadata.source.add.placeholder": "Add source",
        "term.metadata.source.add.placeholder.text": "Add",
        "term.metadata.source.remove.title": "Remove source",
        "term.metadata.source.remove.text": "Remove",
        "term.metadata.subterm.link": "View detail of this term",
        "term.metadata.assignments.title": "Anotated resources",
        "term.metadata.assignments.empty":
            "This term is not assigned to any resources.",
        "term.metadata.assignments.assignment": "Assigned to the resource?",
        "term.metadata.assignments.assignment.assigned":
            "Term is assigned to this resource",
        "term.metadata.assignments.assignment.not.assigned":
            "Term is not assigned to this resource",
        "term.metadata.assignments.assignment.help":
            "Term assignment represents situations when term is assigned to the resource as a whole.",
        "term.metadata.assignments.occurrence": "Occurrence",
        "term.metadata.assignments.occurrence.help":
            "Term occurrence denotes situations when an occurrence of the term is localized in the resource (usually a file) content.",
        "term.metadata.assignments.suggestedOccurrence": "Suggested occurrence",
        "term.metadata.assignments.suggestedOccurrence.help":
            "Suggested term occurrence represents a term occurrence suggested by the system, e.g., based on the analysis of the content.",
        "term.metadata.assignments.count.tooltip":
            "The term occurs {count, plural, one {# time} other {# times}} in this resource",
        "term.metadata.assignments.count.zero.tooltip":
            "The term does not occur in this resource",
        "term.metadata.related.title": "Related terms",
        "term.metadata.vocabulary.tooltip": "Vocabulary this term belongs to",
        "term.metadata.related.ontologically": "Ontologically",
        "term.metadata.related.definitionally": "Definitionally",
        "term.metadata.related.definitionally.targeting":
            "Terms that occurred in the definition of this term",
        "term.metadata.related.definitionally.of":
            "Terms in whose definition this term appeared",
        "term.metadata.related.ontologically.tooltip":
            "Terms which are related to this term via selected ontological relationships.",
        "term.metadata.related.definitionally.tooltip":
            "Terms which are related to this term via definition.",
        "term.metadata.assignments.occurrence.remove":
            "Occurrence successfully removed.",
        "term.metadata.assignments.occurrence.remove.tooltip":
            "Remove suggested occurrence",
        "term.metadata.assignments.occurrence.approve":
            "Occurrence successfully approved.",
        "term.metadata.assignments.occurrence.approve.tooltip":
            "Approve suggested occurrence",
        "term.metadata.comments.title": "Comments",
        "term.metadata.status.draft": "Draft",
        "term.metadata.status.confirmed": "Confirmed",
        "term.metadata.status.help":
            "Draft term is not ready to be used yet, while Confirmed term is.",
        "term.metadata.types.select.placeholder": "Select type",
        "term.metadata.validation.title": "Validation",
        "term.removed.message": "Term successfully removed.",
        "term.badge.score.tooltip":
            "The score of this term is {score}%. Click to see the validation results",
        "term.badge.no-score.tooltip":
            "There is no available score for this term",

        "glossary.title": "Terms",
        "glossary.new": "New Term",
        "glossary.select.placeholder": "Start typing to filter terms by label",
        "glossary.excludeImported": "Include imported",
        "glossary.excludeImported.help":
            "Terms from imported vocabularies are hidden in this view, click to show them",
        "glossary.includeImported": "Include imported",
        "glossary.includeImported.help":
            "Terms from imported vocabularies are shown in this view, click to hide them",
        "glossary.importedIncluded": "with imported",
        "glossary.importedExcluded": "without imported",
        "glossary.filter-draft": "Draft",
        "glossary.filter-confirmed": "Confirmed",
        "glossary.importedTerm.tooltip": "Imported from vocabulary",
        "glossary.unusedTerm.tooltip": "Term not occurring in a document",
        "glossary.createTerm": "Create new term",
        "glossary.createTerm.tooltip": "Create new vocabulary's term",
        "glossary.createTerm.breadcrumb": "Create term",
        "glossary.form.header": "Create Term",
        "glossary.form.tooltipLabel": "Didn't find your term? Create new one.",
        "glossary.form.field.parent": "Parent term",
        "glossary.form.field.source": "Term source",
        "glossary.form.field.type": "Term type",
        "glossary.form.button.addType": "Add term type",
        "glossary.form.button.removeType": "Remove term type",
        "glossary.form.button.submit": "Create",
        "glossary.form.button.submitAndGoToNewTerm": "Create and Start New",
        "glossary.form.button.cancel": "Cancel",

        "glossary.form.validation.validateLengthMin5":
            "Field must be at least 5 characters",
        "glossary.form.validation.validateLengthMin3":
            "Field must be at least 3 characters",
        "glossary.form.validation.validateNotSameAsParent":
            "Child option cannot be same as parent option",

        "file.text-analysis.finished.message":
            "Text analysis successfully finished.",
        "file.metadata.startTextAnalysis": "Start text analysis",
        "file.metadata.startTextAnalysis.text": "Analyze",
        "file.metadata.startTextAnalysis.vocabularySelect.title":
            "Select vocabulary for automatic text analysis",
        "file.content.upload.success":
            'Content of file "{fileName}" successfully uploaded.',
        "file.annotate.selectVocabulary":
            "Unable to determine vocabulary for annotating this file. Please, select one...",

        "statistics.vocabulary.count": "Vocabulary Count",
        "statistics.term.count": "Term Count",
        "statistics.user.count": "User Count",
        "statistics.notFilled": "Not Filled",
        "statistics.types.frequency": "Term Types",
        "statistics.types.frequency.empty": "There is no vocabulary or existing vocabularies contain no terms. Use left sidebar actions to create some.",

        "fullscreen.exit": "Exit fullscreen",
        "fullscreen.enter": "Enter fullscreen",

        "search.title": "Search",
        "search.tab.dashboard": "Dashboard",
        "search.tab.everything": "All asset types",
        "search.tab.terms": "Terms",
        "search.tab.vocabularies": "Vocabularies",
        "search.tab.facets": "Faceted search",
        "search.reset": "Reset search",
        "search.results.title": "Results for \"{searchString}\"",
        "search.results.countInfo": "Found {matches} matches in {assets} assets in the current workspace.",
        "search.results.table.label": "Label",
        "search.results.table.label.tooltip": "Open asset detail",
        "search.results.table.match": "Match",
        "search.results.table.score": "Match score",
        "search.results.field.badge.tooltip": "Matched attribute",
        "search.results.field.label": "Label",
        "search.results.field.comment": "Comment",
        "search.results.field.definition": "Definition",
        "search.results.vocabulary.from": "from",
        "search.slovnik": "Vocabulary",
        "search.informace": "Information",
        "search.je-instanci-typu": "has type",
        "search.je-specializaci": "specializes",
        "search.ma-vlastnosti-typu": "has intrinsic trope types",
        "search.ma-vztahy-typu": "has relation types",
        "search.pojem": "Term",
        "search.typ": "Type",

        "profile.first.name": "First name",
        "profile.last.name": "Last name",
        "profile.legend.invalid.name": "Field must be at least 1 character",
        "profile.updated.message": "Profile successfully updated",
        "profile.change-password": "Change Password",

        "change-password.current.password": "Current password",
        "change-password.new.password": "New password",
        "change-password.confirm.password": "Confirm password",
        "change-password.updated.message": "Password successfully updated",
        "change-password.passwords.differ.tooltip":
            "Old password and new password should not be same.",

        annotator: "Annotator",
        "annotator.content.loading": "Loading file content...",
        "annotator.vocabulary": "Uses terms from vocabulary",
        "annotator.selectionPurpose.dialog.title":
            "What is the purpose of the selected text?",
        "annotator.selectionPurpose.create": "Create term",
        "annotator.selectionPurpose.occurrence": "Mark term occurrence",
        "annotator.selectionPurpose.definition": "Mark term definition",
        "annotator.createTerm.selectDefinition": "Select definition",
        "annotator.createTerm.selectDefinition.tooltip":
            "Hide this dialog and select term definition in text",
        "annotator.createTerm.selectDefinition.message":
            "Select definition of the new term in text.",
        "annotator.setTermDefinitionSource.success":
            'Definition source of term "{term}" successfully set.',
        "annotator.setTermDefinitionSource.error.exists":
            'Term "{term}" already has a definition source.',
        "annotator.setTermDefinition.title":
            'Select definition of term "{term}"',
        "annotator.findAnnotation.error": "Unable to highlight annotation.",

        "annotation.form.suggested-occurrence.message":
            "Phrase is not assigned to a vocabulary term.",
        "annotation.form.invalid-occurrence.message":
            'Term "{term}" not found in vocabulary.',
        "annotation.form.assigned-occurrence.termInfoLabel": "Term info : ",
        "annotation.term.assigned-occurrence.termLabel": "Assigned term : ",
        "annotation.term.occurrence.scoreLabel": "Score:",
        "annotation.confirm": "Confirm suggestion of term occurrence",
        "annotation.save": "Save term occurrence",
        "annotation.edit": "Edit term occurrence",
        "annotation.remove": "Remove term occurrence",
        "annotation.close": "Close",
        "annotation.occurrence.title": "Term occurrence",

        "annotation.definition.title": "Source of definition of term",
        "annotation.definition.term": "Term:",
        "annotation.definition.definition": "Definition:",
        "annotation.definition.exists.message":
            'The term "{term}" already has a definition. You can compare the new definition with the original below and edit it.',
        "annotation.definition.original": "Original definition",
        "annotation.definition.new": "New definition",

        "annotator.legend.confirmed.loading": "Loading annotation",
        "annotator.legend.confirmed.loading.tooltip":
            "Annotation that was created or accepted by a user is loading.",
        "annotator.legend.proposed.loading": "Loading proposed annotation",
        "annotator.legend.proposed.loading.tooltip":
            "Annotation that was proposed by the annotation service is loading.",
        "annotator.legend.confirmed.unknown.term":
            "Occurrence of an unknown term",
        "annotator.legend.confirmed.unknown.term.tooltip":
            "Term occurrence was created or accepted by a user but not assigned to any vocabulary term, yet.",
        "annotator.legend.confirmed.existing.term":
            "Occurrence of an existing term",
        "annotator.legend.confirmed.existing.term.tooltip":
            "Occurrence of a known term was created or accepted by a user.",
        "annotator.legend.confirmed.missing.term":
            "Occurrence of a missing term",
        "annotator.legend.confirmed.missing.term.tooltip":
            "Term occurrence of was created or accepted by a user but the corresponding term could not be found.",
        "annotator.legend.proposed.unknown.term":
            "Proposed occurrence of an unknown term",
        "annotator.legend.proposed.unknown.term.tooltip":
            "Occurrence of a term was identified by the text analysis service but not assigned to any vocabulary term, yet.",
        "annotator.legend.proposed.existing.term":
            "Proposed occurrence of an existing term",
        "annotator.legend.proposed.existing.term.tooltip":
            "Occurrence of a known term was identified by the text analysis service.",
        "annotator.legend.proposed.missing.term":
            "Proposed occurrence of a missing term",
        "annotator.legend.proposed.missing.term.tooltip":
            "Term occurrence was proposed by the text analysis service but the corresponding term could not be found.",
        "annotator.legend.definition.pending": "Definition of an unknown term",
        "annotator.legend.definition.pending.tooltip":
            "Term definition was marked by a user but not assigned to any vocabulary term, yet.",
        "annotator.legend.definition": "Term definition",
        "annotator.legend.definition.tooltip":
            "Definition of a known term created by a user.",
        "annotator.legend.toggle.show": "Show legend",
        "annotator.legend.toggle.hide": "Hide legend",
        "annotator.unknown.unauthorized": "Term not selected.",

        "message.welcome": "Welcome to TermIt!",
        "link.external.title": "{url} - open in a new browser tab",
        "properties.edit.title": "Additional properties",
        "properties.empty": "There are no additional properties here.",
        "properties.edit.remove": "Remove this property value",
        "properties.edit.remove.text": "Remove",
        "properties.edit.property": "Property",
        "properties.edit.property.select.placeholder": "Select property",
        "properties.edit.value": "Value",
        "properties.edit.add.title": "Add property value",
        "properties.edit.add.text": "Add",
        "properties.edit.new": "Create property",
        "properties.edit.new.iri": "Identifier",
        "properties.edit.new.label": "Label",
        "properties.edit.new.comment": "Comment",

        "type.asset": "Asset",
        "type.term": "Term",
        "type.vocabulary": "Vocabulary",
        "type.resource": "Resource",
        "type.document": "Document",
        "type.file": "File",
        "type.dataset": "Dataset",
        "type.document.vocabulary": "Document vocabulary",

        "log-viewer.title": "Error log",
        "log-viewer.timestamp": "Timestamp",
        "log-viewer.error": "Error",
        "log-viewer.clear": "Clear log",

        "error.vocabulary.update.imports.danglingTermReferences":
            "Cannot remove vocabulary import(s), there are still references between terms from this vocabulary and the imported one (or one of its imports).",

        "history.label": "History",
        "history.loading": "Loading history...",
        "history.empty": "The recorded history of this asset is empty.",
        "history.whenwho": "Origin",
        "history.type": "Type",
        "history.type.persist": "Creation",
        "history.type.update": "Update",
        "history.changedAttribute": "Attribute",
        "history.originalValue": "Original value",
        "history.newValue": "New value",

        "changefrequency.label": "Activity",

        "tooltip.copy-iri": "Copy IRI",
        "tooltip.copied": "Copied!",

        "table.filter.text.placeholder": "Filter {count} records...",
        "table.filter.select.all": "All",
        "table.sort.tooltip": "Sort items",
        "table.paging.first.tooltip": "Go to the first page",
        "table.paging.previous.tooltip": "Go to the previous page",
        "table.paging.next.tooltip": "Go to the next page",
        "table.paging.last.tooltip": "Go to the last page",
        "table.paging.pageSize.select": "Show {pageSize} items per page",
        "table.paging.pageSize.select.all": "Show all items",

        "public.nav.user": "User not logged in. Click to log in.",
        "public.dashboard.title": "Welcome to TermIt!",
        "public.dashboard.intro":
            "TermIt is an easy-to-use vocabulary manager and terminology editor.",
        "public.dashboard.actions.login": "Log in",
        "public.dashboard.actions.register": "Create account",
        "public.dashboard.actions.vocabularies": "Browse vocabularies and terms",

        "workspace.select.success": "Workspace \"{name}\" successfully loaded.",
        "workspace.loading": "Loading current workspace...",
        "workspace.current.empty": "No workspace is currently loaded.",
        "workspace.indicator": "Workspace: {name}",
        "workspace.indicator.controlPanelLink.tooltip": "Show workspace detail in the control panel",

        "comments.title": "Comments",
        "comments.create.placeholder": "Type your comment...",
        "comments.create.submit.title": "Submit",
        "comments.list.empty": "No comments, yet.",
        "comments.comment.like": "Like this comment",
        "comments.comment.like.on": "Don't like any more",
        "comments.comment.dislike": "Dislike this comment",
        "comments.comment.dislike.on": "Cancel reaction",
        "comments.comment.edited": "Edited"
    }
};

export default en;
