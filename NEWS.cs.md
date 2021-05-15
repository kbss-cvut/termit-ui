#### Verze 2.5.0

- Implementována podpora pro SKOS related, relatedMatch a exactMatch.
- Opravy menších chyb.

#### Verze 2.4.1

- Přepracován vzhled formulářů (nápověda se nově zobrazuje v popup okně).
- Upraven vzhled anotátoru.
- Zjednodušení infrastruktury aplikace.
- Opravy menších chyb.

#### Verze 2.4.0

- Na hlavní stránku byl přidán widget komentářů.
- Anotátor nyní zobrazuje slovník, kterým je soubor anotován a umožňuje vybrat slovník, který bude použit pro textovou analýzu.

#### Verze 2.3.1

- Opraveny problémy s voláním služby textové analýzy a ukládání souborů v Docker kontejneru.
- Opraveny problémy s přístupem k veřejnému prohlížení slovníků (expirovaný JWT, zobrazení definice).
- Optimalizace načítání pojmů.

#### Verze 2.3.0

- Přídána podpora pro vedení diskuse u pojmů (přihlášení uživatelé).
- Přidána podpora uživatelských rolí a základní autorizace. Uživatelé mohou mít omezená práva (pouze prohlížení a
  komentování), plná práva (prohlížení i editace) či administrátorská práva.
- Administrátor může měnit role uživatelů.
- Předdefinovaný administrátorský účet již není při startu generován, pokud v systém je alespoň jeden jiný administrátor.

#### Verze 2.2.0

- Zjednodušení práce s dokumenty a soubory a jejich vazbou na slovníky - např. k slovníku je nově možné připojit (nebo
  od něj odpojit) dokument i po jeho vytvoření.
- Vylepšena možnost přiřadit pojmu zdroj definice v dokumentu.
- Nová prohledávatelná tabulka podporující stránkování pro zobrazení slovníků a zdrojů.
- Podpora vícejazyčných popisů pojmů (skos:scopeNote).

#### Verze 2.1.3

- Titulek stránky se mění v závislosti na navigaci (usnadňuje hledání v historii).
- Opravena komunikace se službou textové analýzy při vytvoření nového pojmu.
- Opraveno nekonzistentní chování formuláře pro nahrání souboru.
- Opravena nesprávná vizualizace validačního skóre nového pojmu.

##### Verze 2.1.2

- Přepracovány obrazovky seznamu slovníků a zdrojů - nyní používají tabulku podporující stránkování a filtrování.
- Opraveny problémy s generováním nových identifikátorů.
- Optimizalizováno načítání výsledků validace.
- Řada dalších oprav.

##### Verze 2.1.1

- Úprava UI výsledků vyhledávání
- Opravy drobných chyb v uživatelském rozhraní

##### Verze 2.1.0

- Přidána podpora pro SKOS altLabel a hiddenLabel.
- Přidána podpora vícejazyčných atributů pojmu.
- Implementována validace kvality pojmů v rámci slovníku a vizualizace jejích výsledků.
- Implementována podpora Docker kontejneru.

##### Verze 2.0.0

- Nový design uživatelského rozhraní.
- Přidána možnost nastavit pojmu několik rodičovských pojmů.
- Optimalizace komponenty anotátoru.
- Těsnější podpora modelu SKOS.
- Přidána možnost prohlížet slovníky a pojmy bez přihlášení.

##### Verze 1.3.0

- Implementována podpora propojení pojmu se zdrojem jeho definice v souboru.
- Přidána možnost zjistit pojmy příbuzné skrze definici a ontologické vazby.
- Vizualizace pojmů nepoužitých k anotaci žádného zdroje.
- Implementována možnost vytvářet nové uživatele v administraci.

##### Verze 1.2.1

- Přidána podpora pro úpravy metadat zdrojů.
- Implementována základní správa uživatelů a možnost editace vlastního profilu.
- Implementována možnost zakázat registraci nepřihlášeným uživatelů.
- Implementována podpora pro vytváření dokumentových slovníků.
- Řada opravených chyb a vylepšení kódu.
- Ontologický model nyní používá prvky z DC terms místo starších DC elements.

##### Verze 1.2.0

- Přidána podpora pro závislosti mezi slovníky (slovník může importovat jiné slovníky).
- Pojmy mohou mít rodiče (skos:broader) z importovaného slovníku.
- Nově je možné stáhnout obsah souboru, který byl předtím nahrán do systému.
- Vylepšena přesnost fulltextového vyhledávání.

##### Verze 1.1.2

- Implementováno nahrávání souborů do systému.
- Podpora pro výběr slovníku pro textovou analýzu.
- Pojmům přidán atribut skos:definition, vyjadřující normativní definici.
- Automatické přiřazení pojmů vyskytujících se (na základě textové analýzy) v souboru souboru samotnému.
- Zdrojový kód publikován na [GitHub](https://github.com/kbss-cvut).

##### Verze 1.1.1

- Zobrazení legendy v anotátoru obsahu souboru.
- Hierarchická vizualizace seznamu zdrojů dat.
- Zobrazení pojmů přiřazených a vyskytujících se ve zdroji dat.
- Zobrazení zdrojů, kterým je pojem přiřazen či se v nich vyskytuje.

##### Verze 1.1.0

- Optimalizace výkonu aplikace.
- Opravy drobných chyb (především v uživatelském rozhraní).

##### Verze 1.0.0

- Podpora správy datových zdrojů a přiřazování pojmů k těmto zdrojům.
- Tvorba nových pojmů na základě výsledků textové analýzy.
- Úprava struktury hlavní stránky aplikace.
- Možnost přiřadit k pojmu či slovníku libovolnou vlastnost mimo standardní model.

##### Verze 0.4.0

- Export glosáře do CSV/Excel.
- Podpora fulltextového vyhledávání.
- Vylepšení přesnosti výsledků textové analýzy.
