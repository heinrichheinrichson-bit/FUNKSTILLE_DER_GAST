param(
    [string]$ProjectRoot = (Split-Path -Parent $PSScriptRoot),
    [string]$ChapterFile = 'chapter-01.json',
    [ValidateSet('unset', 'labor', 'generator')]
    [string]$FirstRoute = 'unset',
    [switch]$AkselRestrained,
    [int]$MaximumConfigurations = 50000
)

$ErrorActionPreference = 'Stop'

function Copy-State([hashtable]$State) {
    $copy = @{}
    foreach ($key in $State.Keys) {
        $copy[$key] = $State[$key]
    }
    return $copy
}

function Test-Requirement($Requirement, [hashtable]$State) {
    $actual = $State[$Requirement.state]
    switch ($Requirement.operator) {
        'eq'  { return $actual -eq $Requirement.value }
        'neq' { return $actual -ne $Requirement.value }
        'gt'  { return $actual -gt $Requirement.value }
        'gte' { return $actual -ge $Requirement.value }
        'lt'  { return $actual -lt $Requirement.value }
        'lte' { return $actual -le $Requirement.value }
        default { throw "Unknown operator: $($Requirement.operator)" }
    }
}

function Test-AllRequirements($Requirements, [hashtable]$State) {
    foreach ($requirement in @($Requirements)) {
        if ($null -eq $requirement) { continue }
        if (-not (Test-Requirement $requirement $State)) { return $false }
    }
    return $true
}

function Apply-Effects($Effects, [hashtable]$State, $Definitions) {
    foreach ($effect in @($Effects)) {
        if ($null -eq $effect) { continue }
        $definition = $Definitions.PSObject.Properties[$effect.state].Value
        if ($effect.operation -eq 'set') {
            $State[$effect.state] = $effect.value
        }
        elseif ($effect.operation -eq 'add') {
            $value = [int]$State[$effect.state] + [int]$effect.value
            if ($null -ne $definition.minimum -and $value -lt $definition.minimum) {
                $value = [int]$definition.minimum
            }
            if ($null -ne $definition.maximum -and $value -gt $definition.maximum) {
                $value = [int]$definition.maximum
            }
            $State[$effect.state] = $value
        }
    }
}

function Get-ConfigurationKey([string]$NodeId, [hashtable]$State) {
    $parts = foreach ($key in ($State.Keys | Sort-Object)) {
        "$key=$($State[$key])"
    }
    return "$NodeId|$($parts -join ';')"
}

$schema = Get-Content -LiteralPath (Join-Path $ProjectRoot 'data\state-schema.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$chapterPath = Join-Path (Join-Path $ProjectRoot 'data') $ChapterFile
$chapter = Get-Content -LiteralPath $chapterPath -Raw -Encoding UTF8 | ConvertFrom-Json

$nodes = @{}
foreach ($node in $chapter.nodes) {
    $nodes[$node.id] = $node
}

$initialState = @{}
foreach ($property in $schema.states.PSObject.Properties) {
    $initialState[$property.Name] = $property.Value.default
}
if ($FirstRoute -ne 'unset') {
    $initialState['first_route'] = $FirstRoute
}
if ($AkselRestrained) {
    $initialState['aksel_restrained'] = $true
}

$queue = [System.Collections.Generic.Queue[object]]::new()
$queue.Enqueue([pscustomobject]@{
    NodeId = $chapter.chapter.startNode
    State = $initialState
    Path = @($chapter.chapter.startNode)
})

$visited = [System.Collections.Generic.HashSet[string]]::new()
$deadlocks = [System.Collections.Generic.List[string]]::new()
$terminals = @{}
$longestPath = @()

while ($queue.Count -gt 0) {
    if ($visited.Count -gt $MaximumConfigurations) {
        throw "Configuration limit exceeded ($MaximumConfigurations)."
    }

    $configuration = $queue.Dequeue()
    $node = $nodes[$configuration.NodeId]
    $stateAfterNode = Copy-State $configuration.State
    Apply-Effects $node.effects $stateAfterNode $schema.states

    $key = Get-ConfigurationKey $configuration.NodeId $stateAfterNode
    if (-not $visited.Add($key)) { continue }

    if ($configuration.Path.Count -gt $longestPath.Count) {
        $longestPath = $configuration.Path
    }

    if ($node.handoff) {
        if (-not $terminals.ContainsKey($node.handoff)) { $terminals[$node.handoff] = 0 }
        $terminals[$node.handoff]++
        continue
    }
    if ($node.ending) {
        if (-not $terminals.ContainsKey($node.ending)) { $terminals[$node.ending] = 0 }
        $terminals[$node.ending]++
        continue
    }
    if ($node.next) {
        $queue.Enqueue([pscustomobject]@{
            NodeId = $node.next
            State = $stateAfterNode
            Path = @($configuration.Path + $node.next)
        })
        continue
    }

    $available = @($node.choices | Where-Object {
        Test-AllRequirements $_.requires $stateAfterNode
    })
    if ($available.Count -eq 0) {
        $deadlocks.Add("$($configuration.NodeId): $($configuration.Path -join ' -> ')")
        continue
    }

    foreach ($choice in $available) {
        $nextState = Copy-State $stateAfterNode
        Apply-Effects $choice.effects $nextState $schema.states
        $queue.Enqueue([pscustomobject]@{
            NodeId = $choice.next
            State = $nextState
            Path = @($configuration.Path + $choice.next)
        })
    }
}

Write-Host "Configurations: $($visited.Count)"
Write-Host "Longest path: $($longestPath.Count) Nodes"
Write-Host "Terminals:"
foreach ($terminal in ($terminals.Keys | Sort-Object)) {
    Write-Host "  $terminal : $($terminals[$terminal]) state variants"
}

if ($deadlocks.Count -gt 0) {
    Write-Host ''
    Write-Host "Deadlocks found: $($deadlocks.Count)" -ForegroundColor Red
    foreach ($deadlock in $deadlocks) {
        Write-Host "  $deadlock" -ForegroundColor Red
    }
    exit 1
}

Write-Host ''
Write-Host 'No deadlocks found.' -ForegroundColor Green
exit 0
