#POWERSHELL - Put this file in$profile.CurrentUserAllHosts

function prompt {
    Get-Content $ENV:USERPROFILE\.bgl-cache | %{$bgh = @{}} {if ($_ -match "local (.*)=""(.*)""") {$bgh[$matches[1]]=$matches[2].Trim();}}
    $trend = "?"
    switch ($bgh.nightscout_trend)
    {
        "DoubleUp" {$trend="↑↑"}
        "SingleUp" {$trend="↑"}
        "FortyFiveUp" {$trend="↗"}
        "Flat" {$trend="→"}
        "FortyFiveDown" {$trend="↘"}
        "SingleDown" {$trend="↓"}
        "DoubleDown" {$trend="↓↓"}
    }
    $bgcolor = [Console]::ForegroundColor.ToString()
    if ([int]$bgh.nightscout_bgl -ge [int]$bgh.nightscout_target_top) {
        $bgcolor = "Yellow"
    } ElseIf ([int]$bgh.nightscout_bgl -le [int]$bgh.nightscout_target_bottom) {
        $bgcolor = "Red"
    } Else {
        $bgcolor = "Green"
    }

    Write-Host $bgh.nightscout_bgl -NoNewline -ForegroundColor $bgcolor
    Write-Host $trend" " -NoNewline -ForegroundColor $bgcolor
    [Console]::ResetColor()

    $origLastExitCode = $LASTEXITCODE
    Write-Host $ExecutionContext.SessionState.Path.CurrentLocation -NoNewline
    #Add this if you use Posh-Git
    #Write-VcsStatus
    $LASTEXITCODE = $origLastExitCode
    "$('>' * ($nestedPromptLevel + 1)) "
}

#Add this if you use Posh-Git
#Import-Module posh-git
