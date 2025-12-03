import Constants from "../util/Constants";

const de = {
  locale: Constants.LANG.DE.locale,
  messages: {
    "please-wait": "Bitte warten...",
    create: "Erstellen",
    save: "Speichern",
    cancel: "Abbrechen",
    "not-implemented": "Noch nicht implementiert!",
    edit: "Bearbeiten",
    remove: "Entfernen",
    moreActions: "Weitere Aktionen",
    required: "Erforderlich",
    optional: "Optional",
    actions: "Aktionen",
    description: "Beschreibung",
    submit: "Absenden",
    approve: "Genehmigen",
    backups: "Sicherungen",
    date: "Datum",
    time: "Uhrzeit",
    close: "Schließen",
    "basic-information": "Grundlegende Informationen",
    "created-info": "Erstellt von {author} am {date}",
    "select.placeholder": "Wählen...",
    "select.loading": "Laden...",
    "help.title": "Hilfe",
    "multilingual.title":
      "Der Attributwert kann in mehreren Sprachen bereitgestellt werden",
    "input.markdown": "Styling mit Markdown wird unterstützt.",
    "connection.error":
      "Es kann keine Verbindung zum Server hergestellt werden.",
    "ajax.unparseable-error": "Aktion fehlgeschlagen. ",
    "ajax.failed": "Es können keine Daten vom Server geladen werden.",
    "footer.copyright": "KBSS an der FEE CTU in Prag",
    "footer.version": "Version",
    "footer.version.tooltip": "Anwendungsversion. ",
    "footer.apidocs": "API",
    "footer.apidocs.tooltip": "Dokumentation der Server-API.",
    "news-viewer.title": "Nachricht",
    "auth.redirect-message": "Weiterleitung zum Autorisierungsdienst.",
    "auth.unavailable-message":
      "Der Autorisierungsdienst ist nicht verfügbar. ",
    "login.title": "Einloggen",
    "login.subtitle": "Bitte melden Sie sich an, um fortzufahren",
    "login.username": "Benutzername",
    "login.username.placeholder": "Geben Sie Ihren Benutzernamen ein",
    "login.password": "Passwort",
    "login.password.placeholder": "Geben Sie Ihr Passwort ein",
    "login.submit": "Login",
    "login.register": "Registrieren",
    "login.register.label": "Sie haben noch kein Konto? ",
    "login.forgotPassword.label": "<a>Passwort vergessen?</a>",
    "login.error": "Die Authentifizierung ist fehlgeschlagen.",
    "login.progress-mask": "Einloggen...",
    "login.locked": "Konto gesperrt.",
    "login.disabled": "Konto deaktiviert.",
    "login.public-view-link": "Oder Vokabeln und Begriffe <a>erkunden</a>",
    "register.title": "Anmeldung",
    "register.subtitle": "Bitte registrieren Sie sich, um fortzufahren",
    "register.first-name": "Vorname",
    "register.last-name": "Nachname",
    "register.username": "Benutzername",
    "register.username.help": "Geben Sie Ihre E-Mail-Adresse ein",
    "register.password": "Passwort",
    "register.password-confirm": "Passwort bestätigen",
    "register.passwords-not-matching.tooltip":
      "Passwörter stimmen nicht überein.",
    "register.submit": "Registrieren",
    "register.mask": "Registrieren...",
    "register.error": "Benutzerkonto konnte nicht registriert werden.",
    "register.login": "Einloggen",
    "register.login.error":
      "Die Anmeldung beim neu erstellten Konto ist nicht möglich.",
    "register.login.label": "Bereits Mitglied? ",
    "register.username-exists.tooltip": "Benutzername existiert bereits",
    "register.username.notValidEmail":
      "Der Benutzername muss eine E-Mail-Adresse sein",
    "forgotPassword.title": "Passwort vergessen",
    "forgotPassword.mask": "Senden...",
    "forgotPassword.login.label": "Zurück zu <a>Anmelden</a>",
    "forgotPassword.username": "Benutzername",
    "forgotPassword.username.placeholder": "Geben Sie Ihren Benutzernamen ein",
    "forgotPassword.username.notValidEmail":
      "Der Benutzername muss eine E-Mail-Adresse sein",
    "forgotPassword.submit": "Senden Sie eine Wiederherstellungs-E-Mail",
    "forgotPassword.success": "E-Mail gesendet",
    "resetPassword.passwordsNotEqual": "Passwörter stimmen nicht überein",
    "resetPassword.mask": "Passwort ändern...",
    "resetPassword.title": "Kennwort ändern",
    "resetPassword.login.label": "Zurück zu <a>Anmelden</a>",
    "resetPassword.password": "Neues Passwort",
    "resetPassword.password.placeholder": "Wählen Sie ein neues Passwort",
    "resetPassword.password.confirm": "Passwort bestätigen",
    "resetPassword.submit": "Kennwort ändern",
    "resetPassword.success": "Passwort geändert",
    "resetPassword.invalidToken":
      "Ungültiger oder abgelaufener Link zur Passwortänderung. ",
    "createPassword.passwordsNotEqual": "Passwörter stimmen nicht überein",
    "createPassword.mask": "Passwort erstellen...",
    "createPassword.title": "Passwort erstellen",
    "createPassword.password": "Neues Passwort",
    "createPassword.password.placeholder": "Wählen Sie ein neues Passwort",
    "createPassword.password.confirm": "Passwort bestätigen",
    "createPassword.submit": "Passwort erstellen",
    "createPassword.success": "Passwort erstellt",
    "createPassword.invalidToken":
      "Ungültiges oder abgelaufenes Passwort. Link zum Erstellen. ",
    "main.nav.dashboard": "Dashboard",
    "main.nav.vocabularies": "Vokabulare",
    "main.nav.statistics": "Statistiken",
    "main.nav.search": "Suche",
    "main.nav.searchTerms": "Suchbegriffe",
    "main.nav.searchVocabularies": "Vokabeln durchsuchen",
    "main.nav.facetedSearch": "Facettensuche",
    "main.nav.admin": "Administration",
    "main.nav.create-vocabulary": "Neues Vokabular",
    "main.nav.import-vocabulary": "Vokabular importieren",
    "main.user-profile": "Benutzerprofil",
    "main.logout": "Abmelden",
    "main.search.placeholder": "Suchen",
    "main.search.tooltip": "Gehen Sie zum Suchbildschirm",
    "main.search.count-info-and-link":
      "Es werden {displayed} von {count} Ergebnissen angezeigt. ",
    "main.search.no-results": "Keine Ergebnisse gefunden. ",
    "main.lang-selector.tooltip":
      "Wählen Sie die Sprache der Benutzeroberfläche aus",
    "dashboard.widget.assetList.empty":
      "Es wurden keine Assets gefunden, die hier angezeigt werden könnten.",
    "dashboard.widget.assetList.new.tooltip": "Neu seit Ihrem letzten Besuch.",
    "dashboard.widget.assetList.lastEditMessage":
      "{operation, select, edit {Edited} other {Created}} von {user} {when}.",
    "dashboard.widget.assetList.lastEditMessageByYou":
      "{operation, select, edit {Edited} other {Created}} ​​von Ihnen {when}.",
    "dashboard.widget.lastEditedAssets.title": "Zuletzt bearbeitete Assets",
    "dashboard.widget.lastEditedAssets.all.title": "Alle",
    "dashboard.widget.lastEditedAssets.mine.title": "Meine",
    "dashboard.widget.lastEditedAssets.lastEditDate":
      "Zuletzt bearbeitet/erstellt",
    "dashboard.widget.typeFrequency.title": "Anzahl Begriffe in Vokabular",
    "dashboard.widget.alert.news":
      "Die neue Version {version} von TermIt ist verfügbar. Für Details der neuen Version auf die Version in der unteren rechte Ecke klicken.",
    "dashboard.widget.donut.total-terms": "Begriffe gesamt",
    "dashboard.widget.commentList.empty":
      "Hier sehen Sie die letzten Kommentare.",
    "dashboard.widget.commentList.lastComment":
      "Letzter Kommentar des Begriffs.",
    "dashboard.widget.commentList.myLastComment": "...",
    "dashboard.widget.commentList.message": "{when} von {user} .",
    "dashboard.widget.commentList.messageByYou": "{when} von Dir.",
    "dashboard.widget.lastCommentedAssets.title":
      "Zuletzt kommentierte Begriffe",
    "dashboard.widget.lastCommentedAssets.all.title": "Alle",
    "dashboard.widget.lastCommentedAssets.mine.title": "Meine",
    "dashboard.widget.lastCommentedAssets.inReactionToMine.title":
      "Mit Reaktion auf meinen Kommentar",
    "dashboard.widget.lastCommentedAssets.byMe.title": "Von mir kommentiert",
    "unauthorized.message":
      "Sie sind nicht berechtigt, auf diesen Teil zuzugreifen.",
    "administration.users": "Benutzer",
    "administration.users.name": "Name",
    "administration.users.username": "Benutzername",
    "administration.users.status": "Status",
    "administration.users.status.locked": "Gesperrt",
    "administration.users.status.locked.help":
      "Das Benutzerkonto ist gesperrt, weil die maximale Anzahl erfolgloser Anmeldeversuche überschritten wurde, oder das Konto wartet darauf, dass der Benutzer ein neues Passwort festlegt. ",
    "administration.users.status.disabled": "Deaktiviert",
    "administration.users.status.disabled.help":
      "Das Benutzerkonto wurde von einem Administrator deaktiviert und kann nicht zum Anmelden verwendet werden.",
    "administration.users.status.active": "Aktiv",
    "administration.users.status.active.help":
      "Das Benutzerkonto ist aktiv und kann wie gewohnt zum Anmelden verwendet werden.",
    "administration.users.status.action.enable": "Aktivieren",
    "administration.users.status.action.enable.tooltip":
      "Aktivieren Sie diesen Benutzer",
    "administration.users.status.action.enable.success":
      "Benutzer {name} erfolgreich aktiviert.",
    "administration.users.status.action.disable": "Deaktivieren",
    "administration.users.status.action.disable.tooltip":
      "Deaktivieren Sie diesen Benutzer",
    "administration.users.status.action.disable.success":
      "Benutzer {name} erfolgreich deaktiviert.",
    "administration.users.status.action.unlock": "Entsperren",
    "administration.users.status.action.unlock.tooltip":
      "Entsperren Sie diesen Benutzer",
    "administration.users.status.action.unlock.success":
      "Benutzer {name} wurde erfolgreich entsperrt.",
    "administration.users.status.action.changeRole.success":
      "Die Rolle des Benutzers wurde geändert.",
    "administration.users.unlock.title": "Benutzer {name} entsperren",
    "administration.users.unlock.password": "Neues Passwort",
    "administration.users.unlock.passwordConfirm": "Neues Passwort bestätigen",
    "administration.users.action.changerole.tooltip":
      "Rolle des ausgewählten Benutzers ändern",
    "administration.users.action.changerole": "Rolle des Benutzers ändern",
    "administration.users.roles.edit.title": 'Rolle des Benutzers "{name}"',
    "administration.users.role": "Rolle",
    "administration.users.role.managedAssetsNotEmpty":
      "Der ausgewählte Benutzer verwaltet die folgenden Vokabulare. ",
    "administration.users.create": "Benutzer erstellen",
    "administration.users.create.tooltip":
      "Ermöglicht die Erstellung eines neuen Benutzerkontos",
    "administration.users.create.title": "Neuer Benutzer",
    "administration.users.create.created":
      'Benutzer "{name}" erfolgreich erstellt.',
    "administration.users.you": "Das bist du",
    "administration.users.types.admin": "Dieser Benutzer ist ein Administrator",
    "administration.users.oidc":
      "Zur Verwaltung der Benutzer wird ein externer Authentifizierungsdienst verwendet.",
    "administration.users.create.password-toggle.user":
      "Aktivierungs-E-Mail senden",
    "administration.users.create.password-toggle.admin":
      "Jetzt Passwort eingeben",
    "administration.users.create.password-toggle.tooltip.user":
      "An den neuen Benutzer wird eine E-Mail mit einem Link zum Erstellen eines neuen Passworts gesendet.",
    "administration.users.create.password-toggle.tooltip.admin":
      "Geben Sie jetzt das Passwort für den neuen Benutzer ein.",
    "administration.users.create.submit": "Benutzer erstellen",
    "administration.maintenance.title": "Wartung",
    "administration.maintenance.invalidateCaches": "Caches ungültig machen",
    "administration.maintenance.invalidateCaches.tooltip":
      "Machen Sie die internen Caches des Systems ungültig",
    "administration.maintenance.invalidateCaches.success":
      "Caches erfolgreich geleert.",
    "administration.maintenance.clearLongRunningTasksQueue":
      "Hintergrundprozesswarteschlange löschen",
    "administration.maintenance.clearLongRunningTasksQueue.tooltip":
      "Löscht die Warteschlange von Prozessen, die auf die Ausführung im Hintergrund warten",
    "administration.maintenance.clearLongRunningTasksQueue.success":
      "Hintergrundprozesswarteschlange erfolgreich gelöscht.",
    "administration.maintenance.reloadFTS": "Suchindizes neu laden",
    "administration.maintenance.reloadFTS.tooltip":
      "Löst die Neuinitialisierung von Volltextsuchindizes aus, sofern verfügbar.",
    "administration.maintenance.reloadFTS.success": "Suchindizes neu geladen.",
    "administration.groups": "Benutzergruppen",
    "administration.groups.create": "Gruppe erstellen",
    "administration.groups.create.tooltip":
      "Ermöglicht das Erstellen einer neuen Benutzergruppe",
    "administration.groups.create.success":
      "Benutzergruppe erfolgreich erstellt.",
    "administration.groups.remove.type": "Benutzergruppe",
    "administration.groups.remove.success":
      "Benutzergruppe erfolgreich entfernt.",
    "administration.groups.update": "Benutzergruppe aktualisieren",
    "administration.groups.update.success":
      "Benutzergruppe erfolgreich aktualisiert.",
    "administration.groups.label.invalid":
      "Die Bezeichnung der Benutzergruppe darf nicht leer sein.",
    "administration.groups.members": "Gruppenmitglieder",
    "administration.customization.title": "Anpassung",
    "administration.customization.customAttributes.title":
      "Benutzerdefinierte Attribute",
    "administration.customization.customAttributes.domain": "Domain",
    "administration.customization.customAttributes.range": "Bereich",
    "administration.customization.customAttributes.add": "Attribut erstellen",
    "administration.customization.customAttributes.labelExists":
      "Das Attribut {label} ist bereits vorhanden",
    "administration.customization.customAttributes.update":
      "Attribut aktualisieren",
    "administration.customization.customAttributes.update.success":
      "Attribut erfolgreich aktualisiert.",
    "administration.customization.customAttributes.annotatedRelationships":
      "Anwendbar auf Beziehungseigenschaften",
    "administration.customization.customAttributes.annotatedRelationships.help":
      "Wählen Sie aus, welche Term-Beziehungseigenschaften dieses benutzerdefinierte Attribut annotieren kann. Gilt nur, wenn die Domäne 'Term-Beziehung' ist.",
    "asset.link.tooltip": "Details zu diesem Asset anzeigen",
    "asset.iri": "Kennung",
    "asset.create.iri.help":
      "Asset-Identifikator in Form eines Internationalized Resource Identifier (IRI). ",
    "asset.label": "Label",
    "asset.label.placeholder": "Bezeichnung eingeben",
    "asset.create.button.text": "Erstellen",
    "asset.author": "Autor",
    "asset.created": "Erstellt",
    "asset.create.showAdvancedSection": "Erweiterte Optionen anzeigen",
    "asset.create.hideAdvancedSection": "Erweiterte Optionen ausblenden",
    "asset.remove.tooltip": "Entfernen Sie dieses Asset",
    "asset.remove.dialog.title": '{type} "{label}" entfernen?',
    "asset.modify.dialog.title": 'Ändern Sie {type} "{label}"',
    "asset.remove.dialog.text":
      'Sind Sie sicher, dass Sie {type} "{label}" entfernen möchten?',
    "asset.modify.error.cannotRemoveVocabularyPrimaryLanguage":
      "Die Übersetzung im Vokabular der Primärsprache kann nicht entfernt werden!",
    "document.remove.tooltip.disabled":
      "Um das Dokument zu löschen, löschen Sie zunächst die Dateien.",
    "vocabulary.management": "Vokabularverwaltung",
    "vocabulary.management.vocabularies": "Vokabulare",
    "vocabulary.management.empty": "Kein Vokabular gefunden. ",
    "vocabulary.management.startTextAnalysis.title":
      "Beginnen Sie mit der Textanalyse zu Begriffsdefinitionen in allen Vokabularen",
    "vocabulary.management.new": "Neues Vokabular",
    "vocabulary.vocabularies.create.tooltip": "Erstellen Sie neues Vokabular",
    "vocabulary.vocabularies.import.tooltip":
      "Erstellen Sie ein Vokabular durch den Import von Daten",
    "vocabulary.vocabularies.select.placeholder":
      "Beginnen Sie mit der Eingabe, um Vokabulare nach Namen zu filtern",
    "vocabulary.title": "Titel",
    "vocabulary.primaryLanguage": "Primäres Vokabular der Sprache",
    "vocabulary.create.title": "Vokabular erstellen",
    "vocabulary.create.submit": "Erstellen",
    "vocabulary.create.files": "Dateien",
    "vocabulary.create.files.help": "Optional. ",
    "vocabulary.comment": "Beschreibung",
    "vocabulary.summary.title": "{name} – Zusammenfassung",
    "vocabulary.summary.gotodetail.label":
      "Begriffe in diesem Vokabular anzeigen",
    "vocabulary.summary.gotodetail.text": "Ansicht",
    "vocabulary.summary.export.title":
      "Exportieren Sie Glossarbegriffe aus diesem Vokabular",
    "vocabulary.summary.export.text": "Export",
    "vocabulary.summary.export.type": "Exporttyp",
    "vocabulary.summary.export.format": "Exportformat",
    "vocabulary.summary.export.skos": "Grundlegende SKOS",
    "vocabulary.summary.export.skos.title":
      "Exportieren Sie ein SKOS-kompatibles Glossar.",
    "vocabulary.summary.export.skosFull": "Vollständiges SKOS",
    "vocabulary.summary.export.skosFull.title":
      "Exportieren Sie ein SKOS-kompatibles Glossar einschließlich aller zusätzlichen Eigenschaften von Begriffen.",
    "vocabulary.summary.export.skosWithRefs":
      "Grundlegende SKOS genaue Übereinstimmungen",
    "vocabulary.summary.export.skosWithRefs.title":
      "Exportieren Sie ein SKOS-kompatibles Glossar mit Begriffen aus anderen Vokabularen, auf die über die exakte Übereinstimmungsbeziehung verwiesen wird.",
    "vocabulary.summary.export.skosFullWithRefs":
      "Vollständiges SKOS genaue Übereinstimmungen",
    "vocabulary.summary.export.skosFullWithRefs.title":
      "Exportieren Sie ein SKOS-kompatibles Glossar einschließlich aller zusätzlichen Eigenschaften von Begriffen. ",
    "vocabulary.summary.export.excel": "Excel",
    "vocabulary.summary.export.excel.title": "Export nach MS Excel.",
    "vocabulary.summary.export.ttl": "Turtle",
    "vocabulary.summary.export.ttl.title": "Export nach Turtle (RDF).",
    "vocabulary.summary.export.rdfxml": "RDF/XML",
    "vocabulary.summary.export.rdfxml.title": "Export nach RDF/XML (RDF).",
    "vocabulary.summary.export.error":
      "Exportierte Daten können nicht aus der Serverantwort abgerufen werden.",
    "vocabulary.summary.import.action": "Aus Datei laden",
    "vocabulary.summary.import.action.tooltip":
      "Laden Sie Vokabulardaten aus einer Datei, die Daten im SKOS- oder MS Excel-Format enthält",
    "vocabulary.summary.import.dialog.title":
      "Vokabularinhalte aus einer Datei importieren",
    "vocabulary.summary.import.dialog.tab.replaceContent": "Inhalte ersetzen",
    "vocabulary.summary.import.dialog.tab.translations":
      "Übersetzungen importieren",
    "vocabulary.summary.import.dialog.label":
      "Laden Sie eine exportierte Version dieses Vokabulars hoch",
    "vocabulary.summary.import.dialog.skosImport":
      "Im SKOS-Format und mit einem einzelnen skos:ConceptScheme mit IRI '<'IRI-OF-THIS-VOCABULARY'>'/glosář",
    "vocabulary.summary.import.dialog.excelImport":
      "Als MS-Excel-Datei entsprechend <a>dieser Vorlage</a>",
    "vocabulary.summary.import.excel.template.tooltip":
      "Laden Sie eine MS Excel-Vorlage herunter",
    "vocabulary.summary.import.nonEmpty.warning":
      "Das Vokabular ist nicht leer, vorhandene Daten werden durch die importierten überschrieben.",
    "vocabulary.summary.import.translations.label":
      "Laden Sie eine MS Excel-Datei entsprechend <a>dieser Vorlage</a> hoch, aus der Übersetzungen vorhandener Begriffe in diesem Vokabular importiert werden.",
    "vocabulary.summary.import.translations.help":
      "Vorhandene Daten werden nicht verändert.",
    "vocabulary.import.type.skos": "SKOS",
    "vocabulary.import.type.excel": "MS Excel",
    "vocabulary.import.action": "Import",
    "vocabulary.import.dialog.title": "Vokabular importieren",
    "vocabulary.import.dialog.message":
      "Die importierte Datei muss im SKOS-Format vorliegen. ",
    "vocabulary.import.title": "Vokabular importieren",
    "vocabulary.import.success": "Vokabular erfolgreich importiert.",
    "vocabulary.import.allow-changing-identifiers":
      "Sich ändernde Bezeichner erlauben",
    "vocabulary.import.allow-changing-identifiers.tooltip":
      "Wenn diese Option aktiviert ist, werden Identifikatoren, die mit bestehenden kollidieren, durch neue ersetzt.",
    "vocabulary.summary.startTextAnalysis.title":
      "Mit der Textanalyse zu Definitionen aller Begriffe in diesem Vokabular beginnen",
    "vocabulary.summary.model.label": "Modellbeziehungen",
    "vocabulary.summary.model.title":
      "Modellieren Sie Beziehungen zwischen Begriffen in diesem Vokabular mithilfe eines externen Tools",
    "vocabulary.summary.model.open": "Offen",
    "vocabulary.summary.model.dialog.title":
      "Modellbeziehungen von Begriffen im {vocabulary}",
    "vocabulary.summary.model.dialog.text":
      "Wählen Sie Vokabulare aus, die Sie zur Modellierung öffnen möchten. ",
    "vocabulary.updated.message": "Vokabular erfolgreich aktualisiert.",
    "vocabulary.created.message": "Vokabular erfolgreich erstellt.",
    "vocabulary.detail.subtitle": "Erstellt von {author} am",
    "vocabulary.detail.tabs.metadata": "Metadaten",
    "vocabulary.detail.tabs.termdetail": "Begriffsdetails",
    "vocabulary.detail.files": "Dateien",
    "vocabulary.detail.files.file": "Dateiname",
    "vocabulary.detail.imports": "Importe",
    "vocabulary.detail.imports.edit": "Importiert Vokabulare",
    "vocabulary.detail.document": "Dokument",
    "vocabulary.text-analysis.invoke.message":
      "Textanalyse der Begriffsdefinitionen in diesem Vokabular.",
    "vocabulary.all.text-analysis.invoke.message":
      "Textanalyse der Begriffsdefinitionen in allen aufgerufenen Vokabularen.",
    "vocabulary.termchanges.creations": "Begriffe erstellt",
    "vocabulary.termchanges.updates": "Begriffe aktualisiertt",
    "vocabulary.termchanges.deletions": "Begriffe gelöscht",
    "vocabulary.termchanges.termcount": "Anzahl der Begriffe geändert",
    "vocabulary.termchanges.loading": "Änderungen werden geladen ...",
    "vocabulary.termchanges.empty":
      "Keine Erstellungen/Aktualisierungen von Begriffen gefunden.",
    "vocabulary.removed.message": "Vokabulare erfolgreich entfernt.",
    "vocabulary.document.label": "Dokument für {vocabulary}",
    "vocabulary.document.attach": "Dokument anhängen",
    "vocabulary.document.create": "Erstellen Sie ein neues Dokument",
    "vocabulary.document.create.title": "Erstellen Sie ein Dokument",
    "vocabulary.document.select": "Wählen Sie ein vorhandenes Dokument aus",
    "vocabulary.document.select.title": "Wählen Sie ein Dokument aus",
    "vocabulary.document.set": "Dokument festlegen",
    "vocabulary.document.remove": "Dokument entfernen",
    "vocabulary.document.set.label": "Dokumenten-Label",
    "vocabulary.snapshot.create.label": "Snapshot erstellen",
    "vocabulary.snapshot.create.title":
      "Erstellen Sie einen Snapshot dieses Vokabulars und aller anderen Vokabulare, die (indirekt) über Begriffsbeziehungen damit verbunden sind. ",
    "vocabulary.snapshot.create.dialog.text.no-related":
      "Möchten Sie wirklich einen Snapshot dieses Vokabulars erstellen?",
    "vocabulary.snapshot.create.dialog.text":
      "Möchten Sie wirklich einen Snapshot dieses Vokabulars erstellen? ",
    "vocabulary.snapshot.create.dialog.confirm": "Erstellen",
    "vocabulary.snapshot.create.success":
      "Vokabularrevision erfolgreich erstellt.",
    "vocabulary.acl": "Zugangskontrolle",
    "vocabulary.acl.record.create": "Neuer Datensatz",
    "vocabulary.acl.record.create.title":
      "Erstellen Sie einen neuen Datensatz in der Zugriffskontrollliste dieses Vokabulars",
    "vocabulary.acl.record.create.dialog.title":
      "Erstellen Sie einen neuen Zugriffskontrolldatensatz",
    "vocabulary.acl.record.save.success":
      "Zugriffskontrolldatensatz erfolgreich gespeichert.",
    "vocabulary.acl.record.remove.success":
      "Zugriffskontrolleintrag erfolgreich entfernt.",
    "vocabulary.acl.record.holder": "Zugangsberechtigter",
    "vocabulary.acl.record.level": "Zugriffsebene",
    "vocabulary.acl.record.remove.dialog.title":
      "Zugriffskontrolldatensatz entfernen?",
    "vocabulary.acl.record.remove.dialog.text":
      'Sind Sie sicher, dass Sie den Zugriffskontrolleintrag für "{holder}" entfernen möchten?',
    "vocabulary.acl.record.update.dialog.title":
      "Zugriffskontrolldatensatz aktualisieren",
    "vocabulary.acl.record.update.success":
      "Zugriffskontrolldatensatz erfolgreich aktualisiert.",
    "vocabulary.term.created.message": "Begriff erfolgreich erstellt.",
    "vocabulary.select-vocabulary": "Wählen Sie ein Vokabular aus",
    "vocabulary.remove.dialog.text.nonEmpty":
      "Möchten Sie das <b>nicht leere</b> Vokabular wirklich entfernen?",
    "vocabulary.remove.dialog.text.empty":
      "Möchten Sie das <b>leere</b> Vokabular wirklich entfernen?",
    "vocabulary.remove.dialog.text.termCount":
      "Durch das Löschen werden {count, plural, one {<b>1</b> term} other {<b>#</b> terms}}, das Dokument und alle zugehörigen Dateien dauerhaft gelöscht.",
    "vocabulary.remove.dialog.text.permanent":
      "Diese Aktion ist dauerhaft und kann nicht rückgängig gemacht werden!",
    "vocabulary.remove.dialog.relationsExists.text":
      "Es bestehen Beziehungen zu anderen Vokabularen, das Vokabular kann nicht entfernt werden.",
    "vocabulary.remove.dialog.relations": "Beziehungen",
    "vocabulary.remove.dialog.relations.error.cantRemove":
      "Vokabulare können nicht entfernt werden!",
    "vocabulary.remove.dialog.relations.error.vocabularyRelations":
      "{vocabularyRelations, plural, one {<b>1</b> relation to another vocabulary} other {<b>#</b> relations with other vocabularies}} existiert.",
    "vocabulary.remove.dialog.relations.error.termsRelations":
      "{termsRelations, plural, one {<b>1</b> term relation} other {<b>#</b> term relations}} existiert.",
    "vocabulary.remove.dialog.input.label":
      "Geben Sie zur Bestätigung den Namen des Vokabulars ein",
    "resource.created.message": "Ressource erfolgreich erstellt.",
    "resource.updated.message": "Ressource erfolgreich aktualisiert.",
    "resource.removed.message": "Ressource erfolgreich entfernt.",
    "resource.create.file.select.label":
      "Ziehen Sie eine Datei per Drag & Drop hierher oder klicken Sie, um die Datei auszuwählen",
    "resource.reupload.file.select.label":
      "Laden Sie eine neue Version der Datei hoch",
    "resource.metadata.description": "Beschreibung",
    "resource.metadata.file.content": "Inhalt",
    "resource.metadata.file.content.view": "Ansicht",
    "resource.metadata.file.content.view.tooltip":
      "Dateiinhalt anzeigen und mit Anmerkungen versehen",
    "resource.metadata.file.content.download": "Herunterladen",
    "resource.metadata.file.content.download.tooltip":
      "Laden Sie die Datei herunter",
    "resource.metadata.file.content.download.original":
      "Original herunterladen",
    "resource.metadata.file.content.download.original.tooltip":
      "Laden Sie die ursprünglich hochgeladene Datei herunter",
    "resource.metadata.document.files.actions.add": "Hinzufügen",
    "resource.metadata.document.files.actions.add.tooltip":
      "Fügen Sie diesem Dokument eine neue Datei hinzu",
    "resource.metadata.document.files.actions.add.dialog.title": "Neue Datei",
    "resource.metadata.document.files.empty": "Keine Dateien gefunden. ",
    "resource.file.vocabulary.create": "Datei hinzufügen",
    "resource.file.backup.reason": "Entstehungsgrund",
    "resource.file.backup.reason.reupload": "Erneuter Upload",
    "resource.file.backup.reason.text_analysis": "Textanalyse",
    "resource.file.backup.reason.new_occurrence": "Neues Vorkommen",
    "resource.file.backup.reason.remove_occurrence": "Vorkommen entfernt",
    "resource.file.backup.reason.scheduled": "Geplant",
    "resource.file.backup.reason.backup_restore": "Backup wiederhergestellt",
    "resource.file.backup.reason.unknown": "Unbekannt",
    "resource.file.backup.restore": "Sicherung wiederherstellen",
    "resource.file.backup.restore.failure":
      "Die Wiederherstellung der Sicherung ist fehlgeschlagen.",
    "resource.file.backup.restore.success": "Die Sicherung wird erneuert",

    "term.language.selector.item":
      "Begriffsdaten in der Sprache anzeigen: {nativeLang} ({lang})",
    "term.language.add.placeholder": "Wählen...",
    "term.iri.help":
      "Begriffsidentifikator in Form eines Internationalized Resource Identifier (IRI). ",
    "term.label.help":
      '(Erforderlicher) Text, der das gegebene Konzept/die Bedeutung innerhalb des aktuellen Vokabulars eindeutig beschreibt. Abkürzungen sind nicht erlaubt ("Mehrwertsteuer" statt "VAT"). ',
    "term.definition.help":
      "(Optionaler) Text, der die Konzeptbedeutung beschreibt. ",
    "term.comment.help":
      "(Optional) nicht-definitorialer Text, der die Bedeutung des Begriffs verdeutlicht.",
    "term.exactMatches.help":
      "(Optional) Begriff, der genau der Bedeutung des aktuellen Begriffs entspricht. ",
    "term.parent.help": "(Optional) weiter gefasster Begriff. ",
    "term.types.help": "(Optionaler) Charakter des Begriffs selbst. ",
    "term.source.help":
      "(Optional) Verweis auf den Ursprung der Begriffsdefinition. ",
    "term.metadata.definition": "Definition",
    "term.metadata.definition.text": "Text",
    "term.metadata.definitionSource": "Dokument",
    "term.metadata.definitionSource.title":
      "Die Quelle der Definition dieses Begriffs",
    "term.metadata.definitionSource.goto": "Siehe im Dokument",
    "term.metadata.definitionSource.goto.tooltip":
      "Gehen Sie zur Definitionsquelle im entsprechenden Dokument",
    "term.metadata.relationships": "Beziehungen",
    "term.metadata.exactMatches": "Genaue Übereinstimmungen",
    "term.metadata.comment": "Hinweis zum Umfang",
    "term.metadata.parent": "Übergeordnete Bedingungen",
    "term.metadata.subTerms": "Unterbegriffe",
    "term.metadata.types": "Typ",
    "term.metadata.source": "Quelle",
    "term.metadata.altLabels.label": "Synonyme",
    "term.metadata.altLabels.help": "(Optional) Synonyme der Bezeichnung. ",
    "term.metadata.hiddenLabels.label": "Suchbegriff",
    "term.metadata.hiddenLabels.help":
      "(Optionale) Suchbegriffe, die nicht zur visuellen Darstellung von Begriffen gedacht sind und hauptsächlich für Suchmaschinen dienen. ",
    "term.metadata.status": "Status",
    "term.updated.message": "Begriff erfolgreich aktualisiert.",
    "term.metadata.labelExists.message":
      'Der Begriff mit der Bezeichnung "{label}" existiert bereits in diesem Vokabular',
    "term.metadata.multipleSources.message":
      "Der Begriff hat mehrere Quellen. ",
    "term.metadata.source.add.placeholder": "Quelle hinzufügen",
    "term.metadata.subterm.link": "Details zu diesem Begriff anzeigen",
    "term.metadata.related.title": "Verwandte Begriffe",
    "term.metadata.related.help":
      "(Optional) verwandter Begriff (ohne Angaben zur Art der Beziehung zu machen). ",
    "term.metadata.vocabulary.tooltip":
      "Vokabular, zu dem dieser Begriff gehört",
    "term.metadata.related.tab.title": "Weitere verwandte Begriffe",
    "term.metadata.related.ontologically": "Ontologisch",
    "term.metadata.related.definitionally": "Definitiv",
    "term.metadata.related.definitionally.targeting":
      "Begriffe, die in der Definition dieses Begriffs vorkommen",
    "term.metadata.related.definitionally.of":
      "Begriffe, in deren Definition dieser Begriff vorkommt",
    "term.metadata.related.ontologically.tooltip":
      "Begriffe, die über ausgewählte ontologische Beziehungen mit diesem Begriff in Zusammenhang stehen.",
    "term.metadata.related.definitionally.tooltip":
      "Begriffe, die über die Definition mit diesem Begriff in Zusammenhang stehen.",
    "term.metadata.related.definitionally.suggested":
      "Das Vorkommen wurde durch eine automatische Analyse des Definitionstextes identifiziert und nicht genehmigt",
    "term.metadata.comments.public.title": "Öffentliche Diskussion",
    "term.metadata.status.help":
      "Der Begriffsstatus stellt verschiedene Phasen des Lebenszyklus des Begriffs dar, von seiner Einführung bis zu seiner möglichen Einstellung (z. B. weil er durch einen anderen Begriff ersetzt wurde).",
    "term.metadata.status.terminal.help":
      "Der Begriff befindet sich in einem Endzustand, was bedeutet, dass er nicht mehr verwendet werden sollte.",
    "term.metadata.notation.label": "Notation",
    "term.metadata.notation.help":
      '(Optional) Eine Notation ist eine Zeichenfolge wie "UBA" oder "L2-3", die zur eindeutigen Identifizierung eines Begriffs im Rahmen eines bestimmten Glossars verwendet wird. ',
    "term.metadata.example.label": "Beispiel",
    "term.metadata.example.help":
      "(Optional) Liefert ein Beispiel für die Verwendung eines Konzepts.",
    "term.metadata.types.select.placeholder": "Typ auswählen",
    "term.metadata.validation.title": "Validierung",
    "term.metadata.validation.empty": "Der Begriff ist unproblematisch.",
    "term.metadata.relationshipAnnotation": "Beziehung annotieren",
    "term.metadata.relationshipAnnotation.save.success":
      "Beziehungsannotation des Terms wurde erfolgreich gespeichert",
    "term.metadata.annotatedRelationships": "Annotierte Beziehungen",
    "term.metadata.annotatedRelationships.help":
      "Beziehungen, die an diesem Begriff annotiert wurden",
    "term.metadata.annotatedRelationships.empty":
      "Keine Beziehungen annotiert.",
    "term.removed.message": "Begriff erfolgreich entfernt.",
    "term.badge.score.tooltip": "Der Wert dieses Begriffs beträgt {score} %. ",
    "term.badge.no-score.tooltip": "Für diesen Begriff ist kein Wert verfügbar",

    "glossary.title": "Bedingungen",
    "glossary.termCount.tooltip":
      "Anzahl der Begriffe im Vokabular (ohne importierte Vokabeln)",
    "glossary.new": "Neuer Begriff",
    "glossary.select.placeholder":
      "Beginnen Sie mit der Eingabe, um Begriffe nach Bezeichnung zu filtern",
    "glossary.excludeImported": "Exklusive importierter Begriffe",
    "glossary.excludeImported.help":
      "Begriffe aus importierten Vokabularen werden in dieser Ansicht ausgeblendet. Klicken Sie, um sie anzuzeigen.",
    "glossary.includeImported": "Inklusive importierter Begriffe",
    "glossary.includeImported.help":
      "Begriffe aus importierten Vokabeln werden in dieser Ansicht einbezogen. Klicken Sie, um sie auszublenden.",
    "glossary.importedIncluded": "mit importierten",
    "glossary.importedExcluded": "ohne importierte",
    "glossary.importedTerm.tooltip": "Aus dem Vokabular importiert",
    "glossary.showTerminal": "Deaktivierte Begriffe einschließen",
    "glossary.showNonTerminal": "Nur aktive",
    "glossary.showTerminal.help": "Zeigt auch deaktivierte Begriffe an. ",
    "glossary.showNonTerminal.help": "Zeigt nur aktive Begriffe an.",
    "glossary.showTreeList": "Baumstruktur",
    "glossary.showTreeList.help":
      "Begriffe werden in einer Baumstruktur angezeigt, die die hierarchischen Beziehungen zwischen Begriffen zeigt.",
    "glossary.showFlatList": "Flache Liste",
    "glossary.showFlatList.help":
      "Begriffe werden in einer flachen Liste angezeigt, die die hierarchischen Beziehungen zwischen Begriffen nicht zeigt.",
    "glossary.unusedTerm.tooltip":
      "Begriff, der in einem Dokument nicht vorkommt",
    "glossary.createTerm": "Neuen Begriff erstellen",
    "glossary.createTerm.tooltip":
      "Erstellen Sie einen Begriff für ein neues Vokabular",
    "glossary.createTerm.text": "Erstellen",
    "glossary.createTerm.breadcrumb": "Begriff erstellen",
    "glossary.form.header": "Begriff erstellen",
    "glossary.form.tooltipLabel": "Haben Sie Ihren Begriff nicht gefunden? ",
    "glossary.form.field.parent": "Übergeordneter Begriff",
    "glossary.form.field.source": "Begriffsquelle",
    "glossary.form.field.type": "Begriffstyp",
    "glossary.form.button.addType": "Begriffstyp hinzufügen",
    "glossary.form.button.removeType": "Begriffstyp entfernen",
    "glossary.form.button.submit": "Erstellen",
    "glossary.form.button.submitAndGoToNewTerm":
      "Erstellen und noch einen Begriff hinzufügen",
    "glossary.form.button.cancel": "Abbrechen",
    "glossary.form.validation.validateLengthMin5":
      "Die Eingabe muss mindestens 5 Zeichen lang sein",
    "glossary.form.validation.validateLengthMin3":
      "Die Eingabe muss mindestens 3 Zeichen lang sein",
    "glossary.form.validation.validateNotSameAsParent":
      "Die untergeordnete Option darf nicht mit der übergeordneten Option identisch sein",
    "file.text-analysis.finished.message":
      "Textanalyse erfolgreich abgeschlossen.",
    "file.text-analysis.failed": "Textanalyse fehlgeschlagen: {message}",
    "file.metadata.startTextAnalysis": "Starten Sie die Textanalyse",
    "file.metadata.startTextAnalysis.text": "Textanalyse starten",
    "file.metadata.startTextAnalysis.vocabularySelect.title":
      "Wählen Sie Vokabulare für die automatische Textanalyse aus",
    "file.content.upload.success":
      'Inhalt der Datei "{fileName}" erfolgreich hochgeladen.',
    "file.annotate.selectVocabulary":
      "Das Vokabular zum Kommentieren dieser Datei kann nicht ermittelt werden. ",
    "file.upload": "Hochladen",
    "file.upload.hint": "Maximale Dateigröße: {maxUploadFileSize}. ",
    "file.upload.size.exceeded": "Die Datei ist zu groß.",
    "file.language": "Sprache des Dateiinhalts",
    "dataset.license": "Lizenz",
    "dataset.format": "Format",
    "statistics.vocabulary.count": "Vokabular zählen",
    "statistics.term.count": "Begriffsanzahl",
    "statistics.user.count": "Benutzeranzahl",
    "statistics.notFilled": "Nicht befüllt",
    "statistics.types.frequency": "Begriffstypen",
    "statistics.types.frequency.empty":
      "Es gibt kein Vokabular oder vorhandene Vokabulare enthalten keine Begriffe. ",
    "fullscreen.exit": "Beenden Sie den Vollbildmodus",
    "fullscreen.enter": "Geben Sie den Vollbildmodus ein",
    "search.title": "Suchen",
    "search.tab.dashboard": "Dashboard",
    "search.tab.everything": "Suche in allen Assets",
    "search.tab.terms": "Bedingungen",
    "search.tab.terms.filter.allVocabularies": "Alle Vokabulare",
    "search.tab.vocabularies": "Vokabulare",
    "search.tab.facets": "Facettierte Begriffssuche",
    "search.reset": "Suche zurücksetzen",
    "search.results.title": 'Ergebnisse für "{searchString}"',
    "search.no-results": "Keine Ergebnisse gefunden.",
    "search.results.countInfo":
      "Es wurden {matches} Übereinstimmungen in {assets}-Assets gefunden.",
    "search.results.table.label": "Label",
    "search.results.table.label.tooltip": "Öffnen Sie die Asset-Details",
    "search.results.table.match": "Übereinstimmung",
    "search.results.table.score": "Anzahl der Übereinstimmungen",
    "search.results.field": "Übereinstimmung im Attribut gefunden:",
    "search.results.field.label": "Label",
    "search.results.field.comment": "Kommentar",
    "search.results.field.definition": "Definition",
    "search.results.vocabulary.from": "aus",
    "search.results.facetedLink": "Versuchen Sie es mit {link}.",
    "search.faceted.matchType.exact": "Genaue Übereinstimmung",
    "search.faceted.matchType.substring": "Teilzeichenfolge",
    "search.faceted.no-results":
      "Für die angegebenen Parameter wurden keine weiteren Ergebnisse gefunden.",
    "search.faceted.relationshipAnnotation":
      "Beziehung annotiert durch Begriff",
    "profile.first.name": "Vorname",
    "profile.last.name": "Nachname",
    "profile.legend.invalid.name":
      "Die Eingabe muss mindestens 1 Zeichen lang sein",
    "profile.updated.message": "Profil erfolgreich aktualisiert",
    "profile.change-password": "Kennwort ändern",
    "change-password.current.password": "Aktuelles Passwort",
    "change-password.new.password": "Neues Passwort",
    "change-password.confirm.password": "Passwort bestätigen",
    "change-password.updated.message": "Passwort erfolgreich aktualisiert",
    "change-password.passwords.differ.tooltip":
      "Altes und neues Passwort dürfen nicht identisch sein.",
    annotator: "Kommentator",
    "annotator.content.loading": "Dateiinhalt wird geladen...",
    "annotator.download.thisFile": "Diese Datei",
    "annotator.download.original": "Original",
    "annotator.download.withoutUnconfirmed": "Ohne unbestätigte Vorkommnisse",
    "annotator.vocabulary": "Verwendet Begriffe aus dem Vokabular",
    "annotator.selectionPurpose.dialog.title":
      "Was möchten Sie mit dem ausgewählten Text machen?",
    "annotator.selectionPurpose.create": "Begriff erstellen",
    "annotator.selectionPurpose.occurrence": "Vorkommen des Begriffs markieren",
    "annotator.selectionPurpose.definition": "Begriffsdefinition markieren",
    "annotator.createTerm.button": "Neu",
    "annotator.createTerm.selectDefinition": "Definition auswählen",
    "annotator.createTerm.selectDefinition.tooltip":
      "Blenden Sie dieses Dialogfeld aus und wählen Sie die Begriffsdefinition im Text aus",
    "annotator.createTerm.selectDefinition.message":
      "Wählen Sie die Definition des neuen Begriffs im Text aus.",
    "annotator.setTermDefinitionSource.success":
      'Definitionsquelle des Begriffs "{term}" erfolgreich festgelegt.',
    "annotator.setTermDefinitionSource.error.exists":
      'Der Begriff "{term}" verfügt bereits über eine Definitionsquelle.',
    "annotator.setTermDefinition.title":
      'Definition des Begriffs "{term}" auswählen',
    "annotator.findAnnotation.error":
      "Anmerkung konnte nicht hervorgehoben werden.",
    "annotator.tutorial.title": "Anleitung",
    "annotator.tutorial.tooltip":
      "Sehen Sie sich eine Seite mit einer Anleitung zur Verwendung des Kommentators an",
    "annotator.highlight.button.label": "Finden",
    "annotator.highlight.button.active.tooltip":
      'Vorkommen des Begriffs "{term}" hervorheben',
    "annotator.highlight.button.inactive.tooltip":
      "Kein Begriff zum Hervorheben ausgewählt",
    "annotator.highlight.selector.title": "Finden Sie Vorkommen des Begriffs",
    "annotator.highlight.selector.label":
      "Wählen Sie den Begriff aus, dessen Vorkommen hervorgehoben werden soll",
    "annotator.highlight.countInfo":
      "In diesem Dokument wurden {count, plural, one {# occurrence} other {# occurrences}} gefunden.",
    "annotator.legend.annotationHidingHint":
      "Sie können die Hervorhebung des Vorkommens des Begriffs ein-/ausblenden, indem Sie auf das Legendenelement klicken.",
    "annotator.legend.activeFilter.tooltip":
      "Einige hervorgehobene Vorkommen von Begriffen werden ausgeblendet.",
    "annotation.form.suggested-occurrence.message":
      "Phrase ist keinem Wortschatzbegriff zugeordnet.",
    "annotation.form.invalid-occurrence.message":
      'Begriff "{term}" nicht im Vokabular gefunden.',
    "annotation.form.assigned-occurrence.termInfoLabel": "Begriffsinfo:",
    "annotation.term.assigned-occurrence.termLabel": "Zugeordneter Begriff:",
    "annotation.term.occurrence.scoreLabel": "Wert:",
    "annotation.term.select.placeholder":
      "Beginnen Sie mit der Eingabe, um nach relevanten Begriffen zu suchen",
    "annotation.confirm":
      "Bestätigen Sie den Vorschlag zum Vorkommen des Begriffs",
    "annotation.save": "Vorkommen des Begriffs speichern",
    "annotation.edit": "Vorkommen des Begriffs bearbeiten",
    "annotation.remove": "Vorkommen des Begriffs entfernen",
    "annotation.close": "Schließen",
    "annotation.occurrence.title": "Begriffsvorkommen",
    "annotation.definition.title": "Quelle der Begriffsdefinition",
    "annotation.definition.term": "Begriff:",
    "annotation.definition.definition": "Definition:",
    "annotation.definition.exists.message":
      'Der Begriff "{term}" hat bereits eine Definition. ',
    "annotation.definition.original": "Ursprüngliche Definition",
    "annotation.definition.new": "Neue Definition",
    "annotator.legend.title": "Legende",
    "annotator.legend.confirmed.unknown.term":
      "Vorkommen eines unbekannten Begriffs",
    "annotator.legend.confirmed.unknown.term.tooltip":
      "Das Vorkommen des Begriffs wurde von einem Benutzer erstellt oder akzeptiert, ihm wurde jedoch noch kein Vokabularbegriff zugewiesen.",
    "annotator.legend.confirmed.existing.term":
      "Vorkommen eines bestehenden Begriffs",
    "annotator.legend.confirmed.existing.term.tooltip":
      "Das Vorkommen eines bekannten Begriffs wurde von einem Benutzer erstellt oder akzeptiert.",
    "annotator.legend.proposed.unknown.term":
      "Vorgeschlagenes Eintreten eines neuen Begriffs",
    "annotator.legend.proposed.unknown.term.tooltip":
      "Das Vorkommen eines möglichen neuen Begriffs wurde vom Textanalysedienst erkannt, von einem Benutzer jedoch noch nicht akzeptiert.",
    "annotator.legend.proposed.existing.term":
      "Vorgeschlagenes Vorkommen eines bestehenden Begriffs",
    "annotator.legend.proposed.existing.term.tooltip":
      "Das Vorkommen eines bekannten Begriffs wurde vom Textanalysedienst identifiziert.",
    "annotator.legend.definition.pending":
      "Definition eines unbekannten Begriffs",
    "annotator.legend.definition.pending.tooltip":
      "Die Begriffsdefinition wurde von einem Benutzer markiert, aber noch keinem Vokabularbegriff zugeordnet.",
    "annotator.legend.definition": "Begriffsdefinition",
    "annotator.legend.definition.tooltip":
      "Definition eines bekannten Begriffs, der von einem Benutzer erstellt wurde.",
    "annotator.unknown.unauthorized": "Begriff nicht ausgewählt.",
    "message.welcome": "Willkommen bei TermIt!",
    "link.external.title": "{url} – in einem neuen Browser-Tab öffnen",
    "properties.edit.title": "Zusätzliche Eigenschaften",
    "properties.empty": "Es gibt hier keine zusätzlichen Eigenschaften.",
    "properties.edit.remove": "Entfernen Sie diesen Eigenschaftswert",
    "properties.edit.remove.text": "Entfernen",
    "properties.edit.property": "Eigenschaft",
    "properties.edit.property.select.placeholder": "Eigenschaft auswählen",
    "properties.edit.value": "Wert",
    "properties.edit.add.title": "Der Eigenschaft einen Wert hinzufügen",
    "properties.edit.add.text": "Hinzufügen",
    "properties.edit.new": "Eigenschaft erstellen",
    "properties.edit.new.iri": "Ressourcenkennung",
    "properties.edit.new.label": "Label",
    "properties.edit.new.comment": "Kommentar",
    "properties.edit.new.success": "Neues Attribut erfolgreich erstellt.",
    "type.asset": "Asset",
    "type.term": "Begriff",
    "type.term.relationship": "Term-Beziehung",
    "type.vocabulary": "Vokabular",
    "type.resource": "Ressource",
    "type.document": "Dokument",
    "type.file": "Datei",
    "type.dataset": "Datensatz",
    "type.document.vocabulary": "Dokumentenvokabular",
    "type.user": "Benutzer",
    "type.usergroup": "Benutzergruppe",
    "type.userrole": "Benutzerrolle",
    "datatype.string": "Zeichenfolge",
    "datatype.integer": "Ganzzahl",
    "datatype.resource": "Ressource (IRI/URI/URL)",
    "log-viewer.title": "Protokoll",
    "log-viewer.timestamp": "Zeitstempel",
    "log-viewer.error": "Fehler",
    "log-viewer.clear": "Protokoll löschen",
    "error.vocabulary.update.imports.danglingTermReferences":
      "Vokabularimport(e) können nicht entfernt werden, es gibt immer noch Verweise zwischen Begriffen aus diesem Vokabular und dem importierten (oder einem seiner Importe).",
    "error.file.maxUploadSizeExceeded":
      "Die Datei konnte nicht hochgeladen werden, da sie die konfigurierte maximale Dateigrößenbeschränkung überschreitet.",
    "error.term.state.terminal.liveChildren":
      "Der Begriff kann nicht deaktiviert werden, wenn es mindestens einen Unterbegriff im aktiven Zustand hat.",
    "error.vocabulary.import.excel.duplicateIdentifier":
      "Die Excel-Datei enthält mehrere Begriffe mit derselben Kennung.",
    "error.vocabulary.import.excel.duplicateLabel":
      "Die Excel-Datei enthält mehrere Begriffe mit derselben Bezeichnung.",
    "error.vocabulary.import.excel.labelWithDifferentIdentifierExists":
      'Das Vokabular enthält bereits einen Begriff mit der Bezeichnung "{label}" und einem anderen Bezeichner als dem importierten. ',
    "error.term.remove.annotationsExist":
      "Der Begriff kann nicht gelöscht werden. ",
    "error.term.remove.hasSubTerms": "Der Begriff kann nicht gelöscht werden. ",
    "error.term.remove.skosRelationshipsExist":
      "Der Begriff kann nicht gelöscht werden. ",
    "error.invalidUriCharacter":
      'Ungültiger Bezeichner: "{uri}", unerwartetes Zeichen "{char}" bei {index}.',
    "error.invalidIdentifier": 'Ungültiger Bezeichner: "{uri}"',
    "error.annotation.file.unsupportedLanguage":
      "Der Textanalysedienst unterstützt die Sprache dieser Datei nicht.",
    "error.annotation.term.unsupportedLanguage":
      "Der Textanalysedienst unterstützt die Sprache der Definition dieses Begriffs nicht.",
    "history.label": "Verlauf ändern",
    "history.loading": "Verlauf wird geladen...",
    "history.empty":
      "Der aufgezeichnete Verlauf dieses Vermögenswerts ist leer.",
    "history.whenwho": "Herkunft",
    "history.type": "Typ",
    "history.type.persist": "Erzeugung",
    "history.type.update": "Aktualisierung",
    "history.type.delete": "Streichung",
    "history.changedAttribute": "Attribut",
    "history.originalValue": "Ursprünglicher Wert",
    "history.newValue": "Neuer Wert",
    "changefrequency.label": "Aktivität",
    "tooltip.copy-iri": "IRI kopieren",
    "tooltip.copied": "Kopiert!",
    "table.filter.text.placeholder": "Filtern Sie {count} Datensätze...",
    "table.filter.select.all": "Alle",
    "table.sort.tooltip": "Sortieren",
    "table.paging.first.tooltip": "Gehen Sie zur ersten Seite",
    "table.paging.previous.tooltip": "Gehen Sie zur vorherigen Seite",
    "table.paging.next.tooltip": "Gehen Sie zur nächsten Seite",
    "table.paging.last.tooltip": "Gehen Sie zur letzten Seite",
    "table.paging.pageSize.select": "Zeigt {pageSize} Elemente pro Seite an",
    "table.paging.pageSize.select.all": "Alle anzeigen",
    "stringlistedit.button.add": "Hinzufügen",
    "stringlistedit.button.add.tooltip":
      "Klicken Sie, um den eingegebenen Wert zur Liste hinzuzufügen",
    "stringlistedit.button.remove": "Entfernen",
    "stringlistedit.button.remove.tooltip": "Wert entfernen",
    "public.nav.user":
      "Benutzer nicht angemeldet. Klicken Sie hier, um sich anzumelden.",
    "public.dashboard.title": "Willkommen bei TermIt!",
    "public.dashboard.intro":
      "TermIt ist ein benutzerfreundlicher Vokabularmanager und Terminologieeditor.",
    "public.dashboard.actions.login": "Einloggen",
    "public.dashboard.actions.register": "Benutzerkonto erstellen",
    "public.dashboard.actions.vocabularies":
      "Durchsuchen Sie Vokabulare und Begriffe",
    "comments.title": "Kommentare",
    "comments.create.placeholder": "Geben Sie Ihren Kommentar ein...",
    "comments.create.submit.title": "Absenden",
    "comments.list.empty": "Noch keine Kommentare.",
    "comments.comment.like": "Ich stimme diesem Kommentar zu",
    "comments.comment.like.on": "Zustimmung entfernen",
    "comments.comment.dislike": "Ich lehne diesen Kommentar ab",
    "comments.comment.dislike.on": "Ablehnung entfernen",
    "comments.comment.edited": "Bearbeitet",
    "validation.message.tooltip":
      "Dies ist ein Ergebnis der Qualitätsüberprüfung. ",
    "snapshots.title": "Snapshot-Verlauf",
    "snapshots.created": "Snapshot erstellt",
    "snapshots.show": "Snapshot anzeigen",
    "snapshots.empty": "Keine vorherigen Snapshots gefunden.",
    "snapshot.message":
      "Dieser { type } ist ein Snapshot und schreibgeschützt. ",
    "snapshot.remove.confirm.title": "Snapshot entfernen?",
    "snapshot.remove.confirm.text.no-related":
      "Möchten Sie diesen Snapshot wirklich entfernen?",
    "snapshot.remove.confirm.text":
      "Möchten Sie diesen Snapshot wirklich entfernen? ",
    "snapshot.removed.message": "Revision entfernt.",
    "snapshot.label.short": "Snapshot von",
    "auth.action.unauthorized":
      "Sie verfügen nicht über ausreichende Rechte für diese Aktion.",
    "auth.view.unauthorized":
      "Sie verfügen nicht über ausreichende Rechte, um dies anzuzeigen.",
    "auth.notEditable.message.readOnly":
      "Dieser { type } ist schreibgeschützt.",
    "longrunningtasks.description": "Das System läuft derzeit:",
    "longrunningtasks.state.done": "Beeendet",
    "longrunningtasks.state.pending": "Ausstehend",
    "longrunningtasks.state.running": "Laufend",
    "longrunningtasks.name.termDefinitionAnalysis":
      "Analyse einer Begriffsdefinition",
    "longrunningtasks.name.allTermsVocabularyAnalysis":
      "Analyse von Begriffen in einem Vokabular",
    "longrunningtasks.name.allVocabulariesAnalysis": "Analyse aller Vokabulare",
    "longrunningtasks.name.fileAnalysis": "Analyse einer Datei",
    "longrunningtasks.name.vocabularyValidation": "Vokabularüberprüfung",
    "longrunningtasks.name.documentAnnotationGeneration":
      "Erstellung einer Dateianmerkung",
    "longrunningtasks.name.restoreBackup": "Wiederherstellung von Sicherung",
  },
};

export default de;
