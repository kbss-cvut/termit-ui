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
    moreActions: "More actions",
    required: "Required",
    optional: "Optional",
    actions: "Actions",
    description: "Description",
    submit: "Submit",
    approve: "Approve",
    "basic-information": "Basic Information",
    "created-info": "Created by {author} on {date}",
    "select.placeholder": "Select...",
    "select.loading": "Loading...",
    "help.title": "Help",
    "multilingual.title":
      "Attribute value can be provided in multiple languages",
    "input.markdown": "Styling with Markdown is supported.",

    "connection.error": "Unable to connect to the server.",
    "ajax.unparseable-error":
      "Action failed. Server responded with unexpected error. If necessary, see browser log for more details.",
    "ajax.failed": "Unable to load data from the server.",

    "footer.copyright": "KBSS at FEE CTU in Prague",
    "footer.version": "Version",

    "news-viewer.title": "News",

    "auth.redirect-message": "Redirecting you to the authorization service.",
    "auth.unavailable-message":
      "Authorization service is not available. Please contact system administrators.",

    "login.title": "Log in",
    "login.subtitle": "Please login to continue",
    "login.username": "Username",
    "login.username.placeholder": "Enter Your Username",
    "login.password": "Password",
    "login.password.placeholder": "Enter Your Password",
    "login.submit": "Login",
    "login.register": "Register",
    "login.register.label": "Don't have an account? <a>Register</a>",
    "login.error": "Authentication failed.",
    "login.progress-mask": "Logging in...",
    "login.locked": "Account locked.",
    "login.disabled": "Account disabled.",
    "login.public-view-link": "Or <a>explore</a> vocabularies and terms",

    "register.title": "Registration",
    "register.subtitle": "Please register to continue",
    "register.first-name": "First name",
    "register.first-name.placeholder": "Enter Your First Name",
    "register.last-name": "Last name",
    "register.last-name.placeholder": "Enter Your Last Name",
    "register.username": "Username",
    "register.username.placeholder": "Enter Your Username",
    "register.password": "Password",
    "register.password.placeholder": "Enter Your Password",
    "register.password-confirm": "Confirm password",
    "register.password-confirm.placeholder": "Enter Your Password Again",
    "register.passwords-not-matching.tooltip": 'Passwords don"t match.',
    "register.submit": "Register",
    "register.mask": "Registering...",
    "register.error": "Unable to register user account.",
    "register.login": "Log in",
    "register.login.error": "Unable to login into the newly created account.",
    "register.login.label": "Already a member? <a>Log in</a>",
    "register.username-exists.tooltip": "Username already exists",

    "main.nav.dashboard": "Dashboard",
    "main.nav.vocabularies": "Vocabularies",
    "main.nav.statistics": "Statistics",
    "main.nav.search": "Search",
    "main.nav.searchTerms": "Search terms",
    "main.nav.searchVocabularies": "Search vocabularies",
    "main.nav.admin": "Administration",
    "main.nav.create-vocabulary": "New Vocabulary",
    "main.nav.import-vocabulary": "Import Vocabulary",
    "main.user-profile": "User profile",
    "main.logout": "Log out",
    "main.search.placeholder": "Search",
    "main.search.tooltip": "Go to the search screen",
    "main.search.count-info-and-link":
      "Showing {displayed} of {count} results. See all results.",
    "main.search.no-results": "No results found.",
    "main.lang-selector.tooltip": "Select user interface language",

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
    "dashboard.widget.commentList.empty": "You will see here last comments.",
    "dashboard.widget.commentList.lastComment": "Last comment of the term.",
    "dashboard.widget.commentList.myLastComment": "...",
    "dashboard.widget.commentList.message": "{when} by {user} .",
    "dashboard.widget.commentList.messageByYou": "{when} by You .",
    "dashboard.widget.lastCommentedAssets.title": "Last commented terms",
    "dashboard.widget.lastCommentedAssets.all.title": "All",
    "dashboard.widget.lastCommentedAssets.mine.title": "Mine",
    "dashboard.widget.lastCommentedAssets.inReactionToMine.title":
      "With reaction to my comment",
    "dashboard.widget.lastCommentedAssets.byMe.title": "With my comment",

    "unauthorized.message": "You are not authorized to access this part.",

    "administration.users": "Users",
    "administration.users.name": "Name",
    "administration.users.username": "Username",
    "administration.users.status": "Status",
    "administration.users.status.locked": "Locked",
    "administration.users.status.locked.help":
      "User account is locked due to exceeding the maximum amount of unsuccessful login attempts. User cannot log in under this account unless an administrator sets a new password for it.",
    "administration.users.status.disabled": "Disabled",
    "administration.users.status.disabled.help":
      "User account has been disabled by an administrator and cannot be used to log in.",
    "administration.users.status.active": "Active",
    "administration.users.status.active.help":
      "User account is active and can be used to log in as usual.",
    "administration.users.status.action.enable": "Enable",
    "administration.users.status.action.enable.tooltip": "Enable this user",
    "administration.users.status.action.enable.success":
      "User {name} successfully enabled.",
    "administration.users.status.action.disable": "Disable",
    "administration.users.status.action.disable.tooltip": "Disable this user",
    "administration.users.status.action.disable.success":
      "User {name} successfully disabled.",
    "administration.users.status.action.unlock": "Unlock",
    "administration.users.status.action.unlock.tooltip": "Unlock this user",
    "administration.users.status.action.unlock.success":
      "User {name} successfully unlocked.",
    "administration.users.status.action.changeRole.success":
      "The role was changed.",
    "administration.users.unlock.title": "Unlock user {name}",
    "administration.users.unlock.password": "New password",
    "administration.users.unlock.passwordConfirm": "Confirm new password",
    "administration.users.action.changerole.tooltip":
      "Change role of the selected user",
    "administration.users.action.changerole": "Change role",
    "administration.users.roles.edit.title": 'Role of the user "{name}"',
    "administration.users.role": "Role",
    "administration.users.create": "Create user",
    "administration.users.create.tooltip": "Allows to create new user account",
    "administration.users.create.title": "New user",
    "administration.users.create.created":
      'User "{name}" successfully created.',
    "administration.users.you": "This is you",
    "administration.users.types.admin": "This user is an administrator",
    "administration.maintenance.title": "Maintenance",
    "administration.maintenance.invalidateCaches": "Invalidate caches",
    "administration.maintenance.invalidateCaches.tooltip":
      "Invalidate system's internal caches",
    "administration.maintenance.invalidateCaches.success":
      "Caches successfully cleared.",

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
    "vocabulary.summary.export.csv.title": "Export to CSV.",
    "vocabulary.summary.export.excel": "Excel",
    "vocabulary.summary.export.excel.title": "Export to MS Excel.",
    "vocabulary.summary.export.ttl": "SKOS (Turtle)",
    "vocabulary.summary.export.ttl.title":
      "Export a SKOS-compatible glossary serialized as Turtle.",
    "vocabulary.summary.export.ttl.withRefs": "SKOS + exact matches (Turtle)",
    "vocabulary.summary.export.ttl.withRefs.title":
      "Export a SKOS-compatible glossary including terms from other vocabularies referenced via the exact match relationship, serialized as Turtle.",
    "vocabulary.summary.export.error":
      "Unable to retrieve exported data from server response.",
    "vocabulary.summary.import.action": "Restore from backup",
    "vocabulary.summary.import.action.tooltip":
      "Restore the vocabulary from its previously exported version",
    "vocabulary.summary.import.dialog.title":
      "Restore previous vocabulary version",
    "vocabulary.summary.import.dialog.message":
      "Upload a previously exported version of this vocabulary " +
      "(in the SKOS formát and containing a single skos:ConceptScheme with IRI <IRI-OF-THIS-VOCABULARY>/glosář).",
    "vocabulary.import.action": "Import",
    "vocabulary.import.action.tooltip": "SKOS vocabulary import.",
    "vocabulary.import.dialog.title": "Import SKOS vocabulary",
    "vocabulary.import.dialog.message":
      "Imported file must be in the SKOS format. " +
      "The file must contain exactly one instance of skos:ConceptScheme.",
    "vocabulary.import.title": "Import vocabulary",
    "vocabulary.import.success": "Vocabulary successfully imported.",
    "vocabulary.import.allow-changing-identifiers":
      "Allow changing identifiers",
    "vocabulary.import.allow-changing-identifiers.tooltip":
      "When ticked, identifiers colliding with existing ones will be replaced by new ones.",
    "vocabulary.summary.startTextAnalysis.title":
      "Start text analysis on definitions of all terms in this vocabulary",
    "vocabulary.updated.message": "Vocabulary successfully updated.",
    "vocabulary.created.message": "Vocabulary successfully created.",
    "vocabulary.detail.subtitle": "Created by {author} on ",
    "vocabulary.detail.tabs.metadata": "Metadata",
    "vocabulary.detail.tabs.termdetail": "Term Detail",
    "vocabulary.detail.files": "Files",
    "vocabulary.detail.files.file": "Filename",
    "vocabulary.detail.imports": "Imports",
    "vocabulary.detail.imports.edit": "Imports vocabularies",
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
    "vocabulary.snapshot.create.label": "Create snapshot",
    "vocabulary.snapshot.create.title":
      "Create a snapshot of this vocabulary and all other vocabularies that are (indirectly) connected to it via term relationships. The snapshot is a read-only copy of the whole vocabulary content and can be used to demarcate important milestones in the vocabulary lifecycle.",
    "vocabulary.snapshot.create.dialog.text.no-related":
      "Are you sure you want to create a snapshot of this vocabulary?",
    "vocabulary.snapshot.create.dialog.text":
      "Are you sure you want to create a snapshot of this vocabulary? This action will also create {count, plural, one {a snapshot of one vocabulary that is connected to this via via term relationships.}" +
      "other {snapshots of # vocabularies that are (even indirectly) connected to this one via term relationships} }.",
    "vocabulary.snapshot.create.dialog.confirm": "Create",
    "vocabulary.snapshot.create.success":
      "Vocabulary revision successfully created.",

    "vocabulary.term.created.message": "Term successfully created.",
    "vocabulary.select-vocabulary": "Select a Vocabulary",

    "resource.created.message": "Resource successfully created.",
    "resource.updated.message": "Resource successfully updated.",
    "resource.removed.message": "Resource successfully removed.",

    "resource.create.file.select.label":
      "Drag & drop a file here, or click to select file",
    "resource.metadata.description": "Description",
    "resource.metadata.file.content": "Show Content",
    "resource.metadata.file.content.view": "View",
    "resource.metadata.file.content.view.tooltip":
      "View file content and annotate it",
    "resource.metadata.file.content.download": "Download",
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
      "Abbreviations are not allowed ('Value added tax' instead of 'VAT'). The whole label text " +
      "is written in lower case. Label should not be changed, as its change might impact " +
      "meaning of data described by this concept.",
    "term.definition.help":
      "(Optional) text describing the concept meaning. The definition unambiguously describes " +
      "concept meaning. If a concept is defined in a document, its definition is precise quotation of the respective part " +
      "of the document. Definition is used for full specification of concept meaning (e.g. 'Man' can be defined as 'a male person'). " +
      "Definition is always unique and cannot be combined from multiple sources.",
    "term.comment.help":
      "(Optional) non-definitorial text clarifying the meaning of the term.",
    "term.exactMatches.help":
      "(Optional) term exactly matching the meaning of the current term. It serves to map the term to another one from a different vocabulary.",
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
    "term.metadata.definition": "Definition",
    "term.metadata.definition.text": "Text",
    "term.metadata.definitionSource": "Document",
    "term.metadata.definitionSource.title":
      "The source of the definition of this term",
    "term.metadata.definitionSource.goto": "See in the document",
    "term.metadata.definitionSource.goto.tooltip":
      "Go to definition source in the corresponding document",
    "term.metadata.relationships": "Relationships",
    "term.metadata.exactMatches": "Exact matches",
    "term.metadata.comment": "Scope note",
    "term.metadata.parent": "Parent terms",
    "term.metadata.subTerms": "Sub terms",
    "term.metadata.types": "Type",
    "term.metadata.source": "Source",
    "term.metadata.altLabels.label": "Synonyms",
    "term.metadata.altLabels.placeholder":
      "Enter a new synonym and press 'Add'",
    "term.metadata.altLabels.addButton.text": "Add",
    "term.metadata.altLabels.addButton.title": "Click to add the synonym",
    "term.metadata.altLabels.remove.title": "Remove synonym",
    "term.metadata.altLabels.remove.text": "Remove",
    "term.metadata.altLabels.help":
      "(Optional) synonyms of the label. Synonyms can be contextual - e.g. term " +
      "named 'Organization address' can have a synonym 'Address', which is used in a specific context only " +
      "(e.g. in a form gathering information about an organization). ",
    "term.metadata.hiddenLabels.label": "Search strings",
    "term.metadata.hiddenLabels.placeholder":
      "Enter a new search string and press 'Add'",
    "term.metadata.hiddenLabels.addButton.text": "Add",
    "term.metadata.hiddenLabels.addButton.title":
      "Click to add the search string",
    "term.metadata.hiddenLabels.remove.title": "Remove search string",
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
    "term.metadata.related.title": "Related terms",
    "term.metadata.related.help":
      "(Optional) related term (without being specific about the type of relationship). " +
      "It can be a term from the current vocabulary, or another vocabulary. For example, 'car' is related to 'driver'. " +
      "Do not pick a term which is already selected as a 'parent term', or an 'exact match'.",
    "term.metadata.vocabulary.tooltip": "Vocabulary this term belongs to",
    "term.metadata.related.tab.title": "More related terms",
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
    "term.metadata.related.definitionally.suggested":
      "Occurrence has been identified by an automatic analysis of the definition text and has not been approved",
    "term.metadata.comments.public.title": "Public discussion",
    "term.metadata.status.draft": "Draft",
    "term.metadata.status.confirmed": "Confirmed",
    "term.metadata.status.help":
      "Draft term is not ready to be used yet, while Confirmed term is.",
    "term.metadata.status.confirmed.edit.title":
      "Confirmed term cannot be edited. Switch it back to Draft to edit.",
    "term.metadata.types.select.placeholder": "Select type",
    "term.metadata.validation.title": "Validation",
    "term.metadata.validation.empty": "The term does not have any issues.",
    "term.removed.message": "Term successfully removed.",
    "term.badge.score.tooltip":
      "The score of this term is {score}%. Click to see the validation results",
    "term.badge.no-score.tooltip": "There is no available score for this term",

    "glossary.title": "Terms",
    "glossary.termCount.tooltip":
      "Number of terms in the vocabulary (excluding imported vocabularies)",
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
    "file.upload": "Upload",
    "file.upload.hint":
      "Maximum file size: {maxUploadFileSize}. To use the file for term extraction, it must be in UTF-8.",

    "dataset.license": "License",
    "dataset.format": "Format",

    "statistics.vocabulary.count": "Vocabulary Count",
    "statistics.term.count": "Term Count",
    "statistics.user.count": "User Count",
    "statistics.notFilled": "Not Filled",
    "statistics.types.frequency": "Term Types",
    "statistics.types.frequency.empty":
      "There is no vocabulary or existing vocabularies contain no terms. Use left sidebar actions to create some.",

    "fullscreen.exit": "Exit fullscreen",
    "fullscreen.enter": "Enter fullscreen",

    "search.title": "Search",
    "search.tab.dashboard": "Dashboard",
    "search.tab.everything": "Search in all assets",
    "search.tab.terms": "Terms",
    "search.tab.terms.filter.allVocabularies": "All vocabularies",
    "search.tab.vocabularies": "Vocabularies",
    "search.tab.facets": "Faceted search",
    "search.reset": "Reset search",
    "search.results.title": 'Results for "{searchString}"',
    "search.results.countInfo": "Found {matches} matches in {assets} assets.",
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
      "What do you want to do with the selected text?",
    "annotator.selectionPurpose.create": "Create term",
    "annotator.selectionPurpose.occurrence": "Mark term occurrence",
    "annotator.selectionPurpose.definition": "Mark term definition",
    "annotator.createTerm.button": "New",
    "annotator.createTerm.selectDefinition": "Select definition",
    "annotator.createTerm.selectDefinition.tooltip":
      "Hide this dialog and select term definition in text",
    "annotator.createTerm.selectDefinition.message":
      "Select definition of the new term in text.",
    "annotator.setTermDefinitionSource.success":
      'Definition source of term "{term}" successfully set.',
    "annotator.setTermDefinitionSource.error.exists":
      'Term "{term}" already has a definition source.',
    "annotator.setTermDefinition.title": 'Select definition of term "{term}"',
    "annotator.findAnnotation.error": "Unable to highlight annotation.",
    "annotator.tutorial.title": "Tutorial",
    "annotator.tutorial.tooltip":
      "View a page with tutorial on how to use the annotator",

    "annotation.form.suggested-occurrence.message":
      "Phrase is not assigned to a vocabulary term.",
    "annotation.form.invalid-occurrence.message":
      'Term "{term}" not found in vocabulary.',
    "annotation.form.assigned-occurrence.termInfoLabel": "Term info : ",
    "annotation.term.assigned-occurrence.termLabel": "Assigned term : ",
    "annotation.term.occurrence.scoreLabel": "Score:",
    "annotation.term.select.placeholder":
      "Start typing to search for relevant terms",
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

    "annotator.legend.title": "Legend",
    "annotator.legend.confirmed.unknown.term": "Occurrence of an unknown term",
    "annotator.legend.confirmed.unknown.term.tooltip":
      "Term occurrence was created or accepted by a user but not assigned any vocabulary term, yet.",
    "annotator.legend.confirmed.existing.term":
      "Occurrence of an existing term",
    "annotator.legend.confirmed.existing.term.tooltip":
      "Occurrence of a known term was created or accepted by a user.",
    "annotator.legend.proposed.unknown.term":
      "Proposed occurrence of an new term",
    "annotator.legend.proposed.unknown.term.tooltip":
      "Occurrence of a possible new term was identified by the text analysis service but not accepter by a user, yet.",
    "annotator.legend.proposed.existing.term":
      "Proposed occurrence of an existing term",
    "annotator.legend.proposed.existing.term.tooltip":
      "Occurrence of a known term was identified by the text analysis service.",
    "annotator.legend.definition.pending": "Definition of an unknown term",
    "annotator.legend.definition.pending.tooltip":
      "Term definition was marked by a user but not assigned to any vocabulary term, yet.",
    "annotator.legend.definition": "Term definition",
    "annotator.legend.definition.tooltip":
      "Definition of a known term created by a user.",
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
    "error.file.maxUploadSizeExceeded":
      "The file could not be uploaded because it exceeds the configured maximum file size limit.",

    "history.label": "Change history",
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

    "comments.title": "Comments",
    "comments.create.placeholder": "Type your comment...",
    "comments.create.submit.title": "Submit",
    "comments.list.empty": "No comments, yet.",
    "comments.comment.like": "Like this comment",
    "comments.comment.like.on": "Don't like any more",
    "comments.comment.dislike": "Dislike this comment",
    "comments.comment.dislike.on": "Cancel reaction",
    "comments.comment.edited": "Edited",

    "validation.message.tooltip":
      "This is a quality validation result. The form can be submitted even if it has quality issues.",

    "snapshots.title": "Snapshot history",
    "snapshots.created": "Snapshot created",
    "snapshots.show": "Show snapshot",
    "snapshots.empty": "No previous snapshots found.",
    "snapshot.message":
      "This { type } is a snapshot and is read only. Click to view the current version.",
    "snapshot.remove.confirm.title": "Remove snapshot?",
    "snapshot.remove.confirm.text.no-related":
      "Are you sure you want to remove this snapshot?",
    "snapshot.remove.confirm.text":
      "Are you sure you want to remove this snapshot? This action will remove {count, plural, one {# related snapshot} " +
      "other {# related snapshots}}.",
    "snapshot.label.short": "snapshot from",

    "auth.notEditable.message.unauthorized":
      "You have insufficient rights to edit this { type }.",
    "auth.notEditable.message.readOnly": "This { type } is read only.",
  },
};

export default en;
