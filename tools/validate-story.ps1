param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$errors = [System.Collections.Generic.List[string]]::new()
$warnings = [System.Collections.Generic.List[string]]::new()

function Add-ValidationError([string]$Message) {
    $script:errors.Add($Message)
}

function Test-StateValue($Definition, $Value, [string]$Context) {
    switch ($Definition.type) {
        'boolean' {
            if ($Value -isnot [bool]) {
                Add-ValidationError "$Context erwartet boolean, erhielt '$Value'."
            }
        }
        'integer' {
            if ($Value -isnot [int] -and $Value -isnot [long]) {
                Add-ValidationError "$Context erwartet integer, erhielt '$Value'."
            }
            elseif (($null -ne $Definition.minimum -and $Value -lt $Definition.minimum) -or
                    ($null -ne $Definition.maximum -and $Value -gt $Definition.maximum)) {
                Add-ValidationError "$Context liegt ausserhalb des erlaubten Bereichs."
            }
        }
        'enum' {
            if ($Definition.values -notcontains $Value) {
                Add-ValidationError "$Context verwendet unbekannten Enum-Wert '$Value'."
            }
        }
        default {
            Add-ValidationError "$Context verwendet unbekannten State-Typ '$($Definition.type)'."
        }
    }
}

function Test-Conditions($Conditions, $States, [string]$Context) {
    $allowedOperators = @('eq', 'neq', 'gt', 'gte', 'lt', 'lte')
    foreach ($condition in @($Conditions)) {
        if ($null -eq $condition) { continue }
        if (-not $condition.state) {
            Add-ValidationError "$Context enthaelt Bedingung ohne State."
            continue
        }
        $definition = $States.PSObject.Properties[$condition.state].Value
        if ($null -eq $definition) {
            Add-ValidationError "$Context referenziert unbekannten State '$($condition.state)'."
            continue
        }
        if ($allowedOperators -notcontains $condition.operator) {
            Add-ValidationError "$Context verwendet unbekannten Operator '$($condition.operator)'."
        }
        Test-StateValue $definition $condition.value "$Context / $($condition.state)"
    }
}

function Test-Effects($Effects, $States, [string]$Context) {
    foreach ($effect in @($Effects)) {
        if ($null -eq $effect) { continue }
        if (-not $effect.state) {
            Add-ValidationError "$Context enthaelt Effekt ohne State."
            continue
        }
        $definition = $States.PSObject.Properties[$effect.state].Value
        if ($null -eq $definition) {
            Add-ValidationError "$Context referenziert unbekannten State '$($effect.state)'."
            continue
        }
        if (@('set', 'add') -notcontains $effect.operation) {
            Add-ValidationError "$Context verwendet unbekannte Operation '$($effect.operation)'."
            continue
        }
        if ($effect.operation -eq 'add' -and $definition.type -ne 'integer') {
            Add-ValidationError "$Context darf 'add' nur auf Integer-States anwenden."
        }
        if ($effect.operation -eq 'set') {
            Test-StateValue $definition $effect.value "$Context / $($effect.state)"
        }
        elseif ($effect.value -isnot [int] -and $effect.value -isnot [long]) {
            Add-ValidationError "$Context erwartet fuer 'add' einen Integer-Wert."
        }
    }
}

$schemaPath = Join-Path $ProjectRoot 'data\state-schema.json'
if (-not (Test-Path -LiteralPath $schemaPath)) {
    throw "State-Schema fehlt: $schemaPath"
}
$schema = Get-Content -LiteralPath $schemaPath -Raw -Encoding UTF8 | ConvertFrom-Json
$states = $schema.states

foreach ($property in $states.PSObject.Properties) {
    Test-StateValue $property.Value $property.Value.default "Default von '$($property.Name)'"
}

$storyFiles = Get-ChildItem -LiteralPath (Join-Path $ProjectRoot 'data') -Filter 'chapter-*.json'
if ($storyFiles.Count -eq 0) {
    throw 'Keine Kapiteldateien gefunden.'
}

foreach ($file in $storyFiles) {
    $document = Get-Content -LiteralPath $file.FullName -Raw -Encoding UTF8 | ConvertFrom-Json
    $nodeMap = @{}

    foreach ($node in $document.nodes) {
        if (-not $node.id) {
            Add-ValidationError "$($file.Name): Node ohne ID."
            continue
        }
        if ($nodeMap.ContainsKey($node.id)) {
            Add-ValidationError "$($file.Name): Doppelte Node-ID '$($node.id)'."
        }
        else {
            $nodeMap[$node.id] = $node
        }
    }

    if (-not $nodeMap.ContainsKey($document.chapter.startNode)) {
        Add-ValidationError "$($file.Name): Startnode '$($document.chapter.startNode)' fehlt."
    }

    foreach ($node in $document.nodes) {
        $context = "$($file.Name) / $($node.id)"
        Test-Effects $node.effects $states "$context / Node-Effekte"

        $terminalCount = 0
        if ($node.next) { $terminalCount++ }
        if ($node.choices.Count -gt 0) { $terminalCount++ }
        if ($node.handoff) { $terminalCount++ }
        if ($node.ending) { $terminalCount++ }
        if ($node.redirects.Count -gt 0) { $terminalCount++ }
        if ($terminalCount -ne 1) {
            Add-ValidationError "$context benoetigt genau einen Ausgangstyp (next, choices, handoff oder ending)."
        }

        if ($node.next -and -not $nodeMap.ContainsKey($node.next)) {
            Add-ValidationError "$context verweist auf fehlenden Next-Node '$($node.next)'."
        }

        foreach ($redirect in @($node.redirects)) {
            if ($null -eq $redirect) { continue }
            if (-not $nodeMap.ContainsKey($redirect.next)) {
                Add-ValidationError "$context verweist auf fehlenden Redirect-Node '$($redirect.next)'."
            }
            Test-Conditions $redirect.requires $states "$context / Redirect"
            Test-Effects $redirect.effects $states "$context / Redirect-Effekte"
        }

        $choiceIds = @{}
        foreach ($choice in @($node.choices)) {
            if ($null -eq $choice) { continue }
            $choiceContext = "$context / Choice '$($choice.id)'"
            if (-not $choice.id) {
                Add-ValidationError "$context enthaelt Choice ohne ID."
            }
            elseif ($choiceIds.ContainsKey($choice.id)) {
                Add-ValidationError "$context enthaelt doppelte Choice-ID '$($choice.id)'."
            }
            else {
                $choiceIds[$choice.id] = $true
            }
            if (-not $nodeMap.ContainsKey($choice.next)) {
                Add-ValidationError "$choiceContext verweist auf fehlenden Node '$($choice.next)'."
            }
            Test-Conditions $choice.requires $states "$choiceContext / Bedingungen"
            Test-Effects $choice.effects $states "$choiceContext / Effekte"
        }

        if ($node.input) {
            if ($node.input.kind -notin @('code', 'text')) {
                Add-ValidationError "$context verwendet unbekannte Eingabeart '$($node.input.kind)'."
            }
            if (-not $node.input.prompt -or ($node.input.kind -eq 'code' -and $node.input.answers.Count -eq 0)) {
                Add-ValidationError "$context benoetigt Prompt und mindestens eine gueltige Eingabe."
            }
            if (-not $choiceIds.ContainsKey($node.input.choiceId)) {
                Add-ValidationError "$context verweist mit der Eingabe auf unbekannte Choice '$($node.input.choiceId)'."
            }
        }

        foreach ($variant in @($node.variants)) {
            if ($null -eq $variant) { continue }
            Test-Conditions $variant.requires $states "$context / Variante"
        }
    }

    $reachable = [System.Collections.Generic.HashSet[string]]::new()
    $queue = [System.Collections.Generic.Queue[string]]::new()
    if ($nodeMap.ContainsKey($document.chapter.startNode)) {
        $queue.Enqueue($document.chapter.startNode)
    }
    while ($queue.Count -gt 0) {
        $id = $queue.Dequeue()
        if (-not $reachable.Add($id)) { continue }
        $node = $nodeMap[$id]
        if ($node.next -and $nodeMap.ContainsKey($node.next)) {
            $queue.Enqueue($node.next)
        }
        foreach ($redirect in @($node.redirects)) {
            if ($null -ne $redirect -and $nodeMap.ContainsKey($redirect.next)) {
                $queue.Enqueue($redirect.next)
            }
        }
        foreach ($choice in @($node.choices)) {
            if ($null -eq $choice) { continue }
            if ($nodeMap.ContainsKey($choice.next)) {
                $queue.Enqueue($choice.next)
            }
        }
    }

    foreach ($id in $nodeMap.Keys) {
        if (-not $reachable.Contains($id)) {
            $warnings.Add("$($file.Name): Node '$id' ist vom Start aus nicht erreichbar.")
        }
    }

    Write-Host ("OK: {0} - {1} Nodes, {2} erreichbar" -f $file.Name, $nodeMap.Count, $reachable.Count)
}

foreach ($warning in $warnings) {
    Write-Warning $warning
}

if ($errors.Count -gt 0) {
    Write-Host ''
    Write-Host "Validierung fehlgeschlagen ($($errors.Count) Fehler):" -ForegroundColor Red
    foreach ($validationError in $errors) {
        Write-Host "  - $validationError" -ForegroundColor Red
    }
    exit 1
}

Write-Host ''
Write-Host "Storydaten gueltig. Warnungen: $($warnings.Count)" -ForegroundColor Green
exit 0
