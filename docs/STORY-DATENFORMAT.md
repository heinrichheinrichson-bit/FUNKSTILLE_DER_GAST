# Story-Datenformat

Version 1

## Ziele

- Dialog und Spiellogik bleiben getrennt von der UI.
- Übergänge sind automatisiert prüfbar.
- Bedingungen werden nicht als frei formulierter Programmtext gespeichert.
- Jede Zustandsänderung verwendet einen registrierten State.
- Wartezeiten bleiben zentral skalierbar.

## Node

```json
{
  "id": "k1_001_signal",
  "chapter": 1,
  "delaySeconds": 0,
  "messages": [
    { "speaker": "mira", "text": "Hallo?" }
  ],
  "choices": [
    {
      "id": "check_self",
      "label": "Ich kann dich lesen. Bist du verletzt?",
      "next": "k1_010_check_self",
      "requires": [],
      "effects": []
    }
  ]
}
```

## Bedingungen

Eine Bedingung besitzt `state`, `operator` und `value`.

Erlaubte Operatoren:

- `eq`
- `neq`
- `gt`
- `gte`
- `lt`
- `lte`

Beispiel:

```json
{ "state": "trust_aksel", "operator": "gte", "value": 1 }
```

Mehrere Bedingungen innerhalb von `requires` werden mit UND verknüpft. Alternative Choices bilden ODER-Fälle ab. Dadurch bleibt die Auswertung einfach und sichtbar.

## Effekte

Erlaubte Operationen:

- `set`
- `add`

```json
{ "state": "trust_mira", "operation": "add", "value": 1 }
{ "state": "player_tone", "operation": "set", "value": "supportive" }
```

Integerwerte werden beim Anwenden auf Minimum und Maximum des Schemas begrenzt.

## Automatische Übergänge

Ein Node ohne Auswahl kann `next` verwenden:

```json
{
  "next": "k1_030_identity",
  "nextDelaySeconds": 20
}
```

## Verdeckte zustandsabhängige Weiterleitungen

`redirects` werden beim Betreten eines Nodes der Reihe nach geprüft. Die erste
passende Weiterleitung wird ausgeführt, ohne eine Antwortoption anzuzeigen.
Damit lassen sich interne Konsequenzen auflösen, ohne den Spieler über
verdeckte Zustände zu informieren.

```json
{
  "id": "k3_001_resolve_aksel",
  "messages": [],
  "redirects": [
    {
      "requires": [
        { "state": "first_route", "operator": "eq", "value": "labor" }
      ],
      "effects": [
        { "state": "aksel_state", "operation": "set", "value": "infected" }
      ],
      "next": "k3_010_window"
    },
    {
      "requires": [],
      "effects": [],
      "next": "k3_010_window"
    }
  ]
}
```

Die letzte Weiterleitung sollte in der Regel keine Bedingungen besitzen und als
Fallback dienen. Redirects dürfen keine sichtbaren Nachrichten enthalten.

## Textvarianten

Varianten ergänzen oder ersetzen Nachrichten anhand strukturierter Bedingungen:

```json
{
  "variants": [
    {
      "requires": [
        { "state": "aksel_intro_context", "operator": "eq", "value": "observed" }
      ],
      "appendMessages": [
        { "speaker": "mira", "text": "Nicht Ruß. Bohrstaub." }
      ]
    }
  ]
}
```

Varianten dürfen Darstellung ändern, aber keine versteckten Effekte auslösen. Spielzustände ändern sich ausschließlich durch Node- oder Choice-Effekte.

## Freie Codeeingaben

Ein Node kann eine bereits vorhandene Choice durch ein Eingabefeld auslösen.
Die Choice bleibt die einzige Quelle für Übergang und Effekte; `input` beschreibt
nur die zulässigen Schreibweisen:

```json
{
  "input": {
    "kind": "code",
    "prompt": "Sende Mira den vierstelligen Zugangscode.",
    "placeholder": "••••",
    "answers": ["0414", "14.04", "1404"],
    "choiceId": "thal_code",
    "errorText": "ZUGANG VERWEIGERT"
  }
}
```

Leerzeichen, Bindestriche, Punkte und Unterstriche werden beim Vergleich
ignoriert. Die zugehörige Choice darf weiterhin Voraussetzungen besitzen, damit
ein erratener Code keinen Fund vortäuscht, den der Spieler nie gemacht hat.

## Enden

Ending-Nodes besitzen statt `next`:

```json
{ "ending": "ending_whiteout" }
```

Ending-IDs werden in einer späteren `endings.json` registriert. Ein Validator prüft unbekannte IDs.

## IDs

- Kapitelnode: `k<kapitel>_<laufnummer>_<kurzname>`
- Choice: innerhalb des Nodes eindeutiger kurzer Name
- State: englisches `snake_case`
- Ending: `ending_<kurzname>`

Veröffentlichte IDs werden nicht umbenannt. Der angezeigte Text darf jederzeit geändert werden.
