# nightscout-ps1

<img width="245" src="https://user-images.githubusercontent.com/71256/34074189-a4a58b6e-e25e-11e7-8368-b12e684fdd04.png">

Periodically syncs the latest entry from Nightscout to an eval-able file,
so that you can include your latest blood glucose entry in your terminal
prompt (also known as the `$PS1` variable).

The trend and target high/low values are also provided, so that you may
render arrows and colors as desired:

<img width="77" src="https://user-images.githubusercontent.com/71256/34065696-98696f46-e1b9-11e7-9e7e-b59386fc8bcf.png">

### Installation

Preferred installation is by downloading a pre-compiled binary for your platform:

* [GitHub Releases](https://github.com/TooTallNate/nightscout-ps1/releases)

If there is no binary for your platform, or you would simply like to install
from source, do so from `npm`:

```bash
$ npm install -g nightscout-ps1
```

### Configure your `$PS1`

As a programmer, your `$PS1` is a highly intimate thing which you should take some
time to create a setup that is pleasing to you. After all, you are staring at it
all day. That said, how you _use_ the `nightscout-ps1` variables is up to you!
However, for convenience, the setup from the screenshots above is included here as
well. OK, on to the technical stuff.

The main key is to `eval` the `~/.bgl-cache` file in a function which gets
executed in the `$PS1`. The cache file looks something like:

```bash
local nightscout_ts="1513457266000"
local nightscout_bgl="104"
local nightscout_trend="FortyFiveDown"
local nightscout_target_top="180"
local nightscout_target_bottom="80"
local nightscout_mgdl="104"
local nightscout_mills="1513457266000"
local nightscout_device="share2"
local nightscout_direction="FortyFiveDown"
local nightscout_scaled="104"
```

To achieve a setup similar to the screenshots above, include the code below as a
starting point. Typically you define your `$PS1` in your `.bashrc`, `.profile`,
or other similar files that get executed every time a shell session is started.

```bash
RED="$(tput setaf 1 2>/dev/null || echo '')"
GREEN="$(tput setaf 2 2>/dev/null || echo '')"
YELLOW="$(tput setaf 3 2>/dev/null || echo '')"
NO_COLOR="$(tput sgr0 2>/dev/null || echo '')"

function __ps1_bgl {
  eval "$(cat ~/.bgl-cache)"

  local trend="?"
  case "${nightscout_trend}" in
    DoubleUp) trend="⇈";;
    SingleUp) trend="↑";;
    FortyFiveUp) trend="↗";;
    Flat) trend="→";;
    FortyFiveDown) trend="↘";;
    SingleDown) trend="↓";;
    DoubleDown) trend="⇊";;
  esac

  if [ "${nightscout_bgl}" -ge "${nightscout_target_top}" ]; then
    printf "\001${YELLOW}\002"
  elif [ "${nightscout_bgl}" -le "${nightscout_target_bottom}" ]; then
    printf "\001${RED}\002"
  else
    printf "\001${GREEN}\002"
  fi
  printf "%03d %s" "${nightscout_bgl}" "${trend}"
  printf "\001${NO_COLOR}\002"
}

export PS1="\$(__ps1_bgl) $ "
```

Remember to customize the `$PS1` further as you like! Restart your shell
session, or `source` the file again to see the changes in effect.


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

Check out this blog post by [Scott Hanselman](https://twitter.com/shanselman)
to setup for Bash on Windows and PowerShell:

* [Visualizing your real-time blood sugar values AND a Git Prompt on Windows
  PowerShell and Linux
  Bash](https://www.hanselman.com/blog/VisualizingYourRealtimeBloodSugarValuesANDAGitPromptOnWindowsPowerShellAndLinuxBash.aspx)
