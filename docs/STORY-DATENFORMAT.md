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

