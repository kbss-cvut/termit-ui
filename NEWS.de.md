#### Version 5.0.0

- Bessere Ausrichtung des Datenmodells an SKOS - die Struktur `Vocabulary = Glossary + Model` wird durch nur `Vocabulary` (~ SKOS ConceptScheme) ersetzt, die Disjunktheit von SKOS-Eigenschaften wird validiert
- Übersetzung der zugrunde liegenden Ontologien - Datenbeschreibungsontologie, TermIt-Ontologie - aus dem Tschechischen ins Englische (einschließlich IRIs, z. B. `http://onto.fel.cvut.cz/ontologies/application/termit/pojem/administrátor-termitu` => `http://onto.fel.cvut.cz/ontologies/application/termit/administrator`)
- Veraltete Unterstützung für Arbeitsbereiche entfernt
- Unterstützung für die Verwaltung der bevorzugten Namespace-URI und des Präfixes eines Vokabulars hinzugefügt
- Unterstützung für die Änderung des Benutzernamens hinzugefügt
- Der Excel-Export enthält nun externe Oberbegriffe des Begriffs
- Möglichkeit zur Angabe verwandter Vokabulare - diese werden zur Vorfilterung von Begriffen für Selektoren wie relatedMatch und exactMatch verwendet (kann überschrieben werden)
- Korrekturen in der Volltextsuche, verbesserte Leistung
- Verbesserungen in der Tabellenansicht des Vokabulars
- Aktualisierung der Abhängigkeiten

#### Version 4.5.2

- Sicherheitsaktualisierungen für Abhängigkeiten.

#### Version 4.5.1

- Tabellenähnliche Ansicht eines Vokabulars hinzugefügt.
- Sicherheitsaktualisierungen für Abhängigkeiten.

#### Version 4.5.0

- Volltextsuche in die facettierte Suche integriert.

#### Version 4.4.3

- Problem beim Entfernen zusätzlicher Eigenschaftswerte behoben.

#### Version 4.4.2

- Problem beim Speichern von Begriffen behoben, das durch einen Referenzzyklus zwischen Begriffen verursacht wurde.

#### Version 4.4.1

- Problem beim Aktualisieren des Begriffbaums nach dem Import von Vokabularinhalten behoben.
- Problem bei der Anzeige von Begriffen mit mehreren Oberbegriffen im Begriffbaum behoben.
- Robustheit des MS-Excel- und SKOS-Imports verbessert.
- Software Bill of Materials (SBOM) hinzugefügt - Link in der Administration.

#### Version 4.4.0

- Unterstützung für Personal Access Tokens - PATs hinzugefügt.
- Unterstützung für Prometheus-Metriken und Monitoring mit Prometheus + Grafana hinzugefügt. Java-Melody-Monitoring wurde entfernt.
- Barrierefreiheit der Benutzeroberfläche (a11y) verbessert.
- Unterstützung für das Entfernen schreibgeschützter Vokabulare (mit ausreichenden Rechten).

#### Version 4.3.0

- Zugriff auf Dokumentensicherungen bereitgestellt, einschließlich Unterstützung für deren Download und Wiederherstellung.
- Unterstützung für die Annotation von Beziehungen zwischen Begriffen (mithilfe benutzerdefinierter Attribute). Die Daten werden als RDF-star gespeichert.
- Facettierte Suche um Unterstützung für Annotationen von Begriffsbeziehungen erweitert.

#### Version 4.2.0

- Unterstützung für die Verwendung eines SPARQL-Endpunkts zum Importieren von Vokabularen (schreibgeschützt) hinzugefügt.
- Verweise auf Oberbegriffe aus importierten Vokabularen in importierten Excel-Dateien erlaubt.
- Unterstützung für die Zuordnung mehrerer Spalten zu einem Attribut in importierten Excel-Dateien.
- Speicherplatzeffizienz von Dateisicherungen verbessert.
- Layout der facettierten Suche verbessert, Verwendung benutzerdefinierter Attribute in der facettierten Suche ermöglicht.
- Deutsche Übersetzung der Benutzeroberfläche hinzugefügt.

#### Version 4.1.0

- Unterstützung für das Festlegen der Primärsprache auf Vokabularebene hinzugefügt.
- Unterstützung für benutzerdefinierte Attribute hinzugefügt.
- Unterstützung für die Anzeige von Begriffen in Selektoren als flache Liste statt als Baum.
- Unterstützung für die Sprachauswahl in der Volltextsuche.

#### Version 4.0.1

- Problem behoben, bei dem Dokumentdateien verschwanden, nachdem eine neue Datei hinzugefügt wurde.

#### Version 4.0.0

- Keine funktionalen Änderungen; es gab Änderungen an der Infrastruktur - WAR-Deployment wird nicht mehr unterstützt,
  die Validierung wurde in einen separaten Dienst ausgelagert.

#### Version 3.5.1

- Problem beim Löschen eines Begriffs mit unbestätigten Vorkommen in anderen Assets behoben.
- Leistung durch Erhöhung der Cache-Größe verbessert.

#### Version 3.5.0

- Unterstützung für das Deaktivieren der öffentlichen Ansicht hinzugefügt.
- Unterstützung für die Verwaltung anonymen Zugriffs auf ein Vokabular über ACL hinzugefügt.
- Verarbeitung von Begriffsvorkommen verbessert - die Textanalyse einer erneut hochgeladenen Datei verwendet nun bestehende Begriffsvorkommen wieder.
- Verschiedene Leistungsverbesserungen.

#### Version 3.4.0

- Unterstützung für Löschprotokolle von Begriffen hinzugefügt. Löschereignisse von Begriffen werden auch im Aktivitätsdiagramm des Vokabulars angezeigt.
- Unterstützung für Filterung in der Änderungshistorie hinzugefügt.
- Unterstützung für das Speichern und Annotieren von Dateien in mehreren Sprachen hinzugefügt.
- Unterstützung für den Import von Begriffsübersetzungen aus einer MS-Excel-Datei hinzugefügt.

#### Version 3.3.0

- Möglichkeit hinzugefügt, annotierte Dateien ohne unbestätigte Vorkommen herunterzuladen.
- Volltextsuche erweitert - sie zeigt nun Informationen darüber an, in welchem Attribut ein Treffer gefunden wurde.
- Unterstützung für die Filterung nach Beispiel (`skos:example`) in der facettierten Suche hinzugefügt.

#### Version 3.2.0

- Unterstützung für den Import eines Vokabulars aus MS Excel hinzugefügt.
- Leistung wiederholter Begriffsannotation und Vokabularvalidierung optimiert.
- Verbesserungen der Annotator-Benutzeroberfläche; Vorkommen eines ausgewählten Typs können nun ausgeblendet werden.
- Unterstützung für das Deaktivieren der Generierung von Identifikatoren mit Akzentzeichen.

#### Version 3.1.3

- Einladungsgestützte Registrierung neuer Konten hinzugefügt (der Administrator muss das Passwort des Benutzers nicht mehr festlegen).
- Lesen von Begriffen ohne Label in der primären Instanzsprache erlaubt.
- Festlegen mehrsprachiger Labels und Kommentare für neue Eigenschaften erlaubt.
- Fehlerbehebungen, Aktualisierung von Abhängigkeiten.

#### Version 3.1.2

- Passwortwiederherstellung hinzugefügt.
- Fehlerbehebungen.

#### Version 3.1.1

- Fehlerbehebungen, Aktualisierung von Abhängigkeiten.

#### Version 3.1.0

- Möglichkeit hinzugefügt, Vorkommen des ausgewählten Begriffs im Annotator hervorzuheben.
- Verbesserungen bei der wiederholten Dokumentannotation - genehmigte Vorkommen werden auch dann beibehalten, wenn sich der Dokumentinhalt ändert (bis zu
  einem gewissen Grad).
- Visualisierung von Begriffsvorkommen im Annotator geändert.
- Akzente beim Filtern in Tabellen ignorieren.
- Fehlerbehebungen, Aktualisierung von Abhängigkeiten.

#### Version 3.0.4

- Kleinere Fehlerbehebungen.

#### Version 3.0.3

- Unterstützung für mehrsprachige Vokabularattribute hinzugefügt.
- Leistung wiederholter Dokumentannotation verbessert.

#### Version 3.0.2

- Unterstützung für den Betrieb mit einem externen Authentifizierungsdienst hinzugefügt.
- Unterstützung für die Bereitstellung von Dateien mit benutzerdefinierten Taxonomien für Begriffsstatus/-typen hinzugefügt.

#### Version 3.0.1

- Problem beim Festlegen von exact-match-Begriffen behoben.
- Technische Verbesserungen innerhalb von TermIt.

#### Version 3.0.0

- Entwurfsstatus von Begriffen durch Unterstützung für eine Menge von Statusoptionen ersetzt.
- Mehrere ungenutzte/defekte Funktionen entfernt.
- Erforderliche Java-Plattformversion aktualisiert.

#### Version 2.18.0

- Facettierte Begriffssuche implementiert.
- Link zur generierten REST-API-Dokumentation in der Seitenfußzeile hinzugefügt.
- Effizientere Ermittlung von Asset-Labels.

#### Version 2.17.0

- Unterstützung für Benutzergruppen hinzugefügt.
- Vokabular-Zugriffskontrolle basierend auf Benutzern, Benutzergruppen und Benutzerrollen implementiert.
- OpenAPI-REST-API-Dokumentation ist nun für jedes Deployment verfügbar.
- Fehlerbehebungen.

#### Version 2.16.3

- Fehlerbehebungen.

#### Version 2.16.2

- Fehlerbehebungen.
- Erste Implementierung der Benutzergruppenverwaltung (wird in der Vokabular-Zugriffsverwaltung verwendet werden).

#### Version 2.16.1

- Zusätzliche Eigenschaftswerte, die URLs darstellen, werden nun als externe Links angezeigt.
- Interne technologische Verbesserungen.

#### Version 2.16.0

- Der Excel-Export erstellt nun Tabellenblätter für einzelne Sprachen, die in einem Vokabular verwendet werden.
- Möglichkeit hinzugefügt, eine Datei in ihrer aktuellen Version und in der ursprünglich in TermIt hochgeladenen Version herunterzuladen.
- Kleinere Korrekturen, verbesserte Annotator-Leistung (das Dokument wird nun nicht mehr neu geladen, nachdem ein Begriffsvorkommen
  erstellt/bestätigt wurde).

#### Version 2.15.0

- SKOS-Export um vollständigen Export erweitert (alle Begriffsattribute). Excel-Export ebenfalls erweitert.
- SKOS-Reimport bewahrt nun Dokumentverweise.

#### Version 2.14.1

- Keine E-Mail-Benachrichtigung über Kommentaränderungen senden, wenn keine Änderungen vorhanden sind.
- Bearbeitung von Dokument- und Dateilabels erlauben.

#### Version 2.14.0

- Paging für aktuelle Kommentare und Änderungen auf dem Dashboard erlauben, neue Einträge seit dem letzten Besuch hervorheben.
- Änderungshistorie eines Snapshots anzeigen.
- Wöchentliche Benachrichtigungen über neue und aktualisierte Kommentare an Administratoren und Vokabularersteller senden.
- Unterstützung für den Export von Glossaren in RDF/XML hinzufügen.
- Grundlegende Begriffsattribute um skos:notation und skos:example erweitern.
- CSV-/Excel-Export mit grundlegendem SKOS-Export harmonisieren - exportierte Attribute.

#### Version 2.13.0

- Benutzeroberfläche zum Anzeigen und Verwalten von Vokabular- und Begriffssnapshots implementiert.
- Unterstützung dafür hinzugefügt, nur eine Teilmenge von Vokabularen zur Bearbeitung zu öffnen.
- Unterstützung für das Speichern von Vokabularen in Repository-Kontexten hinzugefügt, die durch eine andere IRI als die Vokabular-IRI identifiziert werden.

#### Version 2.12.1

- Attribute von Begriffssnapshots in der öffentlichen TermIt-API erweitert.
- Layout des Editors für Nicht-SKOS-Attribute verbessert.

#### Version 2.12.0

- Unterstützung für Snapshots von Vokabularen (und deren Inhalten) hinzugefügt. Snapshots repräsentieren den Zustand eines Vokabulars zum
  Zeitpunkt der Erstellung des Snapshots. Diese Funktion liegt derzeit hauptsächlich im Backend; die Benutzeroberfläche unterstützt nur die
  Erstellung von Snapshots.

#### Version 2.11.3

- Problem beim Import von SKOS-Glossaren behoben.
- Leistung der Vokabulardetailansicht verbessern.
- Problem beim Aktualisieren inferierter Begriffsbeziehungen behoben.

#### Version 2.11.2

- Styling-Konflikte beim Markdown-Rendering behoben.
- Vereinheitlichung der Stile der Vokabular-Importkomponente.
- Layout der Asset-Historientabelle korrigiert.
- Entwurfsstatus von Begriffen in der FTS-Ergebnistabelle anzeigen.
- Backend-Leistungs- und Stabilitätskorrekturen.

#### Version 2.11.1

- Unterstützung für Markdown-Formatierung von Begriffsdefinition und Verwendungshinweis sowie Vokularbeschreibung hinzufügen.
- Begriffsstatus (Entwurf/bestätigt) im Begriffsdetail anzeigen. Direktes Umschalten erlauben.
- Laden der Liste aller Begriffe in einem Vokabular optimieren.

#### Version 2.11.0

- Allgemeine Unterstützung für Ressourcenverwaltung aus der Open-Source-Version entfernt.
- Anzeige der Versionsinformationen in Docker-Deployments korrigiert.

#### Version 2.10.0

- Filterung der Volltext-Begriffssuche nach Vokabularen unterstützen.
- Zugriff auf verwandte Begriffe in der öffentlichen Begriffs-API unterstützen.
- Entfernen eines Begriffs korrigieren, nachdem seine Definitionsquelle aus dem Dokument entfernt wurde.

#### Version 2.9.0

- Whitelist nicht zugeordneter Eigenschaften, die in der Begriffsdetailantwort der öffentlichen API enthalten sind.
- Mehrere nicht zugeordnete Eigenschaftswerte werden auf dem Begriffsdetailbildschirm alphabetisch sortiert.
- Korrektur für exact matches, related matches und Oberbegriffe, die gelegentlich nicht angezeigt wurden.

#### Version 2.8.0

- Benutzeroberfläche für verwandte Begriffe vereinfacht.
- Erweiterung des SKOS-Exports implementiert, die den Export eines Glossars einschließlich Begriffen aus anderen Vokabularen ermöglicht, die
  im Glossar referenziert werden.
- Entfernen von Dateien mit Begriffsvorkommen optimiert.
- Probleme bei der Verarbeitung verschiedener Arten von Akzenten und Apostrophen in Annotace behoben.

#### Version 2.7.0

- SKOS-Importfunktionalität verbessern.
- Korrekten Export von related/relatedMatch-Begriffen sicherstellen.
- exactMatch, related und relatedMatch in der öffentlichen REST-API unterstützen.
- Anzeigen, wenn die maximale Größe hochgeladener Dateien überschritten wird.
- Probleme bei der Verwendung des Annotators in Firefox beheben.

#### Version 2.6.0

- Unterscheidung von Begriffen aus verschiedenen Vokabularen durch ein Badge.
- Ein Vokabular enthält ein Badge mit der Anzahl seiner Begriffe.
- SKOS-Import überarbeitet und erweitert.
- Fehlerbehebungen.

#### Version 2.5.1

- Verwendung von skos:broadMatch statt skos:broader für einen Link zu einem anderen Vokabular.
- Kleinere Fehlerbehebungen.

#### Version 2.5.0

- Unterstützung für SKOS related, relatedMatch und exactMatch implementiert.
- Kleinere Fehlerbehebungen.

#### Version 2.4.1

- Formulare überarbeitet (Feldhilfe wird nun bei Bedarf in Popups angezeigt).
- Verbesserungen in der Annotator-Benutzeroberfläche.
- Anwendungsinfrastruktur vereinfacht.
- Kleinere Fehlerbehebungen.

#### Version 2.4.0

- Widget mit Kommentaren zum Dashboard hinzugefügt.
- Der Annotator zeigt nun das zur Annotation des Dateiinhalts verwendete Vokabular an und erlaubt die Auswahl eines Vokabulars für die Textanalyse.

#### Version 2.3.1

- Probleme beim Aufruf der Textanalyse in Docker sowie beim Arbeiten mit Dateiinhalten behoben.
- Probleme mit der öffentlichen Ansicht behoben (abgelaufene JWT, Anzeige von Definitionen).
- Begriffsermittlung optimiert.

#### Version 2.3.0

- Unterstützung für Diskussionen zu Begriffen hinzugefügt (nur angemeldete Benutzer).
- Unterstützung für Benutzerrollen und grundlegende Autorisierung hinzugefügt. Benutzer können eingeschränkte Rechte (nur Anzeigen und Kommentieren),
  volle Rechte (Anzeigen und Bearbeiten) oder Administratorrechte haben.
- Administrator kann Rollen von Benutzern ändern.
- Standard-Administratorkonto wird beim Start nicht mehr erzeugt, wenn bereits ein anderer Administrator existiert.

##### Version 2.2.0

- Beziehung zwischen Vokabularen und Dokumenten überarbeitet.
- Verarbeitung von Begriffsdefinitionsquellen in Dokumenten verbessert.
- Neue filterbare Tabelle mit Paging für die Anzeige von Ressourcen- und Vokabularlisten verwenden.
- Mehrsprachige Begriffsbeschreibung (skos:scopeNote) unterstützen.

##### Version 2.1.3

- Seitentitel ändert sich nun basierend auf der Navigation (erleichtert die Suche in der Historie).
- Problem beim Aufruf der Textanalyse für die Definition eines neuen Begriffs behoben.
- Inkonsistentes Verhalten des Datei-Upload-Formulars behoben.
- Falsche Visualisierung des Validierungsscores eines neuen Begriffs behoben.

##### Version 2.1.2

- Vokabular- und Ressourcenlisten überarbeiten - pageable und filterbare Tabelle verwenden.
- Probleme bei der Identifikatorgenerierung beheben.
- Abruf der Validierungsergebnisse verbessern.
- Weitere Fehlerbehebungen.

##### Version 2.1.1

- Benutzeroberfläche der Suchergebnisse verbessert
- Kleinere Frontend-Probleme behoben

##### Version 2.1.0

- Unterstützung für SKOS altLabel und hiddenLabel hinzugefügt.
- Unterstützung für mehrsprachige Begriffsattribute hinzugefügt.
- Validierung der Begriffsqualität in einem Vokabular + Visualisierung der Ergebnisse implementiert.
- Docker-Unterstützung implementiert.

##### Version 2.0.0

- Neugestaltung der Benutzeroberfläche.
- Unterstützung für die Zuweisung mehrerer Oberbegriffe zu einem Begriff hinzugefügt.
- Annotator optimiert.
- Weitere SKOS-ifizierung des Modells.
- Schreibgeschützte Ansicht ohne Anmeldung zum Durchsuchen von Vokabularen und Begriffen hinzugefügt.

##### Version 1.3.0

- Unterstützung für die Verbindung eines Begriffs mit der Quelle seiner Definition in einer Datei implementiert.
- Möglichkeit hinzugefügt, über Definitionen oder ontologische Beziehungen verwandte Begriffe zu entdecken.
- Begriffe visualisieren, die zur Annotation keiner Ressource verwendet werden.
- Unterstützung für die Erstellung neuer Benutzer in der Administration implementiert.

##### Version 1.2.1

- Unterstützung für die Aktualisierung von Ressourcenmetadaten hinzugefügt.
- Unterstützung für Benutzerverwaltung und Bearbeitung von Benutzerprofilen hinzugefügt.
- Deaktivierung der freien Registrierung in der Anwendung erlauben.
- Unterstützung für die Erstellung von Dokumentvokabularen implementiert.
- Zahlreiche Fehlerbehebungen und Codeverbesserungen.
- Von DC Elements auf DC Terms in den relevanten Teilen des ontologischen Modells umgestellt.

##### Version 1.2.0

- Unterstützung für Vokabularabhängigkeiten hinzugefügt (Vokabular importiert andere Vokabulare).
- Begriffe können nun einen Oberbegriff (skos:broader) aus Vokabularen haben, die vom Eigentümer-Vokabular des Begriffs importiert wurden.
- Download des Inhalts einer zuvor in TermIt hochgeladenen Datei erlauben.
- Genauigkeit der Volltextsuche verbessert.

##### Version 1.1.2

- Implementierung des Dateiinhalt-Uploads.
- Unterstützung für die Auswahl eines Vokabulars für die Textanalyse.
- Attribut skos:definition zu Begriffen hinzugefügt.
- In Dateiinhalten vorkommende Begriffe automatisch der Datei zuweisen (basierend auf Textanalyse).
- Quellcode auf [GitHub](https://github.com/kbss-cvut) veröffentlicht.

##### Version 1.1.1

- Legende im Dateiinhalt-Annotator anzeigen.
- Hierarchische Ressourcenlistenvisualisierung.
- Einer Ressource zugewiesene und in ihr vorkommende Begriffe anzeigen.
- Ressourcen anzeigen, denen ein Begriff zugewiesen ist oder in denen er vorkommt.

##### Version 1.1.0

- Leistungsoptimierungen.
- Kleinere Fehlerbehebungen.

##### Version 1.0.0

- Unterstützung für Ressourcenverwaltung und Zuweisung von Begriffen zu Ressourcen.
- Erstellung neuer Begriffe basierend auf der Ausgabe der Textanalyse.
- Anwendungs-Dashboard überarbeitet.
- Unterstützung für das Anhängen beliebiger Eigenschaften außerhalb des Anwendungsmodells an Begriffe und Vokabulare.

##### Version 0.4.0

- Glossar nach CSV/Excel exportieren.
- Volltextsuche-Unterstützung.
- Genauigkeit der Textanalyseergebnisse verbessert.
