# nightscout-ps1-daemon

Periodically syncs the latest entry from Nightscout to an INI file,
for use with [`nightscout-ps1`][ps1].

### Installation

Preferred installation is by downloading a pre-compiled binary for your platform:

* [GitHub Releases](https://github.com/TooTallNate/nightscout-ps1-daemon/releases)

If there is no binary for your platform, or you would simply like to install
from source, do so from `npm`:

```bash
$ npm install -g nightscout-ps1-daemon
```


### Setup on macOS

```bash
cp service/io.n8.nightscout-ps1.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/io.n8.nightscout-ps1.plist
```


### Setup on Linux

```bash
cp service/nightscout-ps1.service /etc/systemd/system/
sudo systemd start nightscout-ps1
sudo systemd enable nightscout-ps1
```


### Setup on Windows

Check out this blog post by [Scott Hanselman](https://twitter.com/shanselman) to
setup as a Windows Service:

* [Visualizing your real-time blood sugar values AND a Git Prompt on Windows
  PowerShell and Linux
  Bash](https://www.hanselman.com/blog/VisualizingYourRealtimeBloodSugarValuesANDAGitPromptOnWindowsPowerShellAndLinuxBash.aspx)

[ps1]: https://github.com/TooTallNate/nightscout-ps1
