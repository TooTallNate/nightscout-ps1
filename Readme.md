# nightscout-ps1

A daemon that periodically syncs the latest two entries from Nightscout to
a file the can be consumed by your command line prompt (a.k.a. `$PS1`).

## Installation

Preferred installation is by downloading a pre-compiled binary for your platform:

* [GitHub Releases](https://github.com/TooTallNate/nightscout-ps1/releases)

If there is no binary for your platform, or you would simply like to install
from source, you may install from the `npm` registry:

```bash
$ npm install -g nightscout-ps1
```


## Usage

The flags for usage of `nightscout-ps1` are listed here, however it is highly
recommended that you set up the daemon as a "service" for your operating system.

```bash
$ nightscout-ps1 -n <Nightscout URL> -c ~/.nightscout-ps1.env
```

| Flag                |  Description                                                         |
|---------------------|----------------------------------------------------------------------|
| `--cache-file`/`-c` | Path to write the latest reading file. Must end in `.env` or `.json` |
| `--nightscout`/`-n` | URL of your Nightscout deployment                                    |


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
