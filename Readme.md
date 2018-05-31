# nightscout-ps1
[![Build Status](https://travis-ci.org/TooTallNate/nightscout-ps1.svg?branch=master)](https://travis-ci.org/TooTallNate/nightscout-ps1)

A daemon that periodically syncs the latest two entries from Nightscout to
a file the can be consumed by your command line prompt (a.k.a. [`$PS1`][ps1]).

![](https://user-images.githubusercontent.com/71256/40580173-57716ae8-60ee-11e8-8afa-644c198748fa.png)

## Installation

Preferred installation is by downloading a pre-compiled binary for your platform:

* [GitHub Releases](https://github.com/TooTallNate/nightscout-ps1/releases/latest)

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
| `--cache-file`/`-c` | Path to write the latest reading file.<br>Must end in `.env` or `.json`, and may be specified more than once.<br>Defaults to `~/.nightscout-ps1.env`. |
| `--nightscout`/`-n` | URL of your Nightscout deployment.                                   |

### Setup on macOS

```bash
cp config/bash.sh ~/.nightscout-ps1
cp service/io.n8.nightscout-ps1.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/io.n8.nightscout-ps1.plist
```

Then see [Configuring your `PS1`][config] below.


### Setup on Linux

```bash
cp config/bash.sh ~/.nightscout-ps1
cp service/nightscout-ps1.service /etc/systemd/system/
sudo systemd start nightscout-ps1
sudo systemd enable nightscout-ps1
```

Then see [Configuring your `PS1`][config] below.

### Setup on Windows

Check out this blog post by [Scott Hanselman](https://twitter.com/shanselman) to
setup as a Windows Service:

> [Visualizing your real-time blood sugar values AND a Git Prompt on Windows PowerShell and Linux Bash](https://www.hanselman.com/blog/VisualizingYourRealtimeBloodSugarValuesANDAGitPromptOnWindowsPowerShellAndLinuxBash.aspx)


## Configuring your `PS1`

The files in the `config` directory include pre-configured functions for reading
the cache files created by `nightscout-ps1`.

For example, to consume the bash function in your `.bashrc` file, add something
like:

```bash
source ~/.nightscout-ps1

export PS1="\$(nightscout_ps1) \$ "
```

Be sure to add further customizations to your `PS1` to your liking!


## Formats

The `--cache-file`/`-c` flag determines how to format the output file based on the
file extension. These are the supported format types:

### `.env`

Formatted with `key=value` pairs that may be `source` or `eval`'d in a shell
script (i.e. your `.bashrc` file). [_Example_](examples/nightscout-ps1.env).

### `.json`

Formatted as a JSON file, which may consumed by `jq` or other related tools.
[_Example_](examples/nightscout-ps1.json).

[config]: #configuring-your-ps1
[ps1]: https://en.wikipedia.org/wiki/Command-line_interface#Command_prompt
