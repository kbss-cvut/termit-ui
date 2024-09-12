import Constants from "../util/Constants";

const cs = {
  locale: Constants.LANG.CS.locale,
  messages: {
    "please-wait": "Prosím, čekejte...",
    create: "Vytvořit",
    save: "Uložit",
    cancel: "Zrušit",
    "not-implemented": "Zatím není naimplementováno!",
    edit: "Upravit",
    remove: "Odstranit",
    moreActions: "Další akce",
    required: "Povinné",
    optional: "Nepovinné",
    actions: "Akce",
    description: "Popis",
    submit: "Předložit",
    approve: "Schválit",
    "basic-information": "Základní informace",
    "created-info": "Vytvořeno uživatelem {author} dne {date}",
    "select.placeholder": "Vyberte...",
    "select.loading": "Načítání...",
    "help.title": "Nápověda",
    "multilingual.title": "Hodnotu atributu lze vyplnit ve více jazycích",
    "input.markdown": "Můžete použít formátování Markdown.",

    "connection.error": "Nepodařilo se navázat spojení se serverem.",
    "ajax.unparseable-error":
      "Akce selhala. Server odpověděl neznámou chybou. Více informací lze nalézt v konzoli prohlížeče.",
    "ajax.failed": "Nepodařilo se načíst data ze serveru.",

    "footer.copyright": "KBSS FEL ČVUT v Praze",
    "footer.version": "Verze",
    "footer.version.tooltip": "Verze aplikace. Kliknutím zobrazíte popis změn.",
    "footer.apidocs": "API",
    "footer.apidocs.tooltip": "Dokumentace serverového rozhraní.",

    "news-viewer.title": "Novinky",

    "auth.redirect-message":
      "Za moment budete přesměrováni na autorizační službu.",
    "auth.unavailable-message":
      "Autorizační služba bohužel není dostupná. Kontaktujte, prosím, správce systému.",

    "login.title": "Přihlášení",
    "login.subtitle": "Pro pokračování se prosím přihlašte",
    "login.username": "Uživatelské jméno",
    "login.username.placeholder": "Zadejte uživatelské jméno",
    "login.password": "Heslo",
    "login.password.placeholder": "Zadejte heslo",
    "login.submit": "Přihlásit se",
    "login.register": "Registrace",
    "login.register.label": "Nemáte zatím účet? <a>Zaregistrujte se</a>",
    "login.forgotPassword.label": "<a>Zapomněli jste heslo?</a>",
    "login.error": "Přihlášení se nezdařilo.",
    "login.progress-mask": "Přihlašuji...",
    "login.locked": "Účet je zablokován.",
    "login.disabled": "Účet byl deaktivován.",
    "login.public-view-link": "Nebo si <a>prohlédněte</a> slovníky a pojmy",

    "register.title": "Nový uživatel",
    "register.subtitle": "Pro pokračování se prosím zaregistrujte",
    "register.first-name": "Jméno",
    "register.last-name": "Příjmení",
    "register.username": "Uživatelské jméno",
    "register.username.help": "Zadejte emailovou adresu",
    "register.password": "Heslo",
    "register.password-confirm": "Potvrzení hesla",
    "register.passwords-not-matching.tooltip":
      "Heslo a jeho potvrzení se neshodují.",
    "register.submit": "Zaregistrovat se",
    "register.mask": "Registruji...",
    "register.error": "Uživatele se nepodařilo zaregistrovat.",
    "register.login": "Přihlásit se",
    "register.login.error":
      "Nepodařilo se přihlásit k nově vytvořenému uživateli.",
    "register.login.label": "Již máte účet? <a>Přihlaste se</a>",
    "register.username-exists.tooltip": "Uživatelské jméno již existuje",
    "register.username.notValidEmail":
      "Uživatelské jméno musí být emailovou adresou",

    "forgotPassword.title": "Zapomenuté heslo",
    "forgotPassword.mask": "Odesílám...",
    "forgotPassword.login.label": "Zpět na <a>Přihlášení</a>",
    "forgotPassword.username": "Uživatelské jméno",
    "forgotPassword.username.placeholder": "Zadejte uživatelské jméno",
    "forgotPassword.username.notValidEmail":
      "Uživatelské jméno musí být emailovou adresou",
    "forgotPassword.submit": "Odeslat email pro obnovení hesla",
    "forgotPassword.success": "Email odeslán",

    "resetPassword.passwordsNotEqual": "Heslo a jeho potvrzení se neshodují.",
    "resetPassword.mask": "Měním heslo...",
    "resetPassword.title": "Změna hesla",
    "resetPassword.login.label": "Zpět na <a>Přihlášení</a>",
    "resetPassword.password": "Nové heslo",
    "resetPassword.password.placeholder": "Zvolte si nové heslo",
    "resetPassword.password.confirm": "Potvrzení hesla",
    "resetPassword.submit": "Změnit heslo",
    "resetPassword.success": "Heslo změněno",
    "resetPassword.invalidToken":
      "Neplatný nebo expirovaný odkaz pro změnu hesla. Zažádejte o změnu hesla znovu.",

    "createPassword.passwordsNotEqual": "Heslo a jeho potvrzení se neshodují.",
    "createPassword.mask": "Vytvářím heslo...",
    "createPassword.title": "Vytvoření hesla",
    "createPassword.password": "Nové heslo",
    "createPassword.password.placeholder": "Zvolte si nové heslo",
    "createPassword.password.confirm": "Potvrzení hesla",
    "createPassword.submit": "Vytvořit heslo",
    "createPassword.success": "Heslo vytvořeno",
    "createPassword.invalidToken":
      "Neplatný nebo expirovaný odkaz pro vytvoření hesla. Zažádejte o nový odkaz.",

    "main.nav.dashboard": "Hlavní strana",
    "main.nav.vocabularies": "Slovníky",
    "main.nav.statistics": "Statistiky",
    "main.nav.search": "Vyhledávání",
    "main.nav.searchTerms": "Vyhledávání pojmů",
    "main.nav.searchVocabularies": "Vyhledávání slovníků",
    "main.nav.facetedSearch": "Facetové vyhledávání",
    "main.nav.admin": "Administrace",
    "main.nav.create-vocabulary": "Nový slovník",
    "main.nav.import-vocabulary": "Importovat slovník",
    "main.user-profile": "Profil uživatele",
    "main.logout": "Odhlásit se",
    "main.search.placeholder": "Hledat",
    "main.search.tooltip": "Přejít na stránku hledání",
    "main.search.count-info-and-link":
      "Zobrazeno {displayed} z {count} výsledků. Zobrazit všechny.",
    "main.search.no-results":
      "Zadanému výrazu neodpovídá žádný výsledek. Kliknutím vyzkoušíte facetové hledání.",
    "main.lang-selector.tooltip": "Vyberte jazyk uživatelského rozhraní",

    "dashboard.widget.assetList.empty":
      "Pro tuto část nebyly nalezeny žádné záznamy.",
    "dashboard.widget.assetList.new.tooltip": "Nové od Vaší poslední návštěvy.",
    "dashboard.widget.assetList.lastEditMessage":
      "{operation, select, edit {Upraven} other {Vytvořen}} uživatelem {user} {when}.",
    "dashboard.widget.assetList.lastEditMessageByYou":
      "{operation, select, edit {Upraven} other {Vytvořen}} Vámi {when}.",
    "dashboard.widget.lastEditedAssets.title": "Naposledy upravené záznamy",
    "dashboard.widget.lastEditedAssets.all.title": "Všechny",
    "dashboard.widget.lastEditedAssets.mine.title": "Moje",
    "dashboard.widget.lastEditedAssets.lastEditDate":
      "Naposledy upraven/vytvořen",
    "dashboard.widget.typeFrequency.title": "Počet pojmů ve slovníku",
    "dashboard.widget.alert.news":
      "TermIt má novou verzi {version}. Podívejte se, co je nového, klikem na verzi v pravém dolním rohu aplikace.",
    "dashboard.widget.donut.total-terms": "Celkem pojmů",
    "dashboard.widget.commentList.empty":
      "Zde uvidíte naposledy komentované pojmy.",
    "dashboard.widget.commentList.lastComment": "Poslední komentář pojmu.",
    "dashboard.widget.commentList.myLastComment": "...",
    "dashboard.widget.commentList.message": "{when} uživatelem {user} .",
    "dashboard.widget.commentList.messageByYou": "{when} Vámi .",
    "dashboard.widget.lastCommentedAssets.title": "Naposledy komentované pojmy",
    "dashboard.widget.lastCommentedAssets.all.title": "Všechny",
    "dashboard.widget.lastCommentedAssets.mine.title": "Moje",
    "dashboard.widget.lastCommentedAssets.inReactionToMine.title":
      "S reakcí na můj komentář",
    "dashboard.widget.lastCommentedAssets.byMe.title": "S mým komentářem",

    "unauthorized.message": "K této části aplikace nemáte přístup.",

    "administration.users": "Uživatelé",
    "administration.users.name": "Jméno",
    "administration.users.username": "Uživatelské jméno",
    "administration.users.status": "Status",
    "administration.users.status.locked": "Zablokovaný",
    "administration.users.status.locked.help":
      "Uživatelský účet byl zablokován z důvodu příliš mnoha neúspěšných pokusů o přihlášení, nebo účet vyčkává na nastavení nového hesla uživatelem. Uživatel se nemůže znovu přihlásit, dokud si heslo neobnoví, nebo mu administrátor nenastaví nové heslo.",
    "administration.users.status.disabled": "Neaktivní",
    "administration.users.status.disabled.help":
      "Uživatelský účet byl deaktivován administrátorem a nelze se pod ním přihlásit.",
    "administration.users.status.active": "Aktivní",
    "administration.users.status.active.help":
      "Uživatelský účet je aktivní a lze se pod ním normálně přihlásit.",
    "administration.users.status.action.enable": "Aktivovat",
    "administration.users.status.action.enable.tooltip":
      "Aktivovat tohoto uživatele",
    "administration.users.status.action.enable.success":
      "Uživatel {name} aktivován.",
    "administration.users.status.action.disable": "Deaktivovat",
    "administration.users.status.action.disable.tooltip":
      "Deaktivovat tohoto uživatele",
    "administration.users.status.action.disable.success":
      "Uživatel {name} deaktivován.",
    "administration.users.status.action.unlock": "Odblokovat",
    "administration.users.status.action.unlock.tooltip":
      "Odblokovat tohoto uživatele",
    "administration.users.status.action.unlock.success":
      "Uživatel {name} odblokován.",
    "administration.users.status.action.changeRole.success":
      "Role byla změněna.",
    "administration.users.unlock.title": "Odblokovat uživatele {name}",
    "administration.users.unlock.password": "Nové heslo",
    "administration.users.unlock.passwordConfirm": "Potvrzení nového hesla",
    "administration.users.action.changerole.tooltip":
      "Změnit roli vybraného uživatele",
    "administration.users.action.changerole": "Změnit roli",
    "administration.users.roles.edit.title": 'Role uživatele "{name}"',
    "administration.users.role": "Role",
    "administration.users.role.managedAssetsNotEmpty":
      "Uživatel je správcem následujících slovníků. Než budete moci omezit jeho roli, je třeba mu správcovství odebrat.",
    "administration.users.create": "Přidat uživatele",
    "administration.users.create.tooltip":
      "Umožňuje vytvořit nový uživatelský účet",
    "administration.users.create.title": "Nový uživatel",
    "administration.users.create.created":
      'Uživatel "{name}" úspěšně vytvořen.',
    "administration.users.you": "Toto je Váš účet",
    "administration.users.types.admin": "Tento uživatel je administrátor",
    "administration.users.oidc":
      "Pro správu uživatelů je využívána externí autentizační služba.",
    "administration.users.create.password-toggle.user":
      "Poslat aktivační email",
    "administration.users.create.password-toggle.admin": "Zadat heslo nyní",
    "administration.users.create.password-toggle.tooltip.user":
      "Novému uživateli bude zaslán email s odkazem pro vytvoření nového hesla.",
    "administration.users.create.password-toggle.tooltip.admin":
      "Heslo pro nového uživatele zadejte nyní.",
    "administration.users.create.submit": "Vytvořit uživatele",
    "administration.maintenance.title": "Správa systému",
    "administration.maintenance.invalidateCaches": "Vyprázdnit cache",
    "administration.maintenance.invalidateCaches.tooltip":
      "Vyprázdnit interní cache systému",
    "administration.maintenance.invalidateCaches.success":
      "Cache úspěšně vyprázdněna.",
    "administration.groups": "Uživatelské skupiny",
    "administration.groups.create": "Vytvořit skupinu",
    "administration.groups.create.tooltip":
      "Umožňuje vytvořit novou uživatelskou skupinu",
    "administration.groups.create.success": "Skupina byla úspěšně vytvořena.",
    "administration.groups.remove.type": "uživatelskou skupinu",
    "administration.groups.remove.success": "Skupina byla úspěšně odstraněna.",
    "administration.groups.update": "Upravit skupinu",
    "administration.groups.update.success": "Skupina byla úspěšně upravena.",
    "administration.groups.label.invalid": "Název skupiny nesmí být prázdný.",
    "administration.groups.members": "Členové skupiny",

    "asset.link.tooltip": "Zobrazit detail záznamu",
    "asset.iri": "Identifikátor",
    "asset.create.iri.help":
      "Identifikátor záznamu ve formě Internationalized Resource Identifier (IRI). Identifikátor " +
      "bude vygenerován automaticky na základě názvu. Můžete ho však též zadat ručně.",
    "asset.label": "Název",
    "asset.label.placeholder": "Zadejte název",
    "asset.create.button.text": "Vytvořit",
    "asset.author": "Autor",
    "asset.created": "Vytvořeno",
    "asset.create.showAdvancedSection": "Zobrazit pokročilé možnosti",
    "asset.create.hideAdvancedSection": "Skrýt pokročilé možnosti",
    "asset.remove.tooltip": "Odstranit tento záznam",
    "asset.remove.dialog.title": 'Odstranit {type} "{label}"?',
    "asset.modify.dialog.title": 'Upravit {type} "{label}"',
    "asset.remove.dialog.text": 'Určitě chcete odstranit {type} "{label}"?',

    "document.remove.tooltip.disabled":
      "Odstranit dokument je možné po odstranění všech jeho souborů.",

    "vocabulary.management": "Správa slovníků",
    "vocabulary.management.vocabularies": "Slovníky",
    "vocabulary.management.empty":
      "Žádné slovníky nenalezeny. Vytvořte nějaký...",
    "vocabulary.management.startTextAnalysis.title":
      "Spustit textovou analýzu definic všech termínů ve všech slovnících",
    "vocabulary.management.new": "Nový slovník",
    "vocabulary.vocabularies.create.tooltip": "Vytvořit nový slovník",
    "vocabulary.vocabularies.import.tooltip": "Vytvořit slovník importem dat",
    "vocabulary.vocabularies.select.placeholder":
      "Začněte psát pro filtrování slovníků dle názvu",
    "vocabulary.title": "Název",
    "vocabulary.create.title": "Nový slovník",
    "vocabulary.create.submit": "Vytvořit",
    "vocabulary.create.files": "Soubory",
    "vocabulary.create.files.help":
      "Nepovinné. Můžete připojit soubory (např. texty zákonů), ze kterých bude slovník vycházet.",
    "vocabulary.comment": "Popis",
    "vocabulary.summary.title": "{name} - přehled",
    "vocabulary.summary.gotodetail.label": "Zobrazit pojmy v tomto slovníku",
    "vocabulary.summary.gotodetail.text": "Zobrazit",
    "vocabulary.summary.export.title": "Exportovat pojmy ze slovníku",
    "vocabulary.summary.export.text": "Exportovat",
    "vocabulary.summary.export.type": "Typ exportu",
    "vocabulary.summary.export.format": "Formát exportu",
    "vocabulary.summary.export.skos": "Základní SKOS",
    "vocabulary.summary.export.skos.title":
      "Export glosáře ve struktuře kompatibilní se SKOS.",
    "vocabulary.summary.export.skosFull": "Plný SKOS",
    "vocabulary.summary.export.skosFull.title":
      "Export glosáře ve struktuře kompatibilní se SKOS včetně všech dalších atributů pojmů.",
    "vocabulary.summary.export.skosWithRefs": "Základní SKOS + stejné významy",
    "vocabulary.summary.export.skosWithRefs.title":
      "Export glosáře ve struktuře kompatibilní se SKOS, obsahující i pojmy z jiných slovníků mající stejný význam jako pojmy v tomto slovníku.",
    "vocabulary.summary.export.skosFullWithRefs": "Plný SKOS + stejné významy",
    "vocabulary.summary.export.skosFullWithRefs.title":
      "Export glosáře ve struktuře kompatibilní se SKOS včetně všech dalších atributů pojmů. Export obsahuje i pojmy z jiných slovníků mající stejný význam jako pojmy v tomto slovníku.",
    "vocabulary.summary.export.excel": "Excel",
    "vocabulary.summary.export.excel.title": "Export ve formátu MS Excel.",
    "vocabulary.summary.export.ttl": "Turtle",
    "vocabulary.summary.export.ttl.title": "Export ve formátu Turtle (RDF).",
    "vocabulary.summary.export.rdfxml": "RDF/XML",
    "vocabulary.summary.export.rdfxml.title": "Export ve formátu RDF/XML.",
    "vocabulary.summary.export.error":
      "Nepodařilo se získat data z odpovědi serveru.",
    "vocabulary.summary.import.action": "Obnovit ze zálohy",
    "vocabulary.summary.import.action.tooltip":
      "Obnovit slovník ze zálohy ve formátu SKOS či MS Excel",
    "vocabulary.summary.import.dialog.title":
      "Obnova exportované verze slovníku",
    "vocabulary.summary.import.dialog.label":
      "Nahrajte vyexportovanou verzi tohoto slovníku ",
    "vocabulary.summary.import.dialog.skosImport":
      "Ve formátu SKOS a obsahující jediný skos:ConceptScheme s IRI ve tvaru '<'IRI-TOHOTO-SLOVNÍKU'>'/glosář.",
    "vocabulary.summary.import.dialog.excelImport":
      "MS Excel odpovídající <a>této šabloně</a>",
    "vocabulary.summary.import.excel.template.tooltip":
      "Stáhnout šablonu pro MS Excel",
    "vocabulary.summary.import.nonEmpty.warning":
      "Slovník není prázdný, stávající data budou přepsána importovanými.",
    "vocabulary.import.type.skos": "SKOS",
    "vocabulary.import.type.excel": "MS Excel",
    "vocabulary.import.action": "Importovat",
    "vocabulary.import.dialog.title": "Importovat slovník",
    "vocabulary.import.dialog.message":
      "Importovaný soubor musí být formátu SKOS. " +
      "Soubor musí obsahovat jediný skos:ConceptScheme.",
    "vocabulary.import.title": "Importovat slovník",
    "vocabulary.import.success": "Slovník úspěšně importován.",
    "vocabulary.import.allow-changing-identifiers":
      "Povolit změnu identifikátorů",
    "vocabulary.import.allow-changing-identifiers.tooltip":
      "Při zaškrtnutí tohoto políčka budou při importu identifikátory nahrazeny novými, pokud by kolidovaly s existujícími identifikátory.",
    "vocabulary.summary.startTextAnalysis.title":
      "Spustit textovou analýzu definic všech pojmů v tomto slovníku",
    "vocabulary.updated.message": "Slovník úspěšně uložen.",
    "vocabulary.created.message": "Slovník úspěšně vytvořen.",
    "vocabulary.detail.subtitle": "Vytvořen autorem {author} ",
    "vocabulary.detail.tabs.metadata": "Metadata",
    "vocabulary.detail.tabs.termdetail": "Detail pojmu",
    "vocabulary.detail.files": "Soubory",
    "vocabulary.detail.imports": "Importuje",
    "vocabulary.detail.imports.edit": "Importuje slovníky",
    "vocabulary.detail.document": "Dokument",
    "vocabulary.text-analysis.invoke.message":
      "Textová analýza definic pojmů v tomto slovníku spuštěna.",
    "vocabulary.all.text-analysis.invoke.message":
      "Textová analýza definic pojmů ve všech slovnících spuštěna.",
    "vocabulary.termchanges.creations": "Vytvořené pojmy",
    "vocabulary.termchanges.updates": "Aktualizované pojmy",
    "vocabulary.termchanges.termcount": "Počet změněných pojmů",
    "vocabulary.termchanges.loading": "Načítám změny ...",
    "vocabulary.termchanges.empty":
      "Žádné nové pojmy ani aktualizace pojmů nebyly nalezeny.",
    "vocabulary.removed.message": "Slovník by odstraněn.",
    "vocabulary.document.label": "Dokument pro {vocabulary}",
    "vocabulary.document.attach": "Připojit dokument",
    "vocabulary.document.create": "Vytvořit nový dokument",
    "vocabulary.document.create.title": "Vytvořte dokument",
    "vocabulary.document.select": "Vybrat existující dokument",
    "vocabulary.document.select.title": "Vyberte dokument",
    "vocabulary.document.set": "Změnit dokument",
    "vocabulary.document.remove": "Odpojit dokument",
    "vocabulary.document.set.label": "Název dokumentu",
    "vocabulary.snapshot.create.label": "Vytvořit revizi",
    "vocabulary.snapshot.create.title":
      "Vytvořit revizi tohoto slovníku a všech dalších slovníků, které jsou s ním (nepřímo) propojeny vztahy mezi pojmy. Revize je kopií veškerého obsahu slovníku a umožňuje tak označit důležité milníky v historii vývoje slovníku.",
    "vocabulary.snapshot.create.dialog.text.no-related":
      "Chcete vytvořit revizi tohoto slovníku?",
    "vocabulary.snapshot.create.dialog.text":
      "Chcete vytvořit revizi tohoto slovníku? Tato akce současně vytvoří {count, plural, one {revizi jednoho slovníku, který je s ním propojen vztahy mezi pojmy}" +
      "other {revize dalších # slovníků, které jsou s ním (i nepřímo) propojeny vztahy mezi pojmy}}.",
    "vocabulary.snapshot.create.dialog.confirm": "Vytvořit",
    "vocabulary.snapshot.create.success": "Revize slovníku úspěšně vytvořena.",
    "vocabulary.acl": "Správa přístupu",
    "vocabulary.acl.record.create": "Nový záznam",
    "vocabulary.acl.record.create.title":
      "Vytvořit nový záznam pro řízení přístupu k tomuto slovníku",
    "vocabulary.acl.record.create.dialog.title": "Nový záznam řízení přístupu",
    "vocabulary.acl.record.save.success":
      "Záznam řízení přístupu úspěšně uložen.",
    "vocabulary.acl.record.remove.success":
      "Záznam řízení přístupu úspěšně odstraněn.",
    "vocabulary.acl.record.holder": "Držitel oprávnění",
    "vocabulary.acl.record.level": "Úroveň oprávnění",
    "vocabulary.acl.record.remove.dialog.title": "Odstranit záznam?",
    "vocabulary.acl.record.remove.dialog.text":
      'Opravdu chcete odstranit záznam řízení přístupu pro "{holder}"?',
    "vocabulary.acl.record.update.dialog.title":
      "Upravit záznam řízení přístupu",
    "vocabulary.acl.record.update.success":
      "Záznam řízení přístupu úspěšně upraven.",

    "vocabulary.term.created.message": "Pojem úspěšně vytvořen.",
    "vocabulary.select-vocabulary": "Vyberte slovník",

    "vocabulary.remove.dialog.text.nonEmpty":
      "Opravdu chcete odstranit <b>neprázdný</b> slovník?",
    "vocabulary.remove.dialog.text.empty":
      "Opravdu chcete odstranit <b>prázdný</b> slovník?",
    "vocabulary.remove.dialog.text.termCount":
      "Jeho odstraněním dojde k trvalému smazání {count, plural, one {<b>1</b> pojmu} other {<b>#</b> pojmů}}, dokumentu a všech souvisejících souborů.",
    "vocabulary.remove.dialog.text.permanent": "Tato akce je nevratná!",
    "vocabulary.remove.dialog.relationsExists.text":
      "Existují vazby na jiné slovníky, slovník nezle odstranit.",
    "vocabulary.remove.dialog.relations": "Vazby",
    "vocabulary.remove.dialog.relations.error.cantRemove":
      "Slovník nelze odstranit!",
    "vocabulary.remove.dialog.relations.error.vocabularyRelations":
      "Existuje {vocabularyRelations, plural, one {<b>1</b> vazba} other {<b>#</b> vazeb}} s jiným slovníkem",
    "vocabulary.remove.dialog.relations.error.termsRelations":
      "Existuje {termsRelations, plural, one {<b>1</b> vazba na pojem} other {<b>#</b> vazeb na pojmy}} z tohoto slovníku.",
    "vocabulary.remove.dialog.input.label":
      "Pro ověření, zadejte název slovníku",

    "resource.created.message": "Zdroj úspěšně vytvořen.",
    "resource.updated.message": "Zdroj úspěšně uložen.",
    "resource.removed.message": "Zdroj by odstraněn.",

    "resource.create.file.select.label":
      "Přetáhněte sem soubor myší, nebo klikněte pro výběr pomocí dialogu",
    "resource.reupload.file.select.label": "Nahrajte novou verzi souboru",
    "resource.metadata.description": "Popis",
    "resource.metadata.file.content": "Obsah",
    "resource.metadata.file.content.view": "Zobrazit",
    "resource.metadata.file.content.view.tooltip":
      "Zobrazit obsah souboru a anotovat ho",
    "resource.metadata.file.content.download": "Stáhnout",
    "resource.metadata.file.content.download.tooltip": "Stáhnout soubor",
    "resource.metadata.file.content.download.original": "Stáhnout originál",
    "resource.metadata.file.content.download.original.tooltip":
      "Stáhnout původní nahranou verzi souboru",
    "resource.metadata.document.files.actions.add": "Přidat",
    "resource.metadata.document.files.actions.add.tooltip":
      "Přidat nový soubor do tohoto dokumentu",
    "resource.metadata.document.files.actions.add.dialog.title": "Nový soubor",
    "resource.metadata.document.files.empty":
      "Žádné soubory nenalezeny. Přidejte nějaký...",
    "resource.file.vocabulary.create": "Přidat soubor",

    "term.language.selector.item":
      "Zobrazit data pojmu v jazyce: {nativeLang} ({lang})",
    "term.language.add.placeholder": "Vyberte...",
    "term.iri.help":
      "Identifikátor pojmu ve formě Internationalized Resource Identifier (IRI). Je " +
      " vygenerován automaticky na základě názvu, ale může být ručně upraven. Jedná se o možnost pro pokročilé uživatele." +
      "Identifikátor může obsahovat pouze " +
      'alfanumerické znaky a pomlčky ("-"). Lomítka ("/") se používají pouze k oddělení hierarchických komponent ' +
      "identifikátoru.",
    "term.label.help":
      "(Povinné) označení, které daný pojem/význam jednoznačně v rámci slovníku identifikuje. " +
      "Jako názvy pojmů se nepoužívají zkratky ('daň z přidané hodnoty' místo 'DPH'). Celý název pojmu " +
      "se skládá z malých písmen. Název pojmů není vhodné měnit, jeho změna může ovlivnit význam dat, " +
      "která jsou tímto pojmem popsána.",
    "term.definition.help":
      "(Nepovinný) text popisující význam konceptu. Definice jednoznačně popisuje význam pojmu. " +
      "Je-li pojem vázán na dokument, je definice přímou citací z daného dokumentu. Definice se používá pouze pro " +
      "plné vymezení významu pojmu (např. 'budova' ve slovníku Zákona č. 256/2013 Sb. by měla definici " +
      "'nadzemní stavba spojená se zemí pevným základem, která je prostorově soustředěna a navenek převážně " +
      "uzavřena obvodovými stěnami a střešní konstrukcí.'). Definice je vždy pouze jedna, nelze ji kombinovat " +
      "z více zdrojů.",
    "term.exactMatches.help":
      "(Nepovinný) pojem se stejným významem. Slouží k mapování na pojmy z jiných slovníků.",
    "term.comment.help":
      "(Nepovinný) nedefiniční text upřesňující význam pojmu.",
    "term.parent.help":
      "(Nepovinný) pojem s širším významem. Slouží k zachycení vazby na obecnější pojem " +
      "(např. 'Kostel' -> 'Budova'), k přiřazení pojmu jeho typu (např. 'Kostel sv. Ludmily na Chvalech' -> 'Kostel'), " +
      "nebo k vyjádření části celku (např. 'Klika' -> 'Dveře')",
    "term.types.help":
      "(Nepovinný) charakter pojmu. Rozlišujeme typy a individuály - Typem je například " +
      "'Městská část', individuálem pak 'Střešovice'. Individuály jsou dále rozděleny na 'Objekty', " +
      "'Vlastnosti', 'Vztahy' a 'Události', typy analogicky na 'Typy objektů', 'Typy vlastností', " +
      "'Typy vztahů' a 'Typy událostí'. 'Objekty' (např. konkrétní městské části, auta, lidé, dokumenty) " +
      "označují nezávislé, v čase se měnící prvky, zatímco 'Vlastnosti' (např. barva vlasů konkrétního člověka) " +
      "jsou prvky závislé na 'Objektech'. Podobně 'Vztahy' (např. manželství dvou konkrétních lidí) " +
      " propojují dva objekty a jsou na nich závislé. Události (např. 'Volby do PSP 2016') jsou naopak prvky neměnné, " +
      " které kompletně proběhly v minulosti. Například 'Olympiáda 2022' se stane událostí až po svém skončení. " +
      "Typy označují skupiny/kategorie individuálů. 'Typem objektu' tedy může být např. " +
      "'Městská část', nebo 'Auto'. 'Barva vlasů' by byl 'Typ vlastnosti'. 'Typem vztahu' je obecně " +
      "'Manželství' a je závislé na dvou 'Typech objektů'. Příkladem 'Typu události' jsou 'Olympijské hry'.  " +
      "V případě, že si nejste jistí, ponechte pole prázdné.",
    "term.source.help":
      "(Nepovinný) odkaz na původ definice pojmu. Odkazuje na konkrétní místo v textu dokumentu, " +
      "například na kapitolu knihy, či konkrétní odstavec v zákoně, např. 'Písmeno b) paragrafu 2 " +
      "zákona č. 256/2013 Sb., o katastru nemovitostí'. V případě označení definice v textu dokumentu " +
      "je zdroj vyplňován automaticky.",
    "term.metadata.definition": "Definice",
    "term.metadata.definition.text": "Text",
    "term.metadata.definitionSource": "Dokument",
    "term.metadata.definitionSource.title": "Zdroj definice tohoto pojmu",
    "term.metadata.definitionSource.goto": "Zobrazit v dokumentu",
    "term.metadata.definitionSource.goto.tooltip":
      "Zobrazit zdroj definice přímo v příslušném dokumentu",
    "term.metadata.relationships": "Vztahy",
    "term.metadata.exactMatches": "Pojmy se stejným významem",
    "term.metadata.comment": "Doplňující poznámka",
    "term.metadata.parent": "Nadřazené pojmy",
    "term.metadata.subTerms": "Podřazené pojmy",
    "term.metadata.types": "Typ pojmu",
    "term.metadata.status": "Stav pojmu",
    "term.metadata.source": "Zdroj",
    "term.metadata.altLabels.label": "Synonyma",
    "term.metadata.altLabels.help":
      "(Nepovinná) synonyma k názvu. Synonyma mohou být kontextuální - např. pojem " +
      "s názvem 'Adresa organizace' může mít synonymum 'Adresa', které se však použije jen v určitém kontextu " +
      "(např. ve formuláři, ve kterém se vyplňují informace o organizaci). ",
    "term.metadata.hiddenLabels.label": "Vyhledávací texty",
    "term.metadata.hiddenLabels.help":
      "(Nepovinné) vyhledávací texty, nejsou určeny pro vizuální prezentaci pojmu a" +
      " slouží zejména pro vyhledávání. Nemusí se jednat (ani kontextuální) synonyma k názvu pojmu. Např. " +
      "pojem s názvem 'Kopaná' může mít vyhledávací text 'fočus'. ",
    "term.updated.message": "Pojem úspěšně aktualizován.",
    "term.metadata.labelExists.message":
      'Pojem s názvem "{label}" již v tomto slovníku existuje',
    "term.metadata.multipleSources.message":
      "Pojem má více zdrojů, po uložení pojmu bude pouze aktuálně vyplněný zdroj a ostatní budou smazány",
    "term.metadata.subterm.link": "Zobrazit detail tohoto pojmu",
    "term.metadata.related.title": "Související pojmy",
    "term.metadata.related.help":
      "(Nepovinný) související pojem (bez bližšího určení o jakou souvislost se jedná). " +
      "Může se jednat o pojem z aktuálního slovníku nebo z jiného slovníku. Např. pojem 'vozidlo' souvisí s pojmem 'řidič'. " +
      "Nevybírejte pojem, který už je označen jako 'nadřazený pojem', nebo 'pojem se stejným významem'.",
    "term.metadata.vocabulary.tooltip": "Slovník, do kterého tento pojem patří",
    "term.metadata.related.tab.title": "Další související pojmy",
    "term.metadata.related.ontologically": "Ontologicky",
    "term.metadata.related.definitionally": "Definičně",
    "term.metadata.related.definitionally.targeting":
      "Pojmy, které se vyskytly v definici tohoto pojmu",
    "term.metadata.related.definitionally.of":
      "Pojmy, v jejichž definici se tento pojem objevil",
    "term.metadata.related.ontologically.tooltip":
      "Pojmy související díky vybraným ontologickým vztahům",
    "term.metadata.related.definitionally.tooltip":
      "Pojmy související díky definici",
    "term.metadata.related.definitionally.suggested":
      "Výskyt byl nalezen automaticky analýzou textu definice a ještě nebyl schválen",
    "term.metadata.comments.public.title": "Veřejná diskuse",
    "term.metadata.status.help":
      "Stav pojmu reprezentuje různé fáze životního cyklu pojmu, od jeho prvotního návrhu až po jeho případné zrušení (např. z důvodu nahrazení jiným pojmem).",
    "term.metadata.status.terminal.help":
      "Pojem byl zrušen a neměl by být nadále používán.",
    "term.metadata.notation.label": "Notace",
    "term.metadata.notation.help":
      "(Nepovinný) Notace je řetězec znaků, jako např. 'UBA' or 'L2-3', užívaný k identifikaci pojmu v rámci daného glosáře. " +
      "Notace se liší od názvu pojmu tím, že se obvykle nejedná o slovo či slova vybraného jazyka.",
    "term.metadata.example.label": "Příklady",
    "term.metadata.example.help": "(Nepovinný) Příklad použití pojmu.",
    "term.metadata.types.select.placeholder": "Vyberte typ",
    "term.metadata.validation.title": "Kontrola",
    "term.metadata.validation.empty": "Pojem je bez chyb.",
    "term.removed.message": "Pojem byl odstraněn.",
    "term.badge.score.tooltip":
      "Skóre tohoto pojmu je {score}%. Klikněte pro zobrazení výsledků kontroly",
    "term.badge.no-score.tooltip": "Pro tento pojem není skóre k dispozici",

    "glossary.title": "Pojmy",
    "glossary.termCount.tooltip":
      "Počet pojmů ve slovníku (bez pojmů z importovaných slovníků)",
    "glossary.new": "Nový pojem",
    "glossary.select.placeholder": "Začněte psát pro filtrování pojmů",
    "glossary.excludeImported": "Včetně importů",
    "glossary.excludeImported.help":
      "Pojmy z importovaných slovníků jsou v tomto zobrazení skryté, kliknutím je zobrazíte.",
    "glossary.includeImported": "Včetně importů",
    "glossary.includeImported.help":
      "Pojmy z importovaných slovníků jsou v tomto zobrazení viditelné, kliknutím je skryjete.",
    "glossary.importedIncluded": "včetně importovaných",
    "glossary.importedExcluded": "bez importovaných",
    "glossary.importedTerm.tooltip": "Importován ze slovníku",
    "glossary.showTerminal": "Včetně zrušených",
    "glossary.showNonTerminal": "Pouze aktivní",
    "glossary.showTerminal.help":
      "Jsou zobrazeny též zrušené pojmy (pojmy v koncovém stavu). Takové pojmy by se již neměly používat.",
    "glossary.showNonTerminal.help":
      "Jsou zobrazeny pouze pojmy v aktivním stavu, tj. pojmy, které lze používat.",
    "glossary.unusedTerm.tooltip": "Není znám výskyt pojmu v dokumentu.",
    "glossary.createTerm": "Vytvořit nový pojem",
    "glossary.createTerm.tooltip": "Vytvořit nový pojem ve slovníku",
    "glossary.createTerm.text": "Vytvořit",
    "glossary.createTerm.breadcrumb": "Vytvořit pojem",
    "glossary.form.header": "Vytvořit nový pojem",
    "glossary.form.tooltipLabel":
      "Nanašli jste pojem, který jste hledali? Vytvořte nový.",
    "glossary.form.field.parent": "Nadřazený pojem",
    "glossary.form.field.source": "Zdroj pojmu",
    "glossary.form.field.type": "Typ pojmu",
    "glossary.form.button.addType": "Přidat typ",
    "glossary.form.button.removeType": "Odstranit typ",
    "glossary.form.button.submit": "Vytvořit",
    "glossary.form.button.submitAndGoToNewTerm": "Vytvořit a začít nový",
    "glossary.form.button.cancel": "Zrušit",

    "glossary.form.validation.validateLengthMin5":
      "Pole musí mít alespoň 5 znaků",
    "glossary.form.validation.validateLengthMin3":
      "Pole musí mít alespoň 3 znaky",
    "glossary.form.validation.validateNotSameAsParent":
      "Potomek nemůže být stejný jako předchůdce",

    "file.text-analysis.finished.message":
      "Textová analýza souboru úspěšně dokončena.",
    "file.metadata.startTextAnalysis": "Spustit textovou analýzu",
    "file.metadata.startTextAnalysis.text": "Analyzovat",
    "file.metadata.startTextAnalysis.vocabularySelect.title":
      "Vyberte slovník pro automatickou analýzu textu",
    "file.content.upload.success":
      'Soubor "{fileName}" úspěšně nahrán na server.',
    "file.annotate.selectVocabulary":
      "Nelze určit slovník pro anotování tohoto souboru. Vyberte ho, prosím...",
    "file.upload": "Nahrát",
    "file.upload.hint":
      "Maximální velikost souboru: {maxUploadFileSize}. Má-li být soubor použit pro extrakci pojmů do slovníku, musí být ve formátu UTF-8, nebo validní MS Excel.",
    "file.upload.size.exceeded": "Soubor je příliš velký.",

    "dataset.license": "Licence",
    "dataset.format": "Formát",

    "statistics.vocabulary.count": "Počet slovníků",
    "statistics.term.count": "Počet pojmů",
    "statistics.user.count": "Počet uživatelů",
    "statistics.notFilled": "Nevyplněno",
    "statistics.types.frequency": "Typy pojmů",
    "statistics.types.frequency.empty":
      "Nemáte vytvořen žádný slovník, nebo vaše slovníky neobsahují žádné pojmy. Obojí si můžete vytvořit pomocí akcí v levém liště.",

    "fullscreen.exit": "Vrátit zobrazení do okna",
    "fullscreen.enter": "Zobrazit na celou obrazovku",

    "search.title": "Vyhledávání",
    "search.tab.dashboard": "Nástěnka",
    "search.tab.everything": "Hledat ve všech záznamech",
    "search.tab.terms": "Pojmy",
    "search.tab.terms.filter.allVocabularies": "Všechny slovníky",
    "search.tab.vocabularies": "Slovníky",
    "search.tab.facets": "Facetové vyhledávání pojmů",
    "search.reset": "Vymazat vyhledávání",
    "search.results.title": "Výsledky vyhledávání „{searchString}“",
    "search.no-results": "Zadanému výrazu neodpovídá žádný výsledek.",
    "search.results.countInfo":
      "{matches, plural, one {Nalezen # výskyt} few {Nalezeny celkem # výskyty} other {Nalezeno celkem # výskytů}} {assets, plural, one {v # záznamu} other {v # záznamech}}.",
    "search.results.table.label": "Název",
    "search.results.table.label.tooltip": "Zobrazit detail objektu",
    "search.results.table.match": "Nalezená shoda",
    "search.results.table.score": "Skóre shody",
    "search.results.field.badge.tooltip": "Shoda nalezena v tomto atributu",
    "search.results.field.label": "Název",
    "search.results.field.comment": "Popis",
    "search.results.field.definition": "Definice",
    "search.results.vocabulary.from": "z",
    "search.results.facetedLink": "Zkuste {link}.",
    "search.faceted.matchType.exact": "Přesná shoda",
    "search.faceted.matchType.substring": "Částečná shoda",
    "search.faceted.no-results":
      "Zadaným parametrů neodpovídají již žádná další data.",

    "profile.first.name": "Křestní jméno",
    "profile.last.name": "Příjmení",
    "profile.legend.invalid.name": "Pole musí mít alespoň 1 znak",
    "profile.updated.message": "Profil byl úspěšně aktualizován",
    "profile.change-password": "Změnit heslo",

    "change-password.current.password": "Současné heslo",
    "change-password.new.password": "Nové heslo",
    "change-password.confirm.password": "Potvrzení hesla",
    "change-password.updated.message": "Heslo bylo úspěšně změněno",
    "change-password.passwords.differ.tooltip":
      "Staré a nové heslo se musí lišit.",

    annotator: "Anotátor",
    "annotator.content.loading": "Načítám obsah souboru...",
    "annotator.vocabulary": "Používá pojmy ze slovníku",
    "annotator.selectionPurpose.dialog.title":
      "K čemu bude sloužit vybraný text?",
    "annotator.selectionPurpose.create": "Nový pojem",
    "annotator.selectionPurpose.occurrence": "Označení výskytu pojmu",
    "annotator.selectionPurpose.definition": "Označení definice pojmu",
    "annotator.createTerm.button": "Nový",
    "annotator.createTerm.selectDefinition": "Vybrat definici",
    "annotator.createTerm.selectDefinition.tooltip":
      "Skrýt tento dialog a vybrat definici pojmu v textu",
    "annotator.createTerm.selectDefinition.message":
      "Vyberte definici nového pojmu v textu.",
    "annotator.setTermDefinitionSource.success":
      'Zdroj definice pojmu "{term}" nastaven.',
    "annotator.setTermDefinitionSource.error.exists":
      'Pojem "{term}" již má přiřazen zdroj definice.',
    "annotator.setTermDefinition.title": 'Výběr definice pojmu "{term}"',
    "annotator.findAnnotation.error": "Anotaci nelze zobrazit.",
    "annotator.tutorial.title": "Návod",
    "annotator.tutorial.tooltip":
      "Zobrazit stránku s návodem k používání anotátoru",
    "annotator.highlight.button.label": "Najít",
    "annotator.highlight.button.active.tooltip":
      'Jsou zvýrazněny výskyty pojmu "{term}"',
    "annotator.highlight.button.inactive.tooltip":
      "Žádný pojem ke zvýraznění není vybrán",
    "annotator.highlight.selector.title": "Najít výskyty pojmu",
    "annotator.highlight.selector.label":
      "Vyberte pojem, jehož výskyty budou zvýrazněny",
    "annotator.highlight.countInfo":
      "V tomto dokumentu {count, plural, one {nalezen # výskyt} few {nalezeny # výskyty} other {nalezeno # výskytů}}.",
    "annotator.legend.activeFilter.tooltip":
      "Některá zvýraznění výskytů pojmů jsou skrytá.",

    "annotation.form.suggested-occurrence.message":
      "Fráze není přiřazena žádnemu pojmu.",
    "annotation.form.invalid-occurrence.message":
      'Pojem "{term}" nebyl nalezen v slovníku.',
    "annotation.form.assigned-occurrence.termInfoLabel": "Informace o pojmu:",
    "annotation.term.assigned-occurrence.termLabel": "Přiřazený pojem:",
    "annotation.term.occurrence.scoreLabel": "Skóre:",
    "annotation.term.select.placeholder":
      "Začněte psát pro vyhledávání relevantních pojmů",
    "annotation.confirm": "Potvrdit navrhovaný výskyt pojmu",
    "annotation.save": "Uložit výskyt pojmu",
    "annotation.edit": "Editovat výskyt pojmu",
    "annotation.remove": "Odebrat výskyt pojmu",
    "annotation.close": "Zavřít",
    "annotation.occurrence.title": "Výskyt pojmu",

    "annotation.definition.title": "Zdroj definice pojmu",
    "annotation.definition.term": "Pojem:",
    "annotation.definition.definition": "Definice:",
    "annotation.definition.exists.message":
      'Pojem "{term}" již definici má. Níže můžete novou definici s původní porovnat a upravit ji.',
    "annotation.definition.original": "Původní definice",
    "annotation.definition.new": "Nová definice",

    "annotator.legend.title": "Legenda",
    "annotator.legend.confirmed.unknown.term": "Výskyt neznámého pojmu",
    "annotator.legend.confirmed.unknown.term.tooltip":
      "Výskyt pojmu byl vytvořen či akceptován uživatelem, avšak konkrétní pojem nebyl zatím vybrán.",
    "annotator.legend.confirmed.existing.term": "Výskyt existujícího pojmu",
    "annotator.legend.confirmed.existing.term.tooltip":
      "Výskyt pojmu vytvořený či schválený uživatelem.",
    "annotator.legend.proposed.unknown.term": "Navrhovaný výskyt nového pojmu",
    "annotator.legend.proposed.unknown.term.tooltip":
      "Výskyt potenciálního nového pojmu byl identifikován službou textové analýzy, avšak nebyl ještě schválen uživatelem.",
    "annotator.legend.proposed.existing.term":
      "Navrhovaný výskyt existujícího pojmu",
    "annotator.legend.proposed.existing.term.tooltip":
      "Výskyt pojmu identifikovaný službou textové analýzy.",
    "annotator.legend.definition.pending": "Definice neznámého pojmu",
    "annotator.legend.definition.pending.tooltip":
      "Definice, která zatím nebyla přiřazena žádnému pojmu.",
    "annotator.legend.definition": "Definice pojmu",
    "annotator.legend.definition.tooltip":
      "Uživatelem označená definice existujícího pojmu.",
    "annotator.unknown.unauthorized": "Pojem nevybrán.",
    "annotator.legend.annotationHidingHint":
      "Zvýraznění výskytů pojmů můžete zobrazit/skrýt kliknutím na položku legendy.",

    "message.welcome": "Vítejte v aplikaci TermIt!",
    "link.external.title": "{url} - otevřít v nové záložce",
    "properties.edit.title": "Další atributy",
    "properties.empty": "Žádné další atributy nebyly nalezeny.",
    "properties.edit.remove": "Odebrat tuto hodnotu",
    "properties.edit.remove.text": "Odebrat",
    "properties.edit.property": "Atribut",
    "properties.edit.property.select.placeholder": "Vyberte atribut",
    "properties.edit.value": "Hodnota",
    "properties.edit.add.title": "Přidat hodnotu atributu",
    "properties.edit.add.text": "Přidat",
    "properties.edit.new": "Vytvořit atribut",
    "properties.edit.new.iri": "Identifikátor",
    "properties.edit.new.label": "Název",
    "properties.edit.new.comment": "Popis",

    "type.asset": "Záznam",
    "type.term": "Pojem",
    "type.vocabulary": "Slovník",
    "type.resource": "Zdroj",
    "type.document": "Dokument",
    "type.file": "Soubor",
    "type.dataset": "Datová sada",
    "type.document.vocabulary": "Dokumentový slovník",
    "type.user": "Uživatel",
    "type.usergroup": "Uživatelská skupina",
    "type.userrole": "Uživatelská role",

    "log-viewer.title": "Prohlížení chyb",
    "log-viewer.timestamp": "Čas",
    "log-viewer.error": "Chyba",
    "log-viewer.clear": "Vyčistit",

    "error.vocabulary.update.imports.danglingTermReferences":
      "Nelze odstranit import slovníku, neboť stále existují vazby mezi pojmy z tohoto a importovaného slovníku (či ze slovníků, které importuje).",
    "error.file.maxUploadSizeExceeded":
      "Soubor nemohl být nahrán, protože jeho velikost přesahuje nastavený limit.",
    "error.term.state.terminal.liveChildren":
      "Pojmu nelze nastavit koncový stav, dokud má alespoň jednoho potomka v jiném než koncovém stavu.",
    "error.vocabulary.import.excel.duplicateIdentifier":
      "Excel obsahuje více pojmů se stejným identifikátorem.",
    "error.vocabulary.import.excel.duplicateLabel":
      "Excel obsahuje více pojmů se stejným názvem.",

    "history.label": "Historie změn",
    "history.loading": "Načítám historii...",
    "history.empty": "Zaznamenaná historie je prázdná.",
    "history.whenwho": "Původ",
    "history.type": "Typ",
    "history.type.persist": "Vytvoření",
    "history.type.update": "Změna",
    "history.changedAttribute": "Atribut",
    "history.originalValue": "Původní hodnota",
    "history.newValue": "Nová hodnota",

    "changefrequency.label": "Aktivita",

    "tooltip.copy-iri": "Zkopírovat IRI",
    "tooltip.copied": "Zkopírováno!",

    "table.filter.text.placeholder":
      "Filtrovat {count, plural, one {# záznam} few {# záznamy} other {# záznamů}}...",
    "table.filter.select.all": "Vše",
    "table.sort.tooltip": "Seřadit záznamy",
    "table.paging.first.tooltip": "První strana",
    "table.paging.previous.tooltip": "Předchozí strana",
    "table.paging.next.tooltip": "Následující strana",
    "table.paging.last.tooltip": "Poslední strana",
    "table.paging.pageSize.select": "Zobrazit {pageSize} záznamů na stránku",
    "table.paging.pageSize.select.all": "Zobrazit všechny záznamy",

    "stringlistedit.button.add": "Přidat",
    "stringlistedit.button.add.tooltip":
      "Kliknutím přidáte zadanou hodnotu do seznamu",
    "stringlistedit.button.remove": "Odebrat",
    "stringlistedit.button.remove.tooltip": "Odebrat hodnotu",

    "public.nav.user": "Uživatel nepřihlášen. Klikněte pro přihlášení.",
    "public.dashboard.title": "Vítejte v TermIt!",
    "public.dashboard.intro":
      "TermIt je správce slovníků a editor terminologií.",
    "public.dashboard.actions.login": "Přihlaste se",
    "public.dashboard.actions.register": "Vytvořte si účet",
    "public.dashboard.actions.vocabularies": "Prohlédněte si slovníky a pojmy",

    "comments.title": "Komentáře",
    "comments.create.placeholder": "Napište komentář...",
    "comments.create.submit.title": "Odeslat",
    "comments.list.empty": "Zatím tu žádné komentáře nejsou.",
    "comments.comment.like": "Líbí se mi",
    "comments.comment.like.on": "Už se mi nelíbí",
    "comments.comment.dislike": "Nelíbí se mi",
    "comments.comment.dislike.on": "Zrušit reakci",
    "comments.comment.edited": "Upraveno",

    "validation.message.tooltip":
      "Tato zpráva reprezentuje výsledek kontroly kvality. Formulář lze uložit i v případě, že kvalita není stoprocentní.",

    "snapshots.title": "Historie revizí",
    "snapshots.created": "Datum a čas vytvoření revize",
    "snapshots.show": "Zobrazit revizi",
    "snapshots.empty": "Žádné předchozí revize nenalezeny.",
    "snapshot.message":
      "Tento { type } je revize a je pouze pro čtení. Kliknutím přejdete na aktuální verzi.",
    "snapshot.remove.confirm.title": "Odstranit revizi?",
    "snapshot.remove.confirm.text.no-related":
      "Určitě chcete odstranit tuto revizi?",
    "snapshot.remove.confirm.text":
      "Určitě chcete odstranit tuto revizi? Tato akce odstraní {count, plural, one {# související revizi} " +
      "few {další # související revize} " +
      "other {dalších # souvisejících revizí}}.",
    "snapshot.removed.message": "Revize odstraněna.",
    "snapshot.label.short": "revize z",

    "auth.action.unauthorized": "K této akci nemáte dostatečná práva.",
    "auth.view.unauthorized": "K zobrazení nemáte dostatečná práva.",
    "auth.notEditable.message.readOnly": "Tento { type } je pouze pro čtení.",

    "longrunningtasks.description": "V systému právě probíhá:",
    "longrunningtasks.state.done": "Dokončeno",
    "longrunningtasks.state.pending": "Bude spuštěno",
    "longrunningtasks.state.running": "Probíhá",
    "longrunningtasks.name.termDefinitionAnalysis": "Analýza definice pojmu",
    "longrunningtasks.name.allTermsVocabularyAnalysis":
      "Analýza pojmů ze slovníku",
    "longrunningtasks.name.allVocabulariesAnalysis": "Analýza všech slovníků",
    "longrunningtasks.name.fileAnalysis": "Analýza souboru",
    "longrunningtasks.name.vocabularyValidation": "Validace slovníku",
    "longrunningtasks.name.documentAnnotationGeneration":
      "Generování anotací dokumentu",
  },
};

export default cs;
