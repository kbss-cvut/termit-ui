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
